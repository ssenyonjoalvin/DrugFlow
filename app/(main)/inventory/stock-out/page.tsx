import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StockOutForm } from "./stock-out-form";

function formatAddedAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export default async function StockOutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const dispensedBy = session.user.name ?? "User";

  const [medicines, recentEntries] = await Promise.all([
    prisma.medicine.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, quantity: true },
    }),
    prisma.stockOutEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { medicine: { select: { name: true } } },
    }),
  ]);

  const entriesForList = recentEntries.map((e) => ({
    id: e.id,
    medicine: e.medicine.name,
    detail: e.reason ?? `Issued ${e.quantity} units`,
    addedAgo: formatAddedAgo(e.createdAt),
    by: e.dispensedBy,
  }));

  return (
    <StockOutForm
      medicines={medicines}
      recentActivity={entriesForList}
      dispensedBy={dispensedBy}
    />
  );
}

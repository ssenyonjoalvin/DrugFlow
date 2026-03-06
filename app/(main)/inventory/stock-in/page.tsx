import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StockInForm } from "./stock-in-form";

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

function formatExpiry(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default async function StockInPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const pageSize = 5;

  const [medicines, totalCount] = await Promise.all([
    prisma.medicine.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.stockInEntry.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const recentEntries = await prisma.stockInEntry.findMany({
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * pageSize,
    take: pageSize,
    include: { medicine: { select: { name: true } } },
  });

  const entriesForTable = recentEntries.map((e) => ({
    id: e.id,
    medicine: e.medicine.name,
    addedAgo: formatAddedAgo(e.createdAt),
    batchNo: e.batchNumber,
    quantity: e.quantity,
    supplier: e.supplier ?? "—",
    expiry: formatExpiry(e.expiryDate),
  }));

  return (
    <StockInForm
      medicines={medicines}
      recentEntries={entriesForTable}
      currentPage={safePage}
      totalPages={totalPages}
      totalCount={totalCount}
      pageSize={pageSize}
    />
  );
}

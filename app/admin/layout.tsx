import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/app/(main)/components/sidebar";
import { DashboardHeader } from "@/app/(main)/components/dashboard-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatarUrl: true },
  });
  const user = { ...session.user, avatarUrl: dbUser?.avatarUrl ?? null };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-100">
      <Sidebar role={session.user.role} user={session.user} />
      <div className="ml-56 flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0">
          <DashboardHeader user={user} />
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

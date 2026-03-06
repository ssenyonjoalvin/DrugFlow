import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Sidebar } from "./components/sidebar";
import { DashboardHeader } from "./components/dashboard-header";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  let avatarUrl: string | null = null;
  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatarUrl: true },
    });
    avatarUrl = dbUser?.avatarUrl ?? null;
  }
  const user = session?.user ? { ...session.user, avatarUrl } : null;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-100">
      <Sidebar role={session?.user?.role} user={session?.user ?? null} />
      <div className="ml-56 flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="shrink-0">
          <DashboardHeader user={user} />
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

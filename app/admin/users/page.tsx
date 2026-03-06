import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SystemUsersTable } from "./system-users-table";
import { AddNewUserTrigger } from "./add-new-user-trigger";

function formatLastActive(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

function roleLabel(role: string): string {
  if (role === "ADMIN") return "Admin";
  if (role === "STOREKEEPER") return "Inventory Manager";
  return "Viewer";
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const usersWithMeta = users.map((u) => ({
    ...u,
    roleLabel: roleLabel(u.role),
    lastActive: formatLastActive(u.createdAt),
    status: "Active" as const,
  }));

  const pageSize = 3;
  const totalUsers = usersWithMeta.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">System Users</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Manage access levels and monitor user activity across the inventory system.
          </p>
        </div>
        <AddNewUserTrigger />
      </div>

      {/* Table */}
      <div className="ms-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <SystemUsersTable users={usersWithMeta} pageSize={pageSize} />
        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50/50 px-4 py-3">
          <p className="text-sm text-zinc-600">
            Showing {Math.min(pageSize, totalUsers)} of {totalUsers} users
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={totalPages <= 1}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-lg border border-zinc-200 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

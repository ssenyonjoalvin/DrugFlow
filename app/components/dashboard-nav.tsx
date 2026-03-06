import Link from "next/link";

type Role = "ADMIN" | "STOREKEEPER" | "VIEWER" | undefined;

export function DashboardNav({ role }: { role?: Role }) {
  return (
    <nav className="flex gap-6">
      <Link href="/dashboard" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
        Dashboard
      </Link>
      {(role === "ADMIN" || role === "STOREKEEPER") && (
        <Link href="/inventory" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
          Inventory
        </Link>
      )}
      <Link href="/reports" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
        Reports
      </Link>
      {role === "ADMIN" && (
        <Link href="/admin" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
          Admin
        </Link>
      )}
    </nav>
  );
}

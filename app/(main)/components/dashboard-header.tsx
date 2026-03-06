"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/dashboard/profile": "Profile",
  "/dashboard/settings": "Settings",
  "/dashboard/settings/categories": "Medicine Categories",
  "/dashboard/settings/unit-measures": "Unit Measures",
  "/inventory": "Medicine Inventory",
  "/inventory/new": "Add New Medicine",
  "/inventory/stock-in": "Stock In Entry",
  "/inventory/stock-in/records": "Stock In Records",
  "/inventory/stock-out": "Stock Out",
  "/inventory/stock-out/logs": "Stock Out Logs",
  "/distribution": "Distribution",
  "/reports": "Reports & Analytics",
  "/admin/users": "User Management",
};

export function DashboardHeader({
  searchPlaceholder = "Search batch or medicine...",
  user,
}: {
  searchPlaceholder?: string;
  user: { name?: string | null; email?: string | null; role?: string; avatarUrl?: string | null } | null;
}) {
  const pathname = usePathname();
  const isInventory = pathname === "/inventory";
  const isInventoryNew = pathname === "/inventory/new";
  const isInventoryPage = isInventory || isInventoryNew;
  const isDashboard = pathname === "/dashboard";
  const isProfile = pathname === "/dashboard/profile";
  const isStockIn = pathname === "/inventory/stock-in";
  const isStockOut = pathname === "/inventory/stock-out";
  const isUserManagement = pathname === "/admin/users";
  const isSettingsSubPage = pathname === "/dashboard/settings/categories" || pathname === "/dashboard/settings/unit-measures";
  const title = pathname in titles ? titles[pathname] : pathname.startsWith("/inventory") ? "Inventory" : pathname.startsWith("/admin") ? "Admin" : "Dashboard Overview";

  if (isInventoryPage) {
    return (
      <header className="flex h-14 shrink-0 items-center border-b border-zinc-200 bg-white px-6">
        <h1 className="text-lg font-semibold text-zinc-800">
          {pathname === "/inventory/new" ? "Inventory / Add New Medicine" : "Inventory"}
        </h1>
      </header>
    );
  }

  if (isSettingsSubPage) {
    return (
      <header className="flex h-14 shrink-0 items-center border-b border-zinc-200 bg-white px-6">
        <h1 className="text-lg font-semibold text-zinc-800">{title}</h1>
      </header>
    );
  }

  if (isStockOut) {
    return (
      <header className="flex h-14 shrink-0 items-center border-b border-zinc-200 bg-white px-6">
        <h1 className="text-lg font-semibold text-zinc-800">Stock Out</h1>
      </header>
    );
  }

  if (isUserManagement) {
    return (
      <header className="flex h-14 shrink-0 items-center border-b border-zinc-200 bg-white px-6">
        <h1 className="text-lg font-semibold text-zinc-800">User Management</h1>
      </header>
    );
  }

  if (isDashboard) {
    return (
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <h1 className="text-lg font-semibold text-zinc-800">Dashboard</h1>
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-50"
        >
          <div className="text-right">
            <div className="text-sm font-medium text-zinc-800">{user?.name ?? "User"}</div>
            <div className="text-xs text-zinc-500">{user?.role === "ADMIN" ? "Administrator" : user?.role === "STOREKEEPER" ? "Inventory Manager" : user?.role ?? "—"}</div>
          </div>
          <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-sm font-medium text-violet-700">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              (user?.name ?? "U").charAt(0).toUpperCase()
            )}
          </div>
        </Link>
      </header>
    );
  }

  if (isProfile) {
    return (
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <h1 className="text-lg font-semibold text-zinc-800">Profile</h1>
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-50"
        >
          <div className="text-right">
            <div className="text-sm font-medium text-zinc-800">{user?.name ?? "User"}</div>
            <div className="text-xs text-zinc-500">{user?.role === "ADMIN" ? "Administrator" : user?.role === "STOREKEEPER" ? "Inventory Manager" : user?.role ?? "—"}</div>
          </div>
          <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-sm font-medium text-violet-700">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              (user?.name ?? "U").charAt(0).toUpperCase()
            )}
          </div>
        </Link>
      </header>
    );
  }

  if (isStockIn) {
    return (
      <header className="flex h-14 shrink-0 items-center border-b border-zinc-200 bg-white px-6">
        <h1 className="text-lg font-semibold text-zinc-800">Stock In Entry</h1>
      </header>
    );
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-zinc-800">{title}</h1>
      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="relative max-w-sm flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            placeholder={pathname === "/admin/users" ? "Search users by name or email..." : searchPlaceholder}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <button type="button" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700" aria-label="Notifications">
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-6-6 6 6 0 00-6 6v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-50"
          >
            <div className="text-right">
              <div className="text-sm font-medium text-zinc-800">{user?.name ?? "User"}</div>
              <div className="text-xs text-zinc-500">{user?.role === "ADMIN" ? "Super Admin" : user?.role === "STOREKEEPER" ? "Inventory Manager" : user?.role ?? "—"}</div>
            </div>
            <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-sm font-medium text-violet-700">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                (user?.name ?? "U").charAt(0).toUpperCase()
              )}
            </div>
          </Link>
        </div>
        <form action="/api/auth/signout" method="POST" className="ml-2">
          <button type="submit" className="text-xs text-zinc-400 hover:text-zinc-600">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}

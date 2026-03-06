"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type Role = "ADMIN" | "STOREKEEPER" | "VIEWER" | undefined;

const navItems: { href: string; label: string; icon: string; roles?: Role[] }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/inventory", label: "Inventory", icon: "boxes", roles: ["ADMIN", "STOREKEEPER"] },
  { href: "/inventory/stock-in", label: "Stock In", icon: "arrow-in", roles: ["ADMIN", "STOREKEEPER"] },
  { href: "/inventory/stock-out", label: "Stock Out", icon: "arrow-out", roles: ["ADMIN", "STOREKEEPER"] },
  { href: "/reports", label: "Reports", icon: "chart" },
  { href: "/admin/users", label: "User Management", icon: "users", roles: ["ADMIN"] },
];

function Icon({ name }: { name: string }) {
  const className = "size-5 shrink-0";
  switch (name) {
    case "grid":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "boxes":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8 4-8-4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case "heart":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case "truck":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1h-1m-1-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-1-1h-1" />
        </svg>
      );
    case "arrow-in":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    case "arrow-out":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3m12 4a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "chart":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case "users":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case "gear":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "logout":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      );
    default:
      return null;
  }
}

export function Sidebar({ role, user }: { role?: Role; user?: { name?: string | null; role?: string } | null }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 flex h-screen w-56 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-100 px-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-violet-600 text-white">
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86 0l-2.386.477a2 2 0 00-1.022.547l-1.211 1.21A2 2 0 016.827 18H4a2 2 0 01-2-2V8a2 2 0 012-2h2.827a2 2 0 001.414-.586l1.21-1.21A2 2 0 0012 14.93a2 2 0 001.022.547l2.387.477a6 6 0 003.86 0l2.386-.477a2 2 0 001.022-.547l1.211-1.21A2 2 0 0017.173 6H20a2 2 0 012 2v8a2 2 0 01-2 2h-2.827a2 2 0 00-1.414.586l-1.21 1.21z" />
          </svg>
        </div>
        <div>
          <div className="font-semibold text-violet-700">Drug Flow</div>
          <div className="text-xs text-zinc-500">Pharmacy</div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          if (item.roles && role && !item.roles.includes(role)) return null;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-violet-50 text-violet-700"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
        <div className="my-2 border-t border-zinc-100 pt-2">
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            System Settings
          </div>
          <div className="mt-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600">
            <Icon name="gear" />
            Settings
          </div>
          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-zinc-200 pl-2">
            <Link
              href="/dashboard/settings/categories"
              className={`block rounded-lg px-2 py-1.5 text-sm ${
                pathname === "/dashboard/settings/categories"
                  ? "bg-violet-600 font-medium text-white"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              Categories
            </Link>
            <Link
              href="/dashboard/settings/unit-measures"
              className={`block rounded-lg px-2 py-1.5 text-sm ${
                pathname === "/dashboard/settings/unit-measures"
                  ? "bg-violet-600 font-medium text-white"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              Unit Measures
            </Link>
          </div>
        </div>
      </nav>
      <div className="border-t border-zinc-100 p-3">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Icon name="logout" />
          Logout
        </button>
      </div>
    </aside>
  );
}

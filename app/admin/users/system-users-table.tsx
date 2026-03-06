"use client";

import Link from "next/link";

const avatarColors = ["bg-zinc-500", "bg-amber-500", "bg-amber-700", "bg-violet-500", "bg-sky-500"];

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  lastActive: string;
  status: "Active" | "Inactive";
};

export function SystemUsersTable({ users, pageSize }: { users: UserRow[]; pageSize: number }) {
  const displayUsers = users.slice(0, pageSize);

  return (
    <table className="min-w-full divide-y divide-zinc-200">
      <thead className="bg-zinc-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">User</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Role</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Status</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Last Active</th>
          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-200 bg-white">
        {displayUsers.map((user, index) => (
          <tr key={user.id} className="hover:bg-zinc-50/50">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white ${avatarColors[index % avatarColors.length]}`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-zinc-800">{user.name}</div>
                  <div className="text-sm text-zinc-500">{user.email}</div>
                </div>
              </div>
            </td>
            <td className="px-4 py-3">
              <span className="inline-flex rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                {user.roleLabel}
              </span>
            </td>
            <td className="px-4 py-3">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {user.status}
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-zinc-600">{user.lastActive}</td>
            <td className="px-4 py-3 text-right">
              <div className="flex justify-end gap-1">
                <Link
                  href={`/admin/users/${user.id}/edit`}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                  aria-label="Edit user"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </Link>
                <button
                  type="button"
                  className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete user"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V7a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

"use client";

import { useActionState } from "react";
import { createUser } from "../actions";

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "STOREKEEPER", label: "Storekeeper" },
  { value: "VIEWER", label: "Viewer" },
] as const;

export default function CreateUserForm() {
  const [state, formAction] = useActionState(createUser, null);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Jane Doe"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="jane@charity.org"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Min. 8 characters"
        />
      </div>
      <div>
        <label htmlFor="role" className="mb-1 block text-sm font-medium text-zinc-700">
          Role
        </label>
        <select
          id="role"
          name="role"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
        >
          Create user
        </button>
        <a
          href="/admin/users"
          className="rounded-md border border-zinc-300 px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

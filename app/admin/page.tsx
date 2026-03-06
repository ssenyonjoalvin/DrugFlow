import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900">Admin</h1>
      <p className="mt-1 text-zinc-600">Manage users and system settings.</p>
      <ul className="mt-6 list-inside list-disc space-y-2 text-zinc-700">
        <li>
          <Link href="/admin/users" className="text-emerald-600 hover:underline">
            Manage users
          </Link>
        </li>
        <li>
          <Link href="/admin/users/new" className="text-emerald-600 hover:underline">
            Create new user
          </Link>
        </li>
      </ul>
    </div>
  );
}

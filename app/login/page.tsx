import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">DrugFlow</h1>
          <p className="mt-1 text-sm text-zinc-500">Medicine inventory for your charity</p>
        </div>
        <Suspense fallback={<div className="text-sm text-zinc-500">Loading…</div>}>
          <LoginForm />
        </Suspense>
        <p className="mt-4 text-center text-xs text-zinc-500">
          No public registration. Contact your administrator for access.
        </p>
      </div>
      <Link
        href="/"
        className="mt-6 text-sm text-zinc-500 underline hover:text-zinc-700"
      >
        Back to home
      </Link>
    </div>
  );
}

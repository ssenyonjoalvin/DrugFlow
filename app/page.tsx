import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4">
      <main className="w-full max-w-md text-center">
        <h1 className="text-3xl font-semibold text-zinc-900">DrugFlow</h1>
        <p className="mt-2 text-zinc-600">Medicine inventory management for your charity.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-md bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700"
        >
          Sign in
        </Link>
      </main>
    </div>
  );
}

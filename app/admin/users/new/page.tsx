import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import CreateUserForm from "./create-user-form";

export default async function AdminCreateUserPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900">Create user</h1>
      <p className="mt-1 text-sm text-zinc-500">Add a new user to the system. Only admins can create users.</p>
      <CreateUserForm />
    </div>
  );
}

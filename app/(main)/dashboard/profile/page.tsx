import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProfileContent } from "./profile-content";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatarUrl: true },
  });

  const user = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    role: session.user.role ?? "VIEWER",
    avatarUrl: dbUser?.avatarUrl ?? null,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <ProfileContent user={user} />
    </div>
  );
}

"use server";

/**
 * Example protected server action:
 * - Validates session via getServerSession(authOptions)
 * - Never trusts client-provided role; uses session.user.role
 * - Restricts mutation to ADMIN only
 * - Validates input and uses server-side only role (validRoles)
 */

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import bcrypt from "bcrypt";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Role } from "@/types/auth";

export type CreateUserState = {
  error?: string;
  success?: boolean;
};

export async function createUser(
  _prevState: CreateUserState | null,
  formData: FormData
): Promise<CreateUserState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "Unauthorized." };
  }
  if (session.user.role !== "ADMIN") {
    return { error: "Only administrators can create users." };
  }

  const name = formData.get("name") as string | null;
  const firstName = formData.get("firstName") as string | null;
  const lastName = formData.get("lastName") as string | null;
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;
  const roleInput = formData.get("role") as string | null;

  const resolvedName = name?.trim() || [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ") || null;
  if (!resolvedName) return { error: "First name and last name are required." };
  if (!email?.trim()) return { error: "Email is required." };
  if (!password) return { error: "Password is required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const validRoles: Role[] = ["ADMIN", "STOREKEEPER", "VIEWER"];
  if (!roleInput || !validRoles.includes(roleInput as Role)) {
    return { error: "Invalid role." };
  }
  const role = roleInput as Role;

  const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (existing) {
    return { error: "A user with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      name: resolvedName,
      email: email.trim(),
      password: hashedPassword,
      role,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { success: true };
}

import bcrypt from "bcrypt";
import { prisma } from "./db";

const DEFAULT_ADMIN_EMAIL = "administrator@localhost";
const DEFAULT_ADMIN_PASSWORD = "password123";

export async function ensureDefaultAdmin(): Promise<void> {
  const existing = await prisma.user.findFirst({
    where: { email: DEFAULT_ADMIN_EMAIL },
  });
  if (existing) return;

  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
  await prisma.user.create({
    data: {
      name: "Administrator",
      email: DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log(
    `[DrugFlow] Created default ADMIN: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD} — change password after first login.`
  );
}

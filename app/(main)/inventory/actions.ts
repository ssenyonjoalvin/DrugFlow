"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function deleteMedicine(medicineId: string): Promise<{ error?: string; success?: boolean }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "You must be signed in to delete a medicine." };
  }

  const id = medicineId?.trim();
  if (!id) return { error: "Medicine not found." };

  const existing = await prisma.medicine.findUnique({ where: { id } });
  if (!existing) return { error: "Medicine not found." };

  await prisma.medicine.delete({ where: { id } });

  revalidatePath("/inventory");
  return { success: true };
}

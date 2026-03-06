"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type CreateStockOutState = {
  error?: string;
  success?: boolean;
};

export async function createStockOutEntry(
  _prevState: CreateStockOutState | null,
  formData: FormData
): Promise<CreateStockOutState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "You must be signed in to record a stock out." };
  }

  const medicineId = (formData.get("medicineId") as string | null)?.trim();
  const quantityRaw = formData.get("quantity");
  const reason = (formData.get("reason") as string | null)?.trim() || null;
  const dispensedBy = (formData.get("dispensedBy") as string | null)?.trim();
  const dateOfIssueRaw = (formData.get("dateOfIssue") as string | null)?.trim();

  if (!medicineId) return { error: "Please select a medicine." };
  const quantity = Number(quantityRaw);
  if (isNaN(quantity) || quantity <= 0) return { error: "Quantity must be a positive number." };
  if (!dispensedBy) return { error: "Dispensed by is required." };
  if (!dateOfIssueRaw) return { error: "Date of issue is required." };

  let dateOfIssue: Date;
  const parsed = new Date(dateOfIssueRaw);
  if (isNaN(parsed.getTime())) return { error: "Invalid date of issue." };
  dateOfIssue = parsed;

  const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } });
  if (!medicine) return { error: "Medicine not found." };
  if (medicine.quantity < quantity) {
    return { error: `Quantity exceeds available stock (${medicine.quantity} in stock).` };
  }

  await prisma.$transaction([
    prisma.stockOutEntry.create({
      data: {
        medicineId,
        quantity,
        reason,
        dispensedBy,
        dateOfIssue,
      },
    }),
    prisma.medicine.update({
      where: { id: medicineId },
      data: { quantity: medicine.quantity - quantity },
    }),
  ]);

  revalidatePath("/inventory/stock-out");
  revalidatePath("/inventory/stock-out/logs");
  revalidatePath("/inventory");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type CreateStockInState = {
  error?: string;
  success?: boolean;
};

export async function createStockInEntry(
  _prevState: CreateStockInState | null,
  formData: FormData
): Promise<CreateStockInState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "You must be signed in to add a stock entry." };
  }

  const medicineId = (formData.get("medicineId") as string | null)?.trim();
  const batchNumber = (formData.get("batchNumber") as string | null)?.trim();
  const quantityRaw = formData.get("quantity");
  const supplier = (formData.get("supplier") as string | null)?.trim() || null;
  const expiryDateRaw = (formData.get("expiryDate") as string | null)?.trim() || null;
  const notes = (formData.get("notes") as string | null)?.trim() || null;

  if (!medicineId) return { error: "Please select a medicine." };
  if (!batchNumber) return { error: "Batch number is required." };
  const quantity = Number(quantityRaw);
  if (isNaN(quantity) || quantity <= 0) return { error: "Quantity must be a positive number." };

  const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } });
  if (!medicine) return { error: "Medicine not found." };

  let expiryDate: Date | null = null;
  if (expiryDateRaw) {
    const parsed = new Date(expiryDateRaw);
    if (!isNaN(parsed.getTime())) expiryDate = parsed;
  }

  await prisma.$transaction([
    prisma.stockInEntry.create({
      data: {
        medicineId,
        batchNumber,
        quantity,
        supplier,
        expiryDate,
        notes,
      },
    }),
    prisma.medicine.update({
      where: { id: medicineId },
      data: { quantity: medicine.quantity + quantity },
    }),
  ]);

  revalidatePath("/inventory/stock-in");
  revalidatePath("/inventory");
  return { success: true };
}

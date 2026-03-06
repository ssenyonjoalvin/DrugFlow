"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type CreateMedicineState = {
  error?: string;
  success?: boolean;
};

export async function createMedicine(
  _prevState: CreateMedicineState | null,
  formData: FormData
): Promise<CreateMedicineState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "You must be signed in to add a medicine." };
  }

  const name = (formData.get("medicineName") as string | null)?.trim();
  const categoryId = (formData.get("categoryId") as string | null)?.trim();
  const unitMeasureId = (formData.get("unitMeasureId") as string | null)?.trim();
  const dosage = (formData.get("dosage") as string | null)?.trim() || null;
  const minStock = Number(formData.get("minStock"));
  const notes = (formData.get("notes") as string | null)?.trim() || null;

  if (!name) return { error: "Medicine name is required." };
  if (!categoryId) return { error: "Please select a category." };
  if (!unitMeasureId) return { error: "Please select a unit of measure." };
  if (isNaN(minStock) || minStock < 0) return { error: "Min. stock level must be 0 or greater." };

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  const unit = await prisma.unitMeasure.findUnique({ where: { id: unitMeasureId } });
  if (!category) return { error: "Invalid category." };
  if (!unit) return { error: "Invalid unit of measure." };

  await prisma.medicine.create({
    data: {
      name,
      categoryId,
      unitMeasureId,
      dosage,
      minStock,
      notes,
    },
  });

  revalidatePath("/inventory");
  revalidatePath("/inventory/new");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type CreateUnitMeasureState = {
  error?: string;
  success?: boolean;
};

export async function createUnitMeasure(
  _prevState: CreateUnitMeasureState | null,
  formData: FormData
): Promise<CreateUnitMeasureState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "You must be signed in to add a unit measure." };
  }

  const name = (formData.get("unitName") as string | null)?.trim();
  const description = (formData.get("unitDescription") as string | null)?.trim() || null;

  if (!name) {
    return { error: "Unit name is required." };
  }

  const existing = await prisma.unitMeasure.findFirst({
    where: { name },
  });
  if (existing) {
    return { error: "A unit measure with this name already exists." };
  }

  await prisma.unitMeasure.create({
    data: { name, description },
  });

  revalidatePath("/dashboard/settings/unit-measures");
  return { success: true };
}

export type UpdateUnitMeasureState = {
  error?: string;
  success?: boolean;
};

export async function updateUnitMeasure(
  _prevState: UpdateUnitMeasureState | null,
  formData: FormData
): Promise<UpdateUnitMeasureState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "You must be signed in to update a unit measure." };
  }

  const id = (formData.get("unitId") as string | null)?.trim();
  const name = (formData.get("unitName") as string | null)?.trim();
  const description = (formData.get("unitDescription") as string | null)?.trim() || null;

  if (!id) return { error: "Unit measure not found." };
  if (!name) return { error: "Unit name is required." };

  const existing = await prisma.unitMeasure.findUnique({ where: { id } });
  if (!existing) return { error: "Unit measure not found." };

  const duplicate = await prisma.unitMeasure.findFirst({
    where: { name, id: { not: id } },
  });
  if (duplicate) return { error: "A unit measure with this name already exists." };

  await prisma.unitMeasure.update({
    where: { id },
    data: { name, description },
  });

  revalidatePath("/dashboard/settings/unit-measures");
  return { success: true };
}

export async function deleteUnitMeasure(unitId: string): Promise<{ error?: string; success?: boolean }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "You must be signed in to delete a unit measure." };
  }

  const id = unitId?.trim();
  if (!id) return { error: "Unit measure not found." };

  const existing = await prisma.unitMeasure.findUnique({ where: { id } });
  if (!existing) return { error: "Unit measure not found." };

  await prisma.unitMeasure.delete({ where: { id } });

  revalidatePath("/dashboard/settings/unit-measures");
  return { success: true };
}

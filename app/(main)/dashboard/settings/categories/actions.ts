"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type CreateCategoryState = {
  error?: string;
  success?: boolean;
};

export async function createCategory(
  _prevState: CreateCategoryState | null,
  formData: FormData
): Promise<CreateCategoryState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "You must be signed in to add a category." };
  }

  const name = (formData.get("categoryName") as string | null)?.trim();
  const description = (formData.get("categoryDescription") as string | null)?.trim() || null;

  if (!name) {
    return { error: "Category name is required." };
  }

  const existing = await prisma.category.findFirst({
    where: { name },
  });
  if (existing) {
    return { error: "A category with this name already exists." };
  }

  await prisma.category.create({
    data: { name, description },
  });

  revalidatePath("/dashboard/settings/categories");
  return { success: true };
}

export type UpdateCategoryState = {
  error?: string;
  success?: boolean;
};

export async function updateCategory(
  _prevState: UpdateCategoryState | null,
  formData: FormData
): Promise<UpdateCategoryState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "You must be signed in to update a category." };
  }

  const id = (formData.get("categoryId") as string | null)?.trim();
  const name = (formData.get("categoryName") as string | null)?.trim();
  const description = (formData.get("categoryDescription") as string | null)?.trim() || null;

  if (!id) return { error: "Category not found." };
  if (!name) return { error: "Category name is required." };

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return { error: "Category not found." };

  const duplicate = await prisma.category.findFirst({
    where: { name, id: { not: id } },
  });
  if (duplicate) return { error: "A category with this name already exists." };

  await prisma.category.update({
    where: { id },
    data: { name, description },
  });

  revalidatePath("/dashboard/settings/categories");
  return { success: true };
}

export async function deleteCategory(categoryId: string): Promise<{ error?: string; success?: boolean }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "You must be signed in to delete a category." };
  }

  const id = categoryId?.trim();
  if (!id) return { error: "Category not found." };

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return { error: "Category not found." };

  await prisma.category.delete({ where: { id } });

  revalidatePath("/dashboard/settings/categories");
  return { success: true };
}

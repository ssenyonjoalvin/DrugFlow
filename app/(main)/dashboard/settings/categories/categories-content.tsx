"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddCategoryModal } from "./add-category-modal";
import { EditCategoryModal } from "./edit-category-modal";
import { DeleteCategoryModal } from "./delete-category-modal";
import { deleteCategory } from "./actions";

const categoryIcons = ["plus", "pill", "syringe", "heart", "droplet"];

export type CategoryRow = {
  id: string;
  name: string;
  description: string | null;
};

function CategoryIcon({ index }: { index: number }) {
  const icon = categoryIcons[index % categoryIcons.length];
  const className = "size-5 shrink-0 text-zinc-500";
  if (icon === "plus")
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    );
  if (icon === "pill")
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    );
  if (icon === "syringe")
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    );
  if (icon === "heart")
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    );
  if (icon === "droplet")
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
    );
  return null;
}

export function CategoriesContent({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryRow | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalCategories = categories.length;
  const pageSize = 5;
  const start = (currentPage - 1) * pageSize;
  const pageCategories = categories.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(totalCategories / pageSize));

  async function handleConfirmDelete(categoryId: string): Promise<boolean> {
    const result = await deleteCategory(categoryId);
    if (result?.error) {
      alert(result.error);
      return false;
    }
    router.refresh();
    return true;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Medicine Categories</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Manage and organize medicine classifications for the inventory.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Category
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Category Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Description</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {pageCategories.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-zinc-500">
                  No categories yet. Click &quot;Add New Category&quot; to create one.
                </td>
              </tr>
            ) : (
              pageCategories.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-zinc-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <CategoryIcon index={start + index} />
                      <span className="font-medium text-zinc-800">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{cat.description ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(cat)}
                        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                        aria-label="Edit"
                      >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingCategory(cat)}
                        className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete"
                      >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V7a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50/50 px-4 py-3">
          <p className="text-sm text-zinc-600">
            Showing {totalCategories === 0 ? 0 : start + 1} to {Math.min(start + pageSize, totalCategories)} of {totalCategories} categories
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCurrentPage(n)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${currentPage === n ? "bg-violet-600 text-white" : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"}`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <AddCategoryModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <EditCategoryModal
        open={editingCategory !== null}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
      />
      <DeleteCategoryModal
        open={deletingCategory !== null}
        category={deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

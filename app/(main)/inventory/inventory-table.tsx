"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteMedicine } from "./actions";
import { DeleteMedicineModal } from "./delete-medicine-modal";

export type MedicineRow = {
  id: string;
  name: string;
  dosage: string | null;
  categoryName: string;
  quantity: number;
  minStock: number;
};

type Status = "HEALTHY" | "LOW" | "CRITICAL";

function getStatus(quantity: number, minStock: number): Status {
  if (quantity > minStock) return "HEALTHY";
  if (quantity > 0) return "LOW";
  return "CRITICAL";
}

export function InventoryTable({ medicines }: { medicines: MedicineRow[] }) {
  const router = useRouter();
  const [deletingMedicine, setDeletingMedicine] = useState<MedicineRow | null>(null);

  async function handleConfirmDelete(medicineId: string): Promise<boolean> {
    const result = await deleteMedicine(medicineId);
    if (result?.error) {
      alert(result.error);
      return false;
    }
    router.refresh();
    return true;
  }

  const totalResults = medicines.length;
  const totalItems = medicines.length;
  const lowStock = medicines.filter((m) => m.quantity > 0 && m.quantity <= m.minStock).length;
  const critical = medicines.filter((m) => m.quantity === 0).length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="rounded-lg p-2.5 bg-emerald-100 text-emerald-600">
            <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8 4-8-4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-800">{totalItems}</p>
            <p className="text-sm text-zinc-500">Total Items</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="rounded-lg p-2.5 bg-amber-100 text-amber-600">
            <svg className="size-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 22h20L12 2zm0 4l7 12H5L12 6zm-1 4v4h2v-4h-2zm0 6v2h2v-2h-2z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-800">{lowStock}</p>
            <p className="text-sm text-zinc-500">Low Stock Alert</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="rounded-lg p-2.5 bg-red-100 text-red-600">
            <svg className="size-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-800">{critical}</p>
            <p className="text-sm text-zinc-500">Critical Status</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Medicine Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Current Stock</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Min Level</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {medicines.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-500">
                  No medicines yet. Click &quot;Add New Medicine&quot; to create one.
                </td>
              </tr>
            ) : (
              medicines.map((row) => {
                const status = getStatus(row.quantity, row.minStock);
                return (
                  <tr key={row.id} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-800">{row.name}</div>
                      {row.dosage && <div className="text-xs text-zinc-500">{row.dosage}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                        {row.categoryName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{row.quantity} units</td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{row.minStock} units</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          status === "HEALTHY"
                            ? "text-emerald-600"
                            : status === "LOW"
                              ? "text-amber-600"
                              : "text-red-600"
                        }`}
                      >
                        <span
                          className={`size-2 rounded-full ${
                            status === "HEALTHY"
                              ? "bg-emerald-500"
                              : status === "LOW"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                        />
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/inventory/${row.id}/edit`}
                          className="inline-flex rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                          aria-label="Edit"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeletingMedicine(row)}
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
                );
              })
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50/50 px-4 py-3">
          <p className="text-sm text-zinc-600">
            Showing 1 to {totalResults} of {totalResults} results
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-400"
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <DeleteMedicineModal
        open={deletingMedicine !== null}
        medicine={deletingMedicine}
        onClose={() => setDeletingMedicine(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

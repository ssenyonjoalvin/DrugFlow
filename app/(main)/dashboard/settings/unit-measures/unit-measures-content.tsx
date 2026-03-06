"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddUnitMeasureModal } from "./add-unit-measure-modal";
import { EditUnitMeasureModal } from "./edit-unit-measure-modal";
import { DeleteUnitMeasureModal } from "./delete-unit-measure-modal";
import { deleteUnitMeasure } from "./actions";

export type UnitMeasureRow = {
  id: string;
  name: string;
  description: string | null;
};

export function UnitMeasuresContent({ units }: { units: UnitMeasureRow[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitMeasureRow | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<UnitMeasureRow | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalUnits = units.length;
  const pageSize = 5;
  const start = (currentPage - 1) * pageSize;
  const pageUnits = units.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(totalUnits / pageSize));

  async function handleConfirmDelete(unitId: string): Promise<boolean> {
    const result = await deleteUnitMeasure(unitId);
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
          <h1 className="text-2xl font-bold text-zinc-800">Unit Measures</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Manage units of measure for inventory (e.g. Tablets, Bottles, Vials).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Unit
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Description</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {pageUnits.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-zinc-500">
                  No unit measures yet. Click &quot;Add Unit&quot; to create one.
                </td>
              </tr>
            ) : (
              pageUnits.map((unit) => (
                <tr key={unit.id} className="hover:bg-zinc-50/50">
                  <td className="px-4 py-3 font-medium text-zinc-800">{unit.name}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{unit.description ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingUnit(unit)}
                        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                        aria-label="Edit"
                      >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingUnit(unit)}
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
            Showing {totalUnits === 0 ? 0 : start + 1} to {Math.min(start + pageSize, totalUnits)} of {totalUnits} units
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

      <AddUnitMeasureModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <EditUnitMeasureModal
        open={editingUnit !== null}
        unit={editingUnit}
        onClose={() => setEditingUnit(null)}
      />
      <DeleteUnitMeasureModal
        open={deletingUnit !== null}
        unit={deletingUnit}
        onClose={() => setDeletingUnit(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

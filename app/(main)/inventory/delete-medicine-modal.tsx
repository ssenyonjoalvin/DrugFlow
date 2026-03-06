"use client";

import { useState } from "react";

type MedicineForDelete = {
  id: string;
  name: string;
};

export function DeleteMedicineModal({
  open,
  medicine,
  onClose,
  onConfirm,
}: {
  open: boolean;
  medicine: MedicineForDelete | null;
  onClose: () => void;
  onConfirm: (medicineId: string) => Promise<boolean>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!open || !medicine) return null;

  async function handleYes() {
    if (!medicine) return;
    setIsDeleting(true);
    try {
      const success = await onConfirm(medicine.id);
      if (success) onClose();
    } finally {
      setIsDeleting(false);
    }
  }

  function handleNo() {
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm" aria-hidden onClick={handleNo} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-zinc-800">Delete medicine?</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Are you sure you want to delete <strong>&quot;{medicine.name}&quot;</strong>? This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleNo}
            disabled={isDeleting}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            No, cancel
          </button>
          <button
            type="button"
            onClick={handleYes}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      </div>
    </>
  );
}

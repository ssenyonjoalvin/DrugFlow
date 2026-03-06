"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateUnitMeasure } from "./actions";

type UnitForEdit = {
  id: string;
  name: string;
  description: string | null;
};

export function EditUnitMeasureModal({
  open,
  unit,
  onClose,
}: {
  open: boolean;
  unit: UnitForEdit | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateUnitMeasure, null);
  const handledSuccess = useRef(false);

  useEffect(() => {
    if (open && unit) handledSuccess.current = false;
  }, [open, unit?.id]);

  useEffect(() => {
    if (state?.success && !handledSuccess.current) {
      handledSuccess.current = true;
      onClose();
      router.refresh();
    }
  }, [state?.success, onClose, router]);

  if (!open || !unit) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm" aria-hidden onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-800">Edit Unit Measure</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="unitId" value={unit.id} />
          <div>
            <label htmlFor="edit-unitName" className="mb-1 block text-sm font-medium text-zinc-700">
              Unit Name
            </label>
            <input
              id="edit-unitName"
              name="unitName"
              type="text"
              defaultValue={unit.name}
              placeholder="e.g. Tablets, Bottles, Vials"
              required
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div>
            <label htmlFor="edit-unitDescription" className="mb-1 block text-sm font-medium text-zinc-700">
              Description
            </label>
            <textarea
              id="edit-unitDescription"
              name="unitDescription"
              rows={3}
              defaultValue={unit.description ?? ""}
              placeholder="Brief description of this unit..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {state.error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="text-sm font-medium text-zinc-600 hover:text-zinc-800">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

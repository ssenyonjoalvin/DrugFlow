"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createMedicine } from "./actions";

export type CategoryOption = { id: string; name: string };
export type UnitMeasureOption = { id: string; name: string };

export function NewMedicineForm({
  categories,
  unitMeasures,
}: {
  categories: CategoryOption[];
  unitMeasures: UnitMeasureOption[];
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createMedicine, null);
  const handledSuccess = useRef(false);

  useEffect(() => {
    if (state?.success && !handledSuccess.current) {
      handledSuccess.current = true;
      router.push("/inventory");
    }
  }, [state?.success, router]);

  const [medicineName, setMedicineName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [dosage, setDosage] = useState("");
  const [minStock, setMinStock] = useState(50);
  const [notes, setNotes] = useState("");

  const categoryOptions = [
    { value: "", label: "Select a category" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];
  const unitOptions = [
    { value: "", label: "Select unit of measure" },
    ...unitMeasures.map((u) => ({ value: u.id, label: u.name })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-800">Add New Medicine</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Complete the information below to register a new medicine item into the central inventory system.
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form action={formAction} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="medicineName" className="mb-1 block text-sm font-medium text-zinc-700">
                Medicine Name
              </label>
              <input
                id="medicineName"
                name="medicineName"
                type="text"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder="e.g. Amoxicillin"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-zinc-700">
                Category
              </label>
              <select
                id="category"
                name="categoryId"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {categoryOptions.map((c) => (
                  <option key={c.value || "placeholder"} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="unit" className="mb-1 block text-sm font-medium text-zinc-700">
                Unit of Measure
              </label>
              <select
                id="unit"
                name="unitMeasureId"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {unitOptions.map((u) => (
                  <option key={u.value || "placeholder"} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="dosage" className="mb-1 block text-sm font-medium text-zinc-700">
                Dosage
              </label>
              <input
                id="dosage"
                name="dosage"
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 500mg"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <label htmlFor="minStock" className="mb-1 block text-sm font-medium text-zinc-700">
                Min. Stock Level
              </label>
              <input
                id="minStock"
                name="minStock"
                type="number"
                min={0}
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="mb-1 block text-sm font-medium text-zinc-700">
              Description / Clinical Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter instructions, storage requirements, or general notes about the medicine..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Inventory Alert Configuration */}
          <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
            <div className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </span>
              <div>
                <h3 className="font-semibold text-violet-900">Inventory Alert Configuration</h3>
                <p className="mt-0.5 text-sm text-violet-800">
                  When stock falls below the minimum level, the system will automatically notify the head pharmacist for restocking.
                </p>
              </div>
            </div>
          </div>

          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {state.error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/inventory"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save Medicine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

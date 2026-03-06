"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createStockOutEntry } from "./actions";

export type MedicineOption = { id: string; name: string; quantity: number };
export type RecentActivityItem = {
  id: string;
  medicine: string;
  detail: string;
  addedAgo: string;
  by: string;
};

export function StockOutForm({
  medicines,
  recentActivity,
  dispensedBy,
}: {
  medicines: MedicineOption[];
  recentActivity: RecentActivityItem[];
  dispensedBy: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createStockOutEntry, null);
  const handledSuccess = useRef(false);

  const [medicineId, setMedicineId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [dateOfIssue, setDateOfIssue] = useState(() => {
    const d = new Date();
    return `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  const selectedMedicine = medicines.find((m) => m.id === medicineId);
  const availableStock = selectedMedicine?.quantity ?? 0;
  const quantityNum = parseInt(quantity, 10) || 0;
  const exceedsStock = selectedMedicine && quantityNum > availableStock;

  useEffect(() => {
    if (state?.success && !handledSuccess.current) {
      handledSuccess.current = true;
      resetForm();
      router.refresh();
    }
  }, [state?.success, router]);

  useEffect(() => {
    if (isPending) handledSuccess.current = false;
  }, [isPending]);

  function resetForm() {
    setMedicineId("");
    setQuantity("");
    setReason("");
    const d = new Date();
    setDateOfIssue(`${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }

  const medicineOptions = [
    { id: "", name: "Select medicine", quantity: 0 },
    ...medicines,
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left: Dispense form */}
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-800">Dispense Medicine</h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Stock Out: Log medicine issuance to patients or departments.
          </p>

          <form action={formAction} className="mt-6 space-y-4">
            <input type="hidden" name="dispensedBy" value={dispensedBy} />

            <div>
              <label htmlFor="medicine" className="mb-1 block text-sm font-medium text-zinc-700">
                Medicine Name
              </label>
              <select
                id="medicine"
                name="medicineId"
                value={medicineId}
                onChange={(e) => setMedicineId(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {medicineOptions.map((m) => (
                  <option key={m.id || "placeholder"} value={m.id}>
                    {m.id === "" ? m.name : `${m.name} (${m.quantity} in stock)`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-zinc-700">
                Quantity to Issue
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter amount"
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 ${
                  exceedsStock ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-zinc-200 focus:border-violet-500 focus:ring-violet-500"
                }`}
              />
              {exceedsStock && (
                <p className="mt-1.5 flex items-center gap-2 text-sm text-red-600" role="alert">
                  <svg className="size-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 22h20L12 2zm0 4l7 12H5L12 6zm-1 4v4h2v-4h-2zm0 6v2h2v-2h-2z" />
                  </svg>
                  Quantity exceeds available stock (Current: {availableStock})
                </p>
              )}
            </div>

            <div>
              <label htmlFor="reason" className="mb-1 block text-sm font-medium text-zinc-700">
                Reason / Destination
              </label>
              <input
                id="reason"
                name="reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Patient: John Doe or Department: Emergency"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label htmlFor="dispensedBy" className="mb-1 block text-sm font-medium text-zinc-700">
                Dispensed By
              </label>
              <input
                id="dispensedBy"
                type="text"
                value={dispensedBy}
                readOnly
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-700"
              />
            </div>

            <div>
              <label htmlFor="dateOfIssue" className="mb-1 block text-sm font-medium text-zinc-700">
                Date of Issue
              </label>
              <div className="relative">
                <input
                  id="dateOfIssue"
                  name="dateOfIssue"
                  type="date"
                  value={dateOfIssue}
                  onChange={(e) => setDateOfIssue(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-3 pr-10 text-zinc-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
            </div>

            {state?.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {state.error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending || exceedsStock || !medicineId || !quantity}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isPending ? "Saving…" : "Complete Stock Out"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right: Recent Activity + Alert */}
      <div className="space-y-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-zinc-800">Recent Activity</h3>
            <Link href="/inventory/stock-out/logs" className="text-sm font-medium text-violet-600 hover:text-violet-700">
              View All
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recentActivity.length === 0 ? (
              <li className="pb-3 text-sm text-zinc-500">No stock out entries yet. Dispense medicine to see activity.</li>
            ) : (
              recentActivity.map((item) => (
                <li key={item.id} className="border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                  <p className="font-medium text-zinc-800">{item.medicine}</p>
                  <p className="text-sm text-zinc-500">{item.detail}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">{item.addedAgo} • {item.by}</p>
                </li>
              ))
            )}
          </ul>
        </div>

        {medicines.some((m) => m.quantity > 0 && m.quantity <= 20) && (
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
            <h3 className="font-bold uppercase tracking-wider text-violet-800">Inventory Alert</h3>
            <p className="mt-2 text-sm text-violet-900">
              {medicines
                .filter((m) => m.quantity > 0 && m.quantity <= 20)
                .map((m) => `${m.name} (${m.quantity} left)`)
                .join(", ")}{" "}
              {medicines.filter((m) => m.quantity > 0 && m.quantity <= 20).length === 1 ? "is" : "are"} critically low. Please restock soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

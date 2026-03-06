"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createStockInEntry } from "./actions";
export type MedicineOption = { id: string; name: string };
export type RecentEntry = {
  id: string;
  medicine: string;
  addedAgo: string;
  batchNo: string;
  quantity: number;
  supplier: string;
  expiry: string;
};

export function StockInForm({
  medicines,
  recentEntries,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
}: {
  medicines: MedicineOption[];
  recentEntries: RecentEntry[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createStockInEntry, null);
  const handledSuccess = useRef(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [medicineId, setMedicineId] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [supplier, setSupplier] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (state?.success && !handledSuccess.current) {
      handledSuccess.current = true;
      setShowSuccessMessage(true);
      clearForm();
      router.refresh();
      const t = setTimeout(() => setShowSuccessMessage(false), 5000);
      return () => clearTimeout(t);
    }
  }, [state?.success, router]);

  useEffect(() => {
    if (isPending) handledSuccess.current = false;
  }, [isPending]);

  function clearForm() {
    setMedicineId("");
    setBatchNumber("");
    setQuantity(0);
    setSupplier("");
    setExpiryDate("");
    setNotes("");
  }

  function isExpiryUrgent(expiry: string) {
    if (!expiry || expiry === "—") return false;
    return expiry.includes("2024");
  }

  const medicineOptions = [
    { value: "", label: "Select medicine..." },
    ...medicines.map((m) => ({ value: m.id, label: m.name })),
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {showSuccessMessage && (
        <div
          className="lg:col-span-2 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800 shadow-sm"
          role="status"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <div className="flex-1">
            <p className="font-semibold text-emerald-900">Inventory saved successfully</p>
            <p className="text-sm text-emerald-700">Your stock-in entry has been recorded.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessMessage(false)}
            className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-100"
            aria-label="Dismiss"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {/* New Inventory Entry - Left column */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-800">New Inventory Entry</h2>
            <p className="mt-0.5 text-sm text-zinc-500">Add medicines from donations or bulk purchases.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearForm}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Clear Form
            </button>
            <button
              type="submit"
              form="stock-in-form"
              disabled={isPending}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save Entry"}
            </button>
          </div>
        </div>

        <form id="stock-in-form" action={formAction} className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="medicine" className="mb-1 block text-sm font-medium text-zinc-700">Medicine Name</label>
            <select
              id="medicine"
              name="medicineId"
              value={medicineId}
              onChange={(e) => setMedicineId(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 px-3 text-zinc-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              {medicineOptions.map((o) => (
                <option key={o.value || "placeholder"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="batch" className="mb-1 block text-sm font-medium text-zinc-700">Batch Number</label>
            <input
              id="batch"
              name="batchNumber"
              type="text"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="e.g. B-2024-001"
              className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 px-3 text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div>
            <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-zinc-700">Quantity (Units)</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 px-3 text-zinc-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div>
            <label htmlFor="supplier" className="mb-1 block text-sm font-medium text-zinc-700">
              Supplier / Donor <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <input
              id="supplier"
              name="supplier"
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. Red Cross, Pharma Corp"
              className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 px-3 text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div>
            <label htmlFor="expiry" className="mb-1 block text-sm font-medium text-zinc-700">Expiry Date</label>
            <div className="relative">
              <input
                id="expiry"
                name="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-3 pr-10 text-zinc-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </span>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="notes" className="mb-1 block text-sm font-medium text-zinc-700">Notes / Additional Details</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any specific storage instructions or donor terms here..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {state.error}
            </p>
          )}
        </form>
      </div>

      {/* Recent Stock In Activity - Right column */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-800">Recent Stock In Activity</h2>
          <Link href="/inventory/stock-in/records" className="text-sm font-medium text-violet-600 hover:text-violet-700">
            View All Records
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Batch No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {recentEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">
                    No stock-in entries yet. Use the form to add one.
                  </td>
                </tr>
              ) : (
                recentEntries.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-800">{row.medicine}</div>
                      <div className="text-xs text-zinc-500">Added {row.addedAgo}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{row.batchNo}</td>
                    <td className="px-4 py-3 text-sm font-medium text-emerald-600">+{row.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{row.supplier}</td>
                    <td className={`px-4 py-3 text-sm ${isExpiryUrgent(row.expiry) ? "font-medium text-red-600" : "text-zinc-700"}`}>
                      {row.expiry}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3">
          <p className="text-sm text-zinc-500">
            {totalCount === 0
              ? "No entries yet"
              : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, totalCount)} of ${totalCount} entries`
            }
          </p>
          <div className="flex gap-1">
            <Link
              href={currentPage > 1 ? `/inventory/stock-in?page=${currentPage - 1}` : "#"}
              className={`rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 ${
                currentPage <= 1 ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Previous
            </Link>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/inventory/stock-in?page=${p}`}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  currentPage === p
                    ? "bg-violet-600 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {p}
              </Link>
            ))}
            <Link
              href={currentPage < totalPages ? `/inventory/stock-in?page=${currentPage + 1}` : "#"}
              className={`rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 ${
                currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

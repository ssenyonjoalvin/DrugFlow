"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PURPLE = "#6C5CE7";
const LAVENDER = "#E8E4F9";
const AMBER = "#F59E0B";
const RED = "#EF4444";

type SummaryMetrics = {
  totalReceived: number;
  totalIssued: number;
  currentStockBalance: number;
  totalPurchaseCost: number | null;
};

type StockFlowPoint = {
  month: string;
  label: string;
  stockIn: number;
  stockOut: number;
};

type TopConsumed = {
  medicineName: string;
  quantity: number;
  percentage: number;
};

type LowStockItem = {
  id: string;
  name: string;
  quantity: number;
  minStock: number;
  category: { name: string };
};

type ExpiringItem = {
  name: string;
  quantity: number;
  nearestExpiry: Date | string;
};

type MonthlySummaryRow = {
  month: string;
  label: string;
  inflow: number;
  outflow: number;
  net: number;
};

type ConsumptionRow = {
  category: string;
  quantity: number;
  percentage: number;
};

type ReportsClientProps = {
  metrics: SummaryMetrics;
  stockFlowData: StockFlowPoint[];
  topConsumed: TopConsumed[];
  lowStock: LowStockItem[];
  expiring: ExpiringItem[];
  monthlySummary: MonthlySummaryRow[];
  consumptionByCategory: ConsumptionRow[];
  dateRange: { from: Date; to: Date };
  rangePreset: string;
};

export function ReportsClient({
  metrics,
  stockFlowData,
  topConsumed,
  lowStock,
  expiring,
  monthlySummary,
  consumptionByCategory,
  dateRange,
  rangePreset,
}: ReportsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"monthly" | "consumption">("monthly");
  const [searchMonthly, setSearchMonthly] = useState("");
  const [searchConsumption, setSearchConsumption] = useState("");
  const [sortMonthly, setSortMonthly] = useState<"month" | "inflow" | "outflow" | "net">("month");
  const [sortConsumption, setSortConsumption] = useState<"category" | "quantity" | "percentage">("quantity");

  function setDateRange(range: string, from?: string, to?: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`/reports?${params.toString()}`);
  }

  function exportCSV() {
    const rows: string[][] = [
      ["Reports & Analytics", ""],
      ["Date Range", `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`],
      [""],
      ["Summary Metrics", ""],
      ["Total Medicines Received", String(metrics.totalReceived)],
      ["Total Medicines Issued", String(metrics.totalIssued)],
      ["Current Stock Balance", String(metrics.currentStockBalance)],
      ["Total Purchase Cost", metrics.totalPurchaseCost != null ? String(metrics.totalPurchaseCost) : "—"],
      [""],
      ["Monthly Summary", ""],
      ["Month", "Inflow", "Outflow", "Net"],
      ...monthlySummary.map((r) => [r.label, String(r.inflow), String(r.outflow), String(r.net)]),
      [""],
      ["Consumption by Category", ""],
      ["Category", "Quantity", "Percentage"],
      ...consumptionByCategory.map((r) => [r.category, String(r.quantity), `${r.percentage.toFixed(1)}%`]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    window.print();
  }

  const filteredMonthly = monthlySummary.filter((r) =>
    r.label.toLowerCase().includes(searchMonthly.toLowerCase())
  );
  const filteredConsumption = consumptionByCategory.filter((r) =>
    r.category.toLowerCase().includes(searchConsumption.toLowerCase())
  );

  const sortedMonthly = [...filteredMonthly].sort((a, b) => {
    if (sortMonthly === "month") return a.month.localeCompare(b.month);
    if (sortMonthly === "inflow") return b.inflow - a.inflow;
    if (sortMonthly === "outflow") return b.outflow - a.outflow;
    return b.net - a.net;
  });

  const sortedConsumption = [...filteredConsumption].sort((a, b) => {
    if (sortConsumption === "category") return a.category.localeCompare(b.category);
    if (sortConsumption === "quantity") return b.quantity - a.quantity;
    return b.percentage - a.percentage;
  });

  const totalInflow = sortedMonthly.reduce((s, r) => s + r.inflow, 0);
  const totalOutflow = sortedMonthly.reduce((s, r) => s + r.outflow, 0);
  const totalConsumptionQty = sortedConsumption.reduce((s, r) => s + r.quantity, 0);

  return (
    <div className="space-y-8 print:space-y-6">
      {/* Header: Title, Date Range, Export */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:flex-row">
        <h1 className="text-2xl font-bold text-zinc-900">Reports & Analytics</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-zinc-200 bg-white p-1">
            {(["this_month", "last_3_months"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  rangePreset === r
                    ? "bg-[#6C5CE7] text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {r === "this_month" ? "This Month" : "Last 3 Months"}
              </button>
            ))}
            <button
              onClick={() => {
                const from = prompt("From date (YYYY-MM-DD):");
                const to = prompt("To date (YYYY-MM-DD):");
                if (from && to) setDateRange("custom", from, to);
              }}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                rangePreset === "custom"
                  ? "bg-[#6C5CE7] text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              Custom
            </button>
          </div>
          <div className="flex gap-2 print:hidden">
            <button
              onClick={exportCSV}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Export CSV
            </button>
            <button
              onClick={exportPDF}
              className="rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm font-medium text-white hover:bg-[#5B4BD4]"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Medicines Received", value: metrics.totalReceived, icon: "↓", format: (v: number) => v.toLocaleString() },
          { label: "Total Medicines Issued", value: metrics.totalIssued, icon: "↑", format: (v: number) => v.toLocaleString() },
          { label: "Current Stock Balance", value: metrics.currentStockBalance, icon: "≡", format: (v: number) => v.toLocaleString() },
          { label: "Total Purchase Cost", value: metrics.totalPurchaseCost, icon: "$", format: () => metrics.totalPurchaseCost != null ? `$${metrics.totalPurchaseCost.toLocaleString()}` : "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-zinc-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-zinc-900">
              {card.value != null && typeof card.value === "number" ? card.format(card.value) : "—"}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium"
                style={{ backgroundColor: LAVENDER, color: PURPLE }}
              >
                {card.icon}
              </span>
              <span className="text-xs text-zinc-400">Period: {dateRange.from.toLocaleDateString()} – {dateRange.to.toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Stock Flow Chart */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-800">Stock Flow Overview</h2>
        <p className="mt-1 text-sm text-zinc-500">Stock In vs Stock Out over time</p>
        <div className="mt-6 h-72">
          {stockFlowData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-zinc-500">No data for selected range</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#71717A" />
                <YAxis tick={{ fontSize: 12 }} stroke="#71717A" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #E4E4E7" }}
                  formatter={(value?: number) => [typeof value === "number" ? value.toLocaleString() : "—", ""]}
                  labelFormatter={(label) => label}
                />
                <Legend />
                <Bar dataKey="stockIn" name="Stock In" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stockOut" name="Stock Out" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Consumed + Low Stock/Expiry */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-800">Top Consumed Medicines</h2>
          <p className="mt-1 text-sm text-zinc-500">By issued quantity in selected period</p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Medicine</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Quantity</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {topConsumed.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-zinc-500">No consumption data</td></tr>
                ) : (
                  topConsumed.map((row, i) => (
                    <tr key={i} className="hover:bg-[#E8E4F9]/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-zinc-400">{i + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-zinc-800">{row.medicineName}</td>
                      <td className="px-4 py-3 text-right text-sm text-zinc-700">{row.quantity.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium" style={{ color: PURPLE }}>{row.percentage.toFixed(1)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-800">Low Stock & Expiry Risk</h2>
          <p className="mt-1 text-sm text-zinc-500">Medicines below minimum level or expiring within 60 days</p>
          <div className="mt-4 space-y-4">
            {lowStock.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600">Below Minimum Level</h3>
                <ul className="mt-2 space-y-2">
                  {lowStock.slice(0, 5).map((m) => (
                    <li key={m.id} className="flex items-center justify-between rounded-lg bg-amber-50/80 px-3 py-2 text-sm">
                      <span className="font-medium text-zinc-800">{m.name}</span>
                      <span className="text-amber-700">{m.quantity} / {m.minStock}</span>
                    </li>
                  ))}
                  {lowStock.length > 5 && (
                    <li className="text-xs text-zinc-500">+{lowStock.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
            {expiring.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600">Expiring Within 60 Days</h3>
                <ul className="mt-2 space-y-2">
                  {expiring.slice(0, 5).map((e, i) => (
                    <li key={i} className="flex items-center justify-between rounded-lg bg-red-50/80 px-3 py-2 text-sm">
                      <span className="font-medium text-zinc-800">{e.name}</span>
                      <span className="text-red-700">{new Date(e.nearestExpiry).toLocaleDateString()} ({e.quantity} units)</span>
                    </li>
                  ))}
                  {expiring.length > 5 && (
                    <li className="text-xs text-zinc-500">+{expiring.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
            {lowStock.length === 0 && expiring.length === 0 && (
              <p className="py-4 text-center text-sm text-zinc-500">No low stock or expiry risks</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabbed Reports */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex border-b border-zinc-200">
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "monthly"
                ? "border-b-2 border-[#6C5CE7] text-[#6C5CE7]"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Monthly Summary Report
          </button>
          <button
            onClick={() => setActiveTab("consumption")}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "consumption"
                ? "border-b-2 border-[#6C5CE7] text-[#6C5CE7]"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Consumption Report
          </button>
        </div>

        <div className="p-6">
          {activeTab === "monthly" && (
            <div>
              <div className="mb-4 flex gap-4">
                <input
                  type="search"
                  placeholder="Search by month..."
                  value={searchMonthly}
                  onChange={(e) => setSearchMonthly(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:border-[#6C5CE7] focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
                />
                <select
                  value={sortMonthly}
                  onChange={(e) => setSortMonthly(e.target.value as typeof sortMonthly)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700"
                >
                  <option value="month">Sort by Month</option>
                  <option value="inflow">Sort by Inflow</option>
                  <option value="outflow">Sort by Outflow</option>
                  <option value="net">Sort by Net</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200">
                  <thead>
                    <tr>
                      <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Month</th>
                      <th className="cursor-pointer px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Inflow</th>
                      <th className="cursor-pointer px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Outflow</th>
                      <th className="cursor-pointer px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {sortedMonthly.map((r) => (
                      <tr key={r.month} className="hover:bg-[#E8E4F9]/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-zinc-800">{r.label}</td>
                        <td className="px-4 py-3 text-right text-sm text-emerald-600">+{r.inflow.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-sm text-red-600">−{r.outflow.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-zinc-800">{r.net >= 0 ? "+" : ""}{r.net.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-zinc-50 font-medium">
                      <td className="px-4 py-3 text-sm text-zinc-800">Total</td>
                      <td className="px-4 py-3 text-right text-sm text-emerald-600">+{totalInflow.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-sm text-red-600">−{totalOutflow.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-sm text-zinc-800">{(totalInflow - totalOutflow).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {activeTab === "consumption" && (
            <div>
              <div className="mb-4 flex gap-4">
                <input
                  type="search"
                  placeholder="Search by category..."
                  value={searchConsumption}
                  onChange={(e) => setSearchConsumption(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:border-[#6C5CE7] focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
                />
                <select
                  value={sortConsumption}
                  onChange={(e) => setSortConsumption(e.target.value as typeof sortConsumption)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700"
                >
                  <option value="category">Sort by Category</option>
                  <option value="quantity">Sort by Quantity</option>
                  <option value="percentage">Sort by %</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Quantity Issued</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">% of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {sortedConsumption.map((r) => (
                      <tr key={r.category} className="hover:bg-[#E8E4F9]/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-zinc-800">{r.category}</td>
                        <td className="px-4 py-3 text-right text-sm text-zinc-700">{r.quantity.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium" style={{ color: PURPLE }}>{r.percentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-zinc-50 font-medium">
                      <td className="px-4 py-3 text-sm text-zinc-800">Total</td>
                      <td className="px-4 py-3 text-right text-sm text-zinc-800">{totalConsumptionQty.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-sm" style={{ color: PURPLE }}>100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

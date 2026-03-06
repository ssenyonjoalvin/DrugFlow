import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { authOptions } from "@/lib/auth";
import {
  getDateRange,
  getSummaryMetrics,
  getStockFlowData,
  getTopConsumedMedicines,
  getLowStockMedicines,
  getExpiringMedicines,
  getMonthlySummaryReport,
  getConsumptionByCategory,
} from "./lib/data";
import { ReportsClient } from "./components/reports-client";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const range = params.range ?? "this_month";
  const dateRange = getDateRange(range, params.from, params.to);

  const [
    metrics,
    stockFlowData,
    topConsumed,
    lowStock,
    expiring,
    monthlySummary,
    consumptionByCategory,
  ] = await Promise.all([
    getSummaryMetrics(dateRange),
    getStockFlowData(dateRange),
    getTopConsumedMedicines(dateRange, 10),
    getLowStockMedicines(),
    getExpiringMedicines(60),
    getMonthlySummaryReport(dateRange),
    getConsumptionByCategory(dateRange),
  ]);

  const lowStockSerializable = lowStock.map((m) => ({
    id: m.id,
    name: m.name,
    quantity: m.quantity,
    minStock: m.minStock,
    category: { name: m.category.name },
  }));

  const expiringSerializable = expiring.map((e) => ({
    ...e,
    nearestExpiry: e.nearestExpiry.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-7xl">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center text-zinc-500">
            Loading reports…
          </div>
        }
      >
        <ReportsClient
          metrics={metrics}
          stockFlowData={stockFlowData}
          topConsumed={topConsumed}
          lowStock={lowStockSerializable}
          expiring={expiringSerializable}
          monthlySummary={monthlySummary}
          consumptionByCategory={consumptionByCategory}
          dateRange={dateRange}
          rangePreset={range}
        />
      </Suspense>
    </div>
  );
}

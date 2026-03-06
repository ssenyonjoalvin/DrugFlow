import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  getDashboardMetrics,
  getStockFlowChartData,
  getLowStockMedicines,
  getExpiringSoon,
  getRecentTransactions,
} from "./lib/data";

function MetricIcon({ name, className }: { name: string; className: string }) {
  const base = "size-8 " + className;
  if (name === "pill")
    return (
      <svg className={base} fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 4h16v3h-2v10H6V7H4V4zm4 2v8h8V6H8z" />
      </svg>
    );
  if (name === "box")
    return (
      <svg className={base} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8 4-8-4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    );
  if (name === "check")
    return (
      <svg className={base} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  if (name === "arrow")
    return (
      <svg className={base} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    );
  return null;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const [metrics, chartData, lowStock, expiringSoon, recentTransactions] =
    await Promise.all([
      getDashboardMetrics(),
      getStockFlowChartData(7),
      getLowStockMedicines(5),
      getExpiringSoon(30, 5),
      getRecentTransactions(8),
    ]);

  const maxVal = Math.max(
    1,
    ...chartData.map((d) => d.in),
    ...chartData.map((d) => d.out)
  );

  const metricCards = [
    {
      title: "Total Medicines",
      value: metrics.totalMedicines.toLocaleString(),
      trend: null as string | null,
      trendUp: true,
      icon: "pill",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      title: "Total Stock",
      value: metrics.totalStock.toLocaleString(),
      trend: null,
      trendUp: true,
      icon: "box",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
    },
    {
      title: "Monthly Received",
      value: metrics.monthlyReceived.toLocaleString(),
      trend:
        metrics.receivedTrend !== 0
          ? `${metrics.receivedTrend >= 0 ? "+" : ""}${metrics.receivedTrend.toFixed(1)}%`
          : null,
      trendUp: metrics.receivedTrend >= 0,
      icon: "check",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      title: "Monthly Issued",
      value: metrics.monthlyIssued.toLocaleString(),
      trend:
        metrics.issuedTrend !== 0
          ? `${metrics.issuedTrend >= 0 ? "+" : ""}${metrics.issuedTrend.toFixed(1)}%`
          : null,
      trendUp: metrics.issuedTrend >= 0,
      icon: "arrow",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((m) => (
          <div
            key={m.title}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-lg p-2 ${m.iconBg} ${m.iconColor}`}>
                <MetricIcon name={m.icon} className={m.iconColor} />
              </div>
              {m.trend != null && (
                <span
                  className={`text-sm font-medium ${
                    m.trendUp ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {m.trend}
                  {m.trendUp ? (
                    <span className="ml-0.5 inline">↑</span>
                  ) : (
                    <span className="ml-0.5 inline">↓</span>
                  )}
                </span>
              )}
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-800">{m.value}</p>
            <p className="mt-0.5 text-sm text-zinc-500">{m.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Stock Flow Trends */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-800">Stock Flow Trends</h2>
            <span className="text-sm text-zinc-500">Last 7 days</span>
          </div>
          <div className="mt-4 flex h-48 items-end gap-1">
            {chartData.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 flex-col justify-end gap-0.5">
                  <div
                    className="w-full rounded-t bg-violet-500/80 transition-opacity hover:opacity-90"
                    style={{
                      height: `${(d.in / maxVal) * 100}%`,
                      minHeight: d.in ? "4px" : "0",
                    }}
                  />
                  <div
                    className="w-full rounded-t border-2 border-dashed border-amber-400 bg-amber-400/20"
                    style={{
                      height: `${(d.out / maxVal) * 100}%`,
                      minHeight: d.out ? "4px" : "0",
                    }}
                  />
                </div>
                <span className="text-xs text-zinc-500">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-6">
            <span className="flex items-center gap-2 text-sm text-zinc-600">
              <span className="size-3 rounded-full bg-violet-500" />
              Stock Incoming
            </span>
            <span className="flex items-center gap-2 text-sm text-zinc-600">
              <span className="size-3 rounded-full border-2 border-dashed border-amber-400" />
              Stock Outgoing
            </span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-zinc-800">
            <span className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            Low Stock Alert
          </h2>
          <ul className="mt-4 space-y-3">
            {lowStock.length === 0 ? (
              <li className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-4 text-center text-sm text-zinc-500">
                No medicines below minimum level
              </li>
            ) : (
              lowStock.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 p-3"
                >
                  <div>
                    <p className="font-medium text-zinc-800">{item.name}</p>
                    <p className="text-sm text-zinc-500">{item.units}</p>
                  </div>
                  <Link
                    href="/inventory/stock-in"
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
                  >
                    Restock
                  </Link>
                </li>
              ))
            )}
          </ul>
          <Link
            href="/reports"
            className="mt-3 block text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            View all low stock
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Stock Transactions */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-zinc-800">Recent Stock Transactions</h2>
          <div className="mt-4 min-h-[180px]">
            {recentTransactions.length === 0 ? (
              <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 text-sm text-zinc-500">
                No recent transactions
              </div>
            ) : (
              <ul className="space-y-2">
                {recentTransactions.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-zinc-800">{t.medicine}</p>
                      <p className="text-sm text-zinc-500">
                        {t.detail ?? t.dateLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          t.type === "in"
                            ? "text-sm font-medium text-emerald-600"
                            : "text-sm font-medium text-red-600"
                        }
                      >
                        {t.type === "in" ? "+" : "−"}
                        {t.quantity.toLocaleString()}
                      </span>
                      <span className="text-xs text-zinc-400">{t.dateLabel}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-zinc-800">
            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </span>
            Expiring Soon
          </h2>
          <ul className="mt-4 space-y-2">
            {expiringSoon.length === 0 ? (
              <li className="rounded-lg bg-amber-50/80 p-4 text-center text-sm text-zinc-500">
                No medicines expiring in the next 30 days
              </li>
            ) : (
              expiringSoon.map((item) => (
                <li
                  key={`${item.name}-${item.batch}`}
                  className="flex items-center justify-between rounded-lg bg-amber-50/80 p-3"
                >
                  <div>
                    <p className="font-medium text-zinc-800">{item.name}</p>
                    <p className="text-sm text-amber-700">{item.text}</p>
                  </div>
                  <span className="text-xs text-zinc-500">{item.batch}</span>
                </li>
              ))
            )}
          </ul>
          <Link
            href="/reports"
            className="mt-3 block text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            View expiry report
          </Link>
        </div>
      </div>

    </div>
  );
}

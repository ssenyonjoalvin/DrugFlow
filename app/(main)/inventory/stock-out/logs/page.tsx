import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function StockOutLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const pageSize = 15;

  const totalCount = await prisma.stockOutEntry.count();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const entries = await prisma.stockOutEntry.findMany({
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * pageSize,
    take: pageSize,
    include: { medicine: { select: { name: true } } },
  });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-800">Stock Out Logs</h2>
      <p className="mt-1 text-sm text-zinc-500">Full history of dispensed medicines.</p>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Medicine
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Reason / Destination
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Dispensed By
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">
                  No stock out entries yet.
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="hover:bg-zinc-50/50">
                  <td className="px-4 py-3 font-medium text-zinc-800">{e.medicine.name}</td>
                  <td className="px-4 py-3 text-sm text-red-600">−{e.quantity}</td>
                  <td className="px-4 py-3 text-sm text-zinc-700">{e.reason ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-zinc-700">{e.dispensedBy}</td>
                  <td className="px-4 py-3 text-sm text-zinc-700">
                    {e.dateOfIssue.toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalCount > 0 && (
        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3">
          <p className="text-sm text-zinc-500">
            Showing {(safePage - 1) * pageSize + 1} to{" "}
            {Math.min(safePage * pageSize, totalCount)} of {totalCount} entries
          </p>
          <div className="flex gap-1">
            <Link
              href={safePage > 1 ? `/inventory/stock-out/logs?page=${safePage - 1}` : "#"}
              className={`rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 ${
                safePage <= 1 ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Previous
            </Link>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/inventory/stock-out/logs?page=${p}`}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  safePage === p
                    ? "bg-violet-600 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {p}
              </Link>
            ))}
            <Link
              href={safePage < totalPages ? `/inventory/stock-out/logs?page=${safePage + 1}` : "#"}
              className={`rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 ${
                safePage >= totalPages ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

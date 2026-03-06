import { prisma } from "@/lib/db";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function getDashboardMetrics() {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const [
    medicineCount,
    stockBalance,
    thisMonthReceived,
    thisMonthIssued,
    lastMonthReceived,
    lastMonthIssued,
  ] = await Promise.all([
    prisma.medicine.count(),
    prisma.medicine.aggregate({ _sum: { quantity: true } }),
    prisma.stockInEntry.aggregate({
      where: { createdAt: { gte: thisMonthStart, lte: today } },
      _sum: { quantity: true },
    }),
    prisma.stockOutEntry.aggregate({
      where: { dateOfIssue: { gte: thisMonthStart, lte: today } },
      _sum: { quantity: true },
    }),
    prisma.stockInEntry.aggregate({
      where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } },
      _sum: { quantity: true },
    }),
    prisma.stockOutEntry.aggregate({
      where: { dateOfIssue: { gte: lastMonthStart, lt: thisMonthStart } },
      _sum: { quantity: true },
    }),
  ]);

  const received = thisMonthReceived._sum.quantity ?? 0;
  const issued = thisMonthIssued._sum.quantity ?? 0;
  const prevReceived = lastMonthReceived._sum.quantity ?? 0;
  const prevIssued = lastMonthIssued._sum.quantity ?? 0;

  const receivedTrend = prevReceived > 0 ? ((received - prevReceived) / prevReceived) * 100 : 0;
  const issuedTrend = prevIssued > 0 ? ((issued - prevIssued) / prevIssued) * 100 : 0;

  return {
    totalMedicines: medicineCount,
    totalStock: stockBalance._sum.quantity ?? 0,
    monthlyReceived: received,
    monthlyIssued: issued,
    receivedTrend,
    issuedTrend,
  };
}

export async function getStockFlowChartData(days = 7) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  const [stockIn, stockOut] = await Promise.all([
    prisma.stockInEntry.findMany({
      where: { createdAt: { gte: start } },
      select: { quantity: true, createdAt: true },
    }),
    prisma.stockOutEntry.findMany({
      where: { dateOfIssue: { gte: start } },
      select: { quantity: true, dateOfIssue: true },
    }),
  ]);

  const dayMap = new Map<string, { in: number; out: number }>();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, { in: 0, out: 0 });
  }

  stockIn.forEach((e) => {
    const key = e.createdAt.toISOString().slice(0, 10);
    const curr = dayMap.get(key) ?? { in: 0, out: 0 };
    curr.in += e.quantity;
    dayMap.set(key, curr);
  });

  stockOut.forEach((e) => {
    const key = e.dateOfIssue.toISOString().slice(0, 10);
    const curr = dayMap.get(key) ?? { in: 0, out: 0 };
    curr.out += e.quantity;
    dayMap.set(key, curr);
  });

  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateStr, data]) => {
      const d = new Date(dateStr);
      return {
        day: DAYS[d.getDay()],
        date: dateStr,
        in: data.in,
        out: data.out,
      };
    });
}

export async function getLowStockMedicines(limit = 5) {
  const medicines = await prisma.medicine.findMany({
    where: { minStock: { gt: 0 } },
    include: { unitMeasure: { select: { name: true } } },
  });
  return medicines
    .filter((m) => m.quantity < m.minStock)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, limit)
    .map((m) => ({
      name: m.name,
      units: `${m.quantity} ${m.unitMeasure.name} left`,
      minStock: m.minStock,
      quantity: m.quantity,
    }));
}

export async function getExpiringSoon(days = 30, limit = 5) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);

  const entries = await prisma.stockInEntry.findMany({
    where: {
      expiryDate: { lte: cutoff, gte: new Date() },
    },
    include: { medicine: { select: { name: true } } },
    orderBy: { expiryDate: "asc" },
    take: limit,
  });

  return entries.map((e) => {
    const diff = Math.ceil((e.expiryDate!.getTime() - Date.now()) / 86400000);
    return {
      name: e.medicine.name,
      text: diff <= 0 ? "Expired" : `Expires in ${diff} day${diff === 1 ? "" : "s"}`,
      batch: `Batch #${e.batchNumber}`,
    };
  });
}

export async function getRecentTransactions(limit = 8) {
  const [inEntries, outEntries] = await Promise.all([
    prisma.stockInEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { medicine: { select: { name: true } } },
    }),
    prisma.stockOutEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { medicine: { select: { name: true } } },
    }),
  ]);

  const combined: {
    id: string;
    type: "in" | "out";
    medicine: string;
    quantity: number;
    date: Date;
    detail?: string;
  }[] = [];

  inEntries.forEach((e) =>
    combined.push({
      id: e.id,
      type: "in",
      medicine: e.medicine.name,
      quantity: e.quantity,
      date: e.createdAt,
      detail: e.batchNumber,
    })
  );
  outEntries.forEach((e) =>
    combined.push({
      id: e.id,
      type: "out",
      medicine: e.medicine.name,
      quantity: e.quantity,
      date: e.dateOfIssue,
      detail: e.reason ?? undefined,
    })
  );

  return combined
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit)
    .map((t) => ({
      ...t,
      dateLabel: formatRelative(t.date),
    }));
}

function formatRelative(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

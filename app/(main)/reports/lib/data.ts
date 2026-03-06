import { prisma } from "@/lib/db";

export type DateRange = {
  from: Date;
  to: Date;
};

export function getDateRange(range: string, fromParam?: string, toParam?: string): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  if (range === "custom" && fromParam && toParam) {
    const from = new Date(fromParam);
    const to = new Date(toParam);
    if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
      return { from, to };
    }
  }

  if (range === "last_3_months") {
    const from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return { from, to: today };
  }

  // Default: this_month
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from, to: today };
}

export async function getSummaryMetrics(dateRange: DateRange) {
  const [totalReceived, totalIssued, stockBalance] = await Promise.all([
    prisma.stockInEntry.aggregate({
      where: {
        createdAt: { gte: dateRange.from, lte: dateRange.to },
      },
      _sum: { quantity: true },
    }),
    prisma.stockOutEntry.aggregate({
      where: {
        dateOfIssue: { gte: dateRange.from, lte: dateRange.to },
      },
      _sum: { quantity: true },
    }),
    prisma.medicine.aggregate({
      _sum: { quantity: true },
    }),
  ]);

  return {
    totalReceived: totalReceived._sum.quantity ?? 0,
    totalIssued: totalIssued._sum.quantity ?? 0,
    currentStockBalance: stockBalance._sum.quantity ?? 0,
    totalPurchaseCost: null as number | null, // Schema has no cost field; can be wired when cost tracking exists
  };
}

export async function getStockFlowData(dateRange: DateRange) {
  const [stockIn, stockOut] = await Promise.all([
    prisma.stockInEntry.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: dateRange.from, lte: dateRange.to },
      },
      _sum: { quantity: true },
    }),
    prisma.stockOutEntry.groupBy({
      by: ["dateOfIssue"],
      where: {
        dateOfIssue: { gte: dateRange.from, lte: dateRange.to },
      },
      _sum: { quantity: true },
    }),
  ]);

  // Aggregate by month
  const monthlyMap = new Map<string, { stockIn: number; stockOut: number }>();

  stockIn.forEach((e) => {
    const key = `${e.createdAt.getFullYear()}-${String(e.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const curr = monthlyMap.get(key) ?? { stockIn: 0, stockOut: 0 };
    curr.stockIn += e._sum.quantity ?? 0;
    monthlyMap.set(key, curr);
  });

  stockOut.forEach((e) => {
    const key = `${e.dateOfIssue.getFullYear()}-${String(e.dateOfIssue.getMonth() + 1).padStart(2, "0")}`;
    const curr = monthlyMap.get(key) ?? { stockIn: 0, stockOut: 0 };
    curr.stockOut += e._sum.quantity ?? 0;
    monthlyMap.set(key, curr);
  });

  return Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      label: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      stockIn: data.stockIn,
      stockOut: data.stockOut,
    }));
}

export async function getTopConsumedMedicines(dateRange: DateRange, limit = 10) {
  const issued = await prisma.stockOutEntry.groupBy({
    by: ["medicineId"],
    where: {
      dateOfIssue: { gte: dateRange.from, lte: dateRange.to },
    },
    _sum: { quantity: true },
  });

  const total = issued.reduce((acc, e) => acc + (e._sum.quantity ?? 0), 0);
  if (total === 0) return [];

  const medicineIds = issued.map((e) => e.medicineId);
  const medicines = await prisma.medicine.findMany({
    where: { id: { in: medicineIds } },
    select: { id: true, name: true },
  });
  const medicineMap = new Map(medicines.map((m) => [m.id, m.name]));

  return issued
    .map((e) => ({
      medicineId: e.medicineId,
      medicineName: medicineMap.get(e.medicineId) ?? "Unknown",
      quantity: e._sum.quantity ?? 0,
      percentage: total > 0 ? ((e._sum.quantity ?? 0) / total) * 100 : 0,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

export async function getLowStockMedicines() {
  const medicines = await prisma.medicine.findMany({
    where: { minStock: { gt: 0 } },
    include: { category: { select: { name: true } } },
  });
  return medicines
    .filter((m) => m.quantity < m.minStock)
    .sort((a, b) => a.quantity - b.quantity);
}

export async function getExpiringMedicines(days = 60) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);

  const entries = await prisma.stockInEntry.findMany({
    where: {
      expiryDate: { lte: cutoff, gte: new Date() },
    },
    include: { medicine: { select: { id: true, name: true } } },
  });

  const byMedicine = new Map<string, { name: string; quantity: number; nearestExpiry: Date }>();
  entries.forEach((e) => {
    const existing = byMedicine.get(e.medicineId);
    const qty = (existing?.quantity ?? 0) + e.quantity;
    const exp = e.expiryDate!;
    const nearest = !existing ? exp : (exp < existing.nearestExpiry ? exp : existing.nearestExpiry);
    byMedicine.set(e.medicineId, {
      name: e.medicine.name,
      quantity: qty,
      nearestExpiry: nearest,
    });
  });

  return Array.from(byMedicine.values()).sort((a, b) => a.nearestExpiry.getTime() - b.nearestExpiry.getTime());
}

export async function getMonthlySummaryReport(dateRange: DateRange) {
  const [stockIn, stockOut] = await Promise.all([
    prisma.stockInEntry.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: dateRange.from, lte: dateRange.to } },
      _sum: { quantity: true },
    }),
    prisma.stockOutEntry.groupBy({
      by: ["dateOfIssue"],
      where: { dateOfIssue: { gte: dateRange.from, lte: dateRange.to } },
      _sum: { quantity: true },
    }),
  ]);

  const monthlyMap = new Map<string, { inflow: number; outflow: number }>();

  stockIn.forEach((e) => {
    const key = `${e.createdAt.getFullYear()}-${String(e.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const curr = monthlyMap.get(key) ?? { inflow: 0, outflow: 0 };
    curr.inflow += e._sum.quantity ?? 0;
    monthlyMap.set(key, curr);
  });

  stockOut.forEach((e) => {
    const key = `${e.dateOfIssue.getFullYear()}-${String(e.dateOfIssue.getMonth() + 1).padStart(2, "0")}`;
    const curr = monthlyMap.get(key) ?? { inflow: 0, outflow: 0 };
    curr.outflow += e._sum.quantity ?? 0;
    monthlyMap.set(key, curr);
  });

  return Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      label: new Date(month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      inflow: data.inflow,
      outflow: data.outflow,
      net: data.inflow - data.outflow,
    }));
}

export async function getConsumptionByCategory(dateRange: DateRange) {
  const issued = await prisma.stockOutEntry.findMany({
    where: { dateOfIssue: { gte: dateRange.from, lte: dateRange.to } },
    include: { medicine: { include: { category: { select: { name: true } } } } },
  });

  const byCategory = new Map<string, number>();
  issued.forEach((e) => {
    const cat = e.medicine.category.name;
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + e.quantity);
  });

  const total = issued.reduce((acc, e) => acc + e.quantity, 0);
  return Array.from(byCategory.entries())
    .map(([category, quantity]) => ({
      category,
      quantity,
      percentage: total > 0 ? (quantity / total) * 100 : 0,
    }))
    .sort((a, b) => b.quantity - a.quantity);
}

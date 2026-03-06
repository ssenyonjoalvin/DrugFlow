import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InventoryTable } from "./inventory-table";

export default async function InventoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const medicines = await prisma.medicine.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      dosage: true,
      quantity: true,
      minStock: true,
      category: { select: { name: true } },
    },
  });

  const medicinesForTable = medicines.map((m) => ({
    id: m.id,
    name: m.name,
    dosage: m.dosage,
    categoryName: m.category.name,
    quantity: m.quantity,
    minStock: m.minStock,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Medicine Inventory</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Real-time tracking of essential pharmaceutical supplies.</p>
        </div>
        <Link
          href="/inventory/new"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Medicine
        </Link>
      </div>

      <InventoryTable medicines={medicinesForTable} />
    </div>
  );
}

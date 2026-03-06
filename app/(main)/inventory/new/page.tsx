import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NewMedicineForm } from "./new-medicine-form";

export default async function NewMedicinePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const [categories, unitMeasures] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.unitMeasure.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return <NewMedicineForm categories={categories} unitMeasures={unitMeasures} />;
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UnitMeasuresContent } from "./unit-measures-content";

export default async function UnitMeasuresPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const units = await prisma.unitMeasure.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, description: true },
  });

  return <UnitMeasuresContent units={units} />;
}

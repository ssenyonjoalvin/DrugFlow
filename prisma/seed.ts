import { PrismaClient } from "@prisma/client";
import { ensureDefaultAdmin } from "../lib/ensure-default-admin";

const prisma = new PrismaClient();

async function main() {
  await ensureDefaultAdmin();
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

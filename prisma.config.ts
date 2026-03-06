/**
 * Prisma config: schema path and seed.
 * When this file exists, Prisma skips loading .env, so we load it here.
 * Run all Prisma commands from the durgflow directory (this folder).
 */
import path from "path";
import { config } from "dotenv";

config({ path: path.resolve(process.cwd(), ".env") });

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
};

import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Load .env.local so prisma CLI picks up DATABASE_URL / DIRECT_URL
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"] ?? "",
    directUrl: process.env["DIRECT_URL"],
  },
});

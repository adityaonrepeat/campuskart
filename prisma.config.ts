import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Load .env.local so prisma CLI picks up DATABASE_URL / DIRECT_URL
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma 7: the CLI (migrate / db push / studio) uses this single `url`.
    // Prefer the direct (unpooled) Neon URL here; the app runtime connects via the
    // pooled DATABASE_URL in src/lib/db.ts. `directUrl` is no longer a valid key.
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"] || "",
  },
});

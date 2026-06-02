import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // Neon free-tier auto-suspends the compute after ~5 min idle. The first query
  // after a cold start can briefly fail with "Can't reach database server".
  // keepAlive holds sockets warm and a finite connect timeout fails fast/clearly
  // instead of hanging, so the next request (post wake-up) succeeds.
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    keepAlive: true,
    connectionTimeoutMillis: 10_000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Pinged by a cron every few minutes to keep the Neon compute warm.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "up", at: new Date().toISOString() });
  } catch {
    return NextResponse.json(
      { ok: false, db: "down", at: new Date().toISOString() },
      { status: 503 }
    );
  }
}

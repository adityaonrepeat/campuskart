import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Pinged by a cron every few minutes to keep the Neon compute warm.
// Also wakes the socket server (separate Render free service that sleeps
// after ~15 min idle) so chat connections don't fail on a cold start.
export const dynamic = "force-dynamic";

async function pingSocketServer(): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (!url) return "skipped";
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${url}/health`, { cache: "no-store", signal: controller.signal });
    clearTimeout(timer);
    return res.ok ? "up" : "down";
  } catch {
    return "down";
  }
}

export async function GET() {
  const [db_, socket] = await Promise.all([
    db.$queryRaw`SELECT 1`.then(() => "up").catch(() => "down"),
    pingSocketServer(),
  ]);

  const ok = db_ === "up";
  return NextResponse.json(
    { ok, db: db_, socket, at: new Date().toISOString() },
    { status: ok ? 200 : 503 }
  );
}

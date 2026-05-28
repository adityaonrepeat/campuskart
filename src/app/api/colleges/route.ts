import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const colleges = await db.college.findMany({
    select: { id: true, name: true, city: true, state: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(colleges);
}

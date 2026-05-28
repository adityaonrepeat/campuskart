import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/types/api";

const userSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
  avatarUrl: true,
  createdAt: true,
  college: { select: { id: true, name: true, city: true, state: true } },
  _count: { select: { listings: { where: { status: "ACTIVE" } } } },
} as const;

export type MeResponse = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
  college: { id: string; name: string; city: string; state: string };
  _count: { listings: number };
};

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: userSelect,
  });

  if (!user) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json<ApiResponse<MeResponse>>({
    success: true,
    data: user as MeResponse,
  });
}

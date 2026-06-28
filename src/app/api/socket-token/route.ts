import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createHmac } from "crypto";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const secret = process.env.BETTER_AUTH_SECRET ?? "";
  const payload = Buffer.from(
    JSON.stringify({
      userId: session.user.id,
      collegeId: session.user.collegeId,
      exp: Date.now() + 60_000,
    })
  ).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");

  return NextResponse.json({ success: true, token: `${payload}.${sig}` });
}

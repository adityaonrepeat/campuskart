import type { Socket } from "socket.io";
import { createHmac, timingSafeEqual } from "crypto";
import type { ClientToServerEvents, ServerToClientEvents, SocketData } from "./types";

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

interface TokenPayload {
  userId: string;
  collegeId: string;
  exp: number;
}

export async function validateSocketAuth(socket: AppSocket): Promise<void> {
  const token = socket.handshake.auth?.token;
  if (typeof token !== "string" || !token) {
    throw new Error("No auth token");
  }

  const [payload, sig] = token.split(".");
  if (!payload || !sig) {
    throw new Error("Malformed token");
  }

  const secret = process.env.BETTER_AUTH_SECRET ?? "";
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    throw new Error("Invalid token signature");
  }

  const decoded = JSON.parse(
    Buffer.from(payload, "base64url").toString()
  ) as TokenPayload;
  if (!decoded.userId || !decoded.collegeId) {
    throw new Error("Invalid token payload");
  }
  if (Date.now() > decoded.exp) {
    throw new Error("Token expired");
  }

  socket.data.userId = decoded.userId;
  socket.data.collegeId = decoded.collegeId;
}

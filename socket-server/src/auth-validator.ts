import type { Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents, SocketData } from "./types";

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

interface BetterAuthUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  collegeId: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BetterAuthSessionResponse {
  session: { id: string; userId: string; expiresAt: string };
  user: BetterAuthUser;
}

export async function validateSocketAuth(socket: AppSocket): Promise<void> {
  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) {
    throw new Error("No cookie header");
  }

  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/auth/get-session`, {
    headers: { cookie: cookieHeader },
  });

  if (!response.ok) {
    throw new Error(`Auth endpoint returned ${response.status}`);
  }

  const data = (await response.json()) as BetterAuthSessionResponse | null;

  if (!data?.session || !data?.user?.id || !data?.user?.collegeId) {
    throw new Error("Invalid or expired session");
  }

  socket.data.userId = data.user.id;
  socket.data.collegeId = data.user.collegeId;
}

import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket";

// Socket generics: Socket<ListenEvents, EmitEvents>
export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;

export function getSocket(): AppSocket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      autoConnect: false,
      transports: ["websocket"],
      auth: async (cb) => {
        try {
          const res = await fetch("/api/socket-token", { credentials: "include" });
          const json = (await res.json()) as { token?: string };
          cb({ token: json.token ?? "" });
        } catch {
          cb({ token: "" });
        }
      },
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

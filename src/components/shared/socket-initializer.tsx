"use client";

import { useSocket } from "@/hooks/use-socket";

export function SocketInitializer() {
  useSocket();
  return null;
}

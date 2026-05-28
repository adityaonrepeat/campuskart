"use client";

import { useEffect } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket-client";
import { useSocketStore } from "@/stores/socket-store";
import type { TypingPayload } from "@/types/socket";

export function useSocket(): void {
  const { setSocket, setConnected, setOnlineUsers, addOnlineUser, removeOnlineUser, setTyping } =
    useSocketStore();

  useEffect(() => {
    const socket = getSocket();
    setSocket(socket);
    socket.connect();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onSnapshot = (userIds: string[]) => setOnlineUsers(userIds);
    const onOnline = (userId: string) => addOnlineUser(userId);
    const onOffline = (userId: string) => removeOnlineUser(userId);
    const onTyping = ({ conversationId, userId, isTyping }: TypingPayload) =>
      setTyping(conversationId, userId, isTyping);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("server:presence_snapshot", onSnapshot);
    socket.on("server:user_online", onOnline);
    socket.on("server:user_offline", onOffline);
    socket.on("server:typing", onTyping);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("server:presence_snapshot", onSnapshot);
      socket.off("server:user_online", onOnline);
      socket.off("server:user_offline", onOffline);
      socket.off("server:typing", onTyping);
      disconnectSocket();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

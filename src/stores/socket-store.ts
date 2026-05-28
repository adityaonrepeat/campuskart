import { create } from "zustand";
import type { AppSocket } from "@/lib/socket-client";

interface SocketStore {
  socket: AppSocket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  typingUsers: Record<string, string[]>; // conversationId → userId[]

  setSocket: (socket: AppSocket) => void;
  setConnected: (v: boolean) => void;
  setOnlineUsers: (users: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
}

export const useSocketStore = create<SocketStore>((set) => ({
  socket: null,
  isConnected: false,
  onlineUsers: new Set<string>(),
  typingUsers: {},

  setSocket: (socket) => set({ socket }),
  setConnected: (v) => set({ isConnected: v }),
  setOnlineUsers: (users) => set({ onlineUsers: new Set(users) }),
  addOnlineUser: (userId) =>
    set((state) => ({ onlineUsers: new Set([...state.onlineUsers, userId]) })),
  removeOnlineUser: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUsers);
      next.delete(userId);
      return { onlineUsers: next };
    }),
  setTyping: (conversationId, userId, isTyping) =>
    set((state) => {
      const current = state.typingUsers[conversationId] ?? [];
      const updated = isTyping
        ? [...new Set([...current, userId])]
        : current.filter((id) => id !== userId);
      return {
        typingUsers: { ...state.typingUsers, [conversationId]: updated },
      };
    }),
}));

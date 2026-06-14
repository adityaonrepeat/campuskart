export type AckCallback = (response: { success: boolean; error?: string }) => void;

export interface SendMessagePayload {
  conversationId: string;
  content: string;
}

export interface TypingPayload {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface MessageWithSender {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  createdAt: string; // ISO string; no Date objects over the wire
}

export interface SocketError {
  code: string;
  message: string;
}

export interface ClientToServerEvents {
  "client:join_conversation": (conversationId: string, callback: AckCallback) => void;
  "client:leave_conversation": (conversationId: string) => void;
  "client:send_message": (payload: SendMessagePayload, callback: AckCallback) => void;
  "client:typing_start": (conversationId: string) => void;
  "client:typing_stop": (conversationId: string) => void;
  "client:mark_read": (conversationId: string) => void;
}

export interface ServerToClientEvents {
  "server:message_received": (message: MessageWithSender) => void;
  "server:typing": (payload: TypingPayload) => void;
  "server:user_online": (userId: string) => void;
  "server:user_offline": (userId: string) => void;
  "server:presence_snapshot": (userIds: string[]) => void;
  "server:error": (error: SocketError) => void;
}

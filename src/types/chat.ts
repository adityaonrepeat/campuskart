import type { PaginatedResponse } from "./api";

export interface ConversationParticipant {
  userId: string;
  name: string;
  avatarUrl: string | null;
  username: string;
}

export interface ConversationListItem {
  id: string;
  listingId: string | null;
  listingTitle: string | null;
  listingImage: string | null;
  listingStatus: string | null;
  otherParticipant: ConversationParticipant;
  lastMessage: string | null;
  lastMessageAt: string | null; // ISO string
  unreadCount: number;
}

export interface ConversationDetail {
  id: string;
  listingId: string | null;
  listingTitle: string | null;
  listingImage: string | null;
  listingStatus: string | null;
  listingPrice: number | null;
  otherParticipant: ConversationParticipant;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  createdAt: string; // ISO string
}

export type PaginatedMessages = PaginatedResponse<Message>;

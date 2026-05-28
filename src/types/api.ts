export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

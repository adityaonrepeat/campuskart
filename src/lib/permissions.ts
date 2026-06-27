import type { Role, StoreStatus, ListingStatus } from "@prisma/client";

// Shape of `session.user` — call sites pass it directly.
export interface Viewer {
  id: string;
  role?: Role | string | null;
  collegeId?: string | null;
}

export function roleOf(viewer: Viewer): Role {
  return (viewer.role ?? "USER") as Role;
}

export function isAdmin(viewer: Viewer): boolean {
  return roleOf(viewer) === "ADMIN";
}

export function canModerate(viewer: Viewer): boolean {
  const role = roleOf(viewer);
  return role === "MODERATOR" || role === "ADMIN";
}

export function sharesCollege(viewer: Viewer, collegeId: string): boolean {
  return viewer.collegeId != null && viewer.collegeId === collegeId;
}

// Admin → any college; moderator → own college only.
export function canModerateCollege(viewer: Viewer, collegeId: string): boolean {
  if (isAdmin(viewer)) return true;
  return canModerate(viewer) && sharesCollege(viewer, collegeId);
}

// Owner always; admin any; moderator own college; user own college + ACTIVE.
export function canViewStore(
  viewer: Viewer,
  store: { ownerId: string; collegeId: string; status: StoreStatus }
): boolean {
  if (store.ownerId === viewer.id) return true;
  if (isAdmin(viewer)) return true;
  if (!sharesCollege(viewer, store.collegeId)) return false;
  if (canModerate(viewer)) return true;
  return store.status === "ACTIVE";
}

// Like canViewStore, but users also see SOLD — only ARCHIVED is hidden.
export function canViewListing(
  viewer: Viewer,
  listing: { sellerId: string; collegeId: string; status: ListingStatus }
): boolean {
  if (listing.sellerId === viewer.id) return true;
  if (isAdmin(viewer)) return true;
  if (!sharesCollege(viewer, listing.collegeId)) return false;
  if (canModerate(viewer)) return true;
  return listing.status !== "ARCHIVED";
}

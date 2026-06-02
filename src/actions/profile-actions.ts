"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/types/api";
import type { User } from "@prisma/client";
import { updateProfileSchema, type UpdateProfileInput } from "@/types/profile";

export { updateProfileSchema, type UpdateProfileInput };

export async function updateProfile(
  input: UpdateProfileInput
): Promise<ApiResponse<Pick<User, "id" | "name" | "username" | "avatarUrl">>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, username, avatarUrl, bio } = parsed.data;

  // Unique username check — exclude current user
  if (username !== session.user.username) {
    const existing = await db.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (existing) {
      return { success: false, error: "Username is already taken", code: "USERNAME_TAKEN" };
    }
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data: {
      name,
      username,
      ...(avatarUrl !== undefined && { avatarUrl: avatarUrl || null }),
      bio: bio || null,
    },
    select: { id: true, name: true, username: true, avatarUrl: true },
  });

  revalidatePath("/profile");
  revalidatePath(`/profile/${username}`);

  return { success: true, data: user };
}

import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32)
    .regex(/^[a-z0-9_]+$/, "Username may only contain lowercase letters, numbers and underscores"),
  avatarUrl: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
  bio: z.string().max(200, "Bio must be 200 characters or less").optional().or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

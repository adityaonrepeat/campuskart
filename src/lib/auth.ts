import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!user.email.toLowerCase().endsWith("@gmail.com")) {
            throw new Error("Only Gmail addresses are allowed");
          }
          const college = await db.college.findUnique({
            where: { id: (user as { collegeId?: string }).collegeId ?? "" },
            select: { id: true },
          });
          if (!college) throw new Error("Invalid college");
          return { data: user };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [username()],
  user: {
    additionalFields: {
      collegeId: {
        type: "string",
        required: true,
        input: true,
      },
      avatarUrl: {
        type: "string",
        required: false,
        input: true,
      },
      role: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;

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

          const typed = user as { collegeId?: string; username?: string };

          // OAuth signups have no username; generate one from name/email
          if (!typed.username) {
            const base = (user.name ?? user.email.split("@")[0])
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")
              .slice(0, 20) || "user";
            const suffix = Math.floor(Math.random() * 9000 + 1000);
            const generated = `${base}${suffix}`;
            // check uniqueness; retry once if collision
            const exists = await db.user.findUnique({ where: { username: generated }, select: { id: true } });
            typed.username = exists
              ? `${base}${Math.floor(Math.random() * 90000 + 10000)}`
              : generated;
          }

          // OAuth signups have no collegeId yet; /complete-profile collects it after
          if (!typed.collegeId) return { data: user };
          const college = await db.college.findUnique({
            where: { id: typed.collegeId },
            select: { id: true },
          });
          if (!college) throw new Error("Invalid college");
          return { data: user };
        },
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
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

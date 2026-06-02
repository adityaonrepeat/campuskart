"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function completeProfile(
  collegeId: string
): Promise<{ error: string } | never> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  if (!collegeId?.trim()) return { error: "Please select your college." };

  const college = await db.college.findUnique({ where: { id: collegeId } });
  if (!college) return { error: "Invalid college selected." };

  await db.user.update({
    where: { id: session.user.id },
    data: { collegeId },
  });

  redirect("/listings");
}

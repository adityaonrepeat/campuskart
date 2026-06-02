import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";

export const metadata = { title: "Edit Profile — CampusKart" };

export default async function ProfileEditPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, username: true, avatarUrl: true, bio: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="py-6 space-y-6">
      <h1 className="text-xl font-bold">Edit profile</h1>
      <ProfileEditForm initialValues={user} />
    </div>
  );
}

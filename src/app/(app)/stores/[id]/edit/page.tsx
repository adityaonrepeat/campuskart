import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { StoreForm } from "@/components/stores/store-form";
import type { StoreDetail } from "@/types/store";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Edit store — CampusKart" };

export default async function EditStorePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const store = await db.store.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      images: true,
      phone: true,
      whatsapp: true,
      location: true,
      mapUrl: true,
      hours: true,
      quickReplies: true,
      isVerified: true,
      status: true,
      ownerId: true,
      collegeId: true,
      createdAt: true,
      owner: { select: { id: true, name: true, avatarUrl: true, username: true } },
      reviews: { where: { isArchived: false }, select: { id: true, rating: true, body: true, createdAt: true, user: { select: { id: true, name: true, avatarUrl: true } } } },
      _count: { select: { reviews: { where: { isArchived: false } } } },
    },
  });

  if (!store) notFound();
  if (store.ownerId !== session.user.id) redirect(`/stores/${id}`);

  return (
    <div className="py-6 space-y-6">
      <h1 className="text-xl font-bold">Edit store</h1>
      <StoreForm store={store as StoreDetail} />
    </div>
  );
}

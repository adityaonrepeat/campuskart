import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ListingCard } from "@/components/listings/listing-card";
import { Package } from "lucide-react";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  return { title: `@${username} — CampusKart` };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const profileUser = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      createdAt: true,
      college: { select: { name: true, city: true, state: true } },
      _count: { select: { listings: { where: { status: "ACTIVE" } } } },
    },
  });

  if (!profileUser) notFound();

  // Own profile → redirect to /profile
  if (profileUser.id === session.user.id) redirect("/profile");

  const listings = await db.listing.findMany({
    where: { sellerId: profileUser.id, status: "ACTIVE" },
    select: {
      id: true,
      title: true,
      price: true,
      images: true,
      category: true,
      condition: true,
      status: true,
      createdAt: true,
      seller: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="py-6 space-y-6">
      {/* Profile header */}
      <div className="flex items-start gap-4">
        <UserAvatar name={profileUser.name} avatarUrl={profileUser.avatarUrl} size="xl" />

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{profileUser.name}</h1>
          <p className="text-sm text-muted-foreground">@{profileUser.username}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {profileUser.college.name}
            {profileUser.college.city ? `, ${profileUser.college.city}` : ""}
          </p>

          <div className="flex items-center gap-4 mt-3">
            <div className="text-center">
              <p className="text-base font-bold leading-tight">{profileUser._count.listings}</p>
              <p className="text-xs text-muted-foreground">Active listings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active listings */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Active listings</h2>

        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground border rounded-xl">
            <Package className="h-10 w-10 opacity-30" />
            <p className="text-sm font-medium">No active listings</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileView } from "@/components/profile/profile-view";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      college: { select: { name: true, city: true } },
      _count: {
        select: {
          listings: { where: { status: "ACTIVE" } },
        },
      },
    },
  });

  if (!user) redirect("/login");

  const listings = await db.listing.findMany({
    where: { sellerId: session.user.id },
    select: {
      id: true,
      title: true,
      price: true,
      images: true,
      category: true,
      condition: true,
      status: true,
      listingType: true,
      createdAt: true,
      seller: { select: { id: true, name: true, avatarUrl: true } },
      college: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const soldCount = listings.filter((l) => l.status === "SOLD").length;

  return (
    <ProfileView
      user={{
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl ?? null,
        bio: user.bio ?? null,
        collegeName: user.college?.name ?? "",
        collegeCity: user.college?.city ?? null,
        joinedAt: user.createdAt,
        activeListings: user._count.listings,
        totalListed: listings.length,
        soldCount,
      }}
      listings={listings}
    />
  );
}

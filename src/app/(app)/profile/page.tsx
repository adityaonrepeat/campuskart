import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ListingCard } from "@/components/listings/listing-card";
import { cn } from "@/lib/utils";
import { Pencil, Package } from "lucide-react";

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
      createdAt: true,
      college: { select: { name: true, city: true, state: true } },
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
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="xl" />

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{user.name}</h1>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {user.college.name}
            {user.college.city ? `, ${user.college.city}` : ""}
          </p>

          <div className="flex items-center gap-4 mt-3">
            <div className="text-center">
              <p className="text-base font-bold leading-tight">{user._count.listings}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold leading-tight">{listings.length}</p>
              <p className="text-xs text-muted-foreground">Total listed</p>
            </div>
          </div>
        </div>

        <Link
          href="/profile/edit"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
        >
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Edit
        </Link>
      </div>

      {/* Listings */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Your listings</h2>

        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground border rounded-xl">
            <Package className="h-10 w-10 opacity-30" />
            <p className="text-sm font-medium">No listings yet</p>
            <Link
              href="/listings/new"
              className={cn(buttonVariants({ size: "sm" }), "mt-1")}
            >
              Post your first listing
            </Link>
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

import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ListingForm } from "@/components/listings/listing-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const listing = await db.listing.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          username: true,
          college: { select: { name: true } },
        },
      },
    },
  });

  if (!listing || listing.collegeId !== session.user.collegeId) {
    notFound();
  }

  if (listing.sellerId !== session.user.id) {
    redirect(`/listings/${id}`);
  }

  return (
    <div className="py-6 space-y-6">
      <h1 className="text-xl font-bold">Edit listing</h1>
      <ListingForm listing={listing} />
    </div>
  );
}

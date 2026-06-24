import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import AppHeader from "@/components/AppHeader";
import { ListingDetailView } from "@/components/listings/listing-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: PageProps) {
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

  const role = session.user.role ?? "USER";
  const isMod = role === "ADMIN" || role === "MODERATOR";
  if (!listing || (!isMod && listing.collegeId !== session.user.collegeId)) {
    notFound();
  }

  return (
    <>
      <AppHeader
        user={{ name: session.user.name ?? "User", avatarUrl: session.user.avatarUrl }}
        forceScrolled
      />
      <ListingDetailView
        listing={listing}
        currentUserId={session.user.id}
      />
    </>
  );
}

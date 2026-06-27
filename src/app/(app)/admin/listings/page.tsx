import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminFilters } from "@/components/admin/admin-filters";
import { RemoveListingButton } from "@/components/admin/remove-listing-button";
import { ListingStatus } from "@prisma/client";
import { canModerate, isAdmin } from "@/lib/permissions";

const PAGE_SIZE = 20;

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  SOLD: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  ARCHIVED: "bg-muted text-muted-foreground",
};

const VALID_STATUSES = new Set(Object.values(ListingStatus));

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; college?: string; page?: string }>;
}

export default async function AdminListingsPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (!canModerate(session.user)) redirect("/listings");
  const admin = isAdmin(session.user);

  const { search, status, college, page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr ?? 1));

  const parsedStatus: ListingStatus | undefined =
    status && status !== "ALL" && VALID_STATUSES.has(status as ListingStatus)
      ? (status as ListingStatus)
      : status === "ALL"
        ? undefined
        : ListingStatus.ACTIVE;

  const collegeFilter = admin ? (college || undefined) : session.user.collegeId;

  const where = {
    ...(collegeFilter ? { collegeId: collegeFilter } : {}),
    ...(parsedStatus !== undefined ? { status: parsedStatus } : {}),
    ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
  };

  const [listings, total, colleges] = await Promise.all([
    db.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        price: true,
        images: true,
        status: true,
        createdAt: true,
        seller: { select: { name: true } },
        college: { select: { name: true } },
      },
    }),
    db.listing.count({ where }),
    admin
      ? db.college.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })
      : Promise.resolve([] as { id: string; name: string }[]),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildHref(p: number) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (college) params.set("college", college);
    params.set("page", String(p));
    return `/admin/listings?${params.toString()}`;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {total} listing{total !== 1 ? "s" : ""}
      </p>

      <AdminFilters
        isAdmin={admin}
        colleges={colleges}
        defaultValues={{ search, status: status ?? "ACTIVE", college }}
      />

      {listings.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-12 border rounded-xl">
          No listings found.
        </p>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            const image = listing.images[0];
            return (
              <div key={listing.id} className="flex items-start gap-3 p-4 border rounded-xl bg-white">
                <Link
                  href={`/listings/${listing.id}`}
                  className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border bg-muted"
                >
                  {image ? (
                    <Image src={image} alt={listing.title} fill className="object-cover" sizes="56px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      No img
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <Link
                    href={`/listings/${listing.id}`}
                    className="text-sm font-medium leading-tight hover:underline line-clamp-1 block"
                  >
                    {listing.title}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">
                    {listing.seller.name}
                    {admin && ` · ${listing.college.name}`}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center h-4 text-[10px] font-semibold px-2 rounded-full ${STATUS_STYLE[listing.status] ?? "bg-muted"}`}
                    >
                      {listing.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(listing.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end justify-between self-stretch pr-3">
                  <span className="text-sm font-semibold text-primary whitespace-nowrap">
                    ₹{listing.price.toLocaleString("en-IN")}
                  </span>
                  <RemoveListingButton listingId={listing.id} title={listing.title} isAdmin={admin} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Link
            href={buildHref(page - 1)}
            aria-disabled={page <= 1}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
              page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-accent"
            }`}
          >
            Previous
          </Link>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Link
            href={buildHref(page + 1)}
            aria-disabled={page >= totalPages}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
              page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-accent"
            }`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}

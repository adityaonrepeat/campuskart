import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MarkSoldButton } from "@/components/orders/mark-sold-button";

type ListingRow = {
  id: string;
  title: string;
  price: number;
  images: string[];
  status: string;
};

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  SOLD: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  ARCHIVED: "bg-muted text-muted-foreground",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[status] ?? "bg-muted"}`}
    >
      {status}
    </span>
  );
}

function ItemRow({
  listing,
  subtitle,
  trailing,
}: {
  listing: ListingRow;
  subtitle?: string;
  trailing?: React.ReactNode;
}) {
  const image = listing.images[0];
  return (
    <div className="flex items-center gap-4 p-4 border rounded-xl bg-card">
      <Link
        href={`/listings/${listing.id}`}
        className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border bg-muted"
      >
        {image ? (
          <Image src={image} alt={listing.title} fill className="object-cover" sizes="64px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            No img
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/listings/${listing.id}`}
            className="text-sm font-medium leading-tight hover:underline line-clamp-2"
          >
            {listing.title}
          </Link>
          <span className="text-sm font-semibold text-primary whitespace-nowrap">
            ₹{listing.price.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={listing.status} />
          {subtitle && (
            <span className="text-xs text-muted-foreground truncate">{subtitle}</span>
          )}
        </div>
      </div>

      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}

export default async function OrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userId = session.user.id;

  // Selling = my listings. Buying = listings I have a conversation about (not my own).
  const [selling, buyingConversations] = await Promise.all([
    db.listing.findMany({
      where: { sellerId: userId, status: { in: ["ACTIVE", "SOLD"] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, price: true, images: true, status: true },
    }),
    db.conversation.findMany({
      where: {
        participants: { some: { userId } },
        listing: { is: { sellerId: { not: userId }, status: { in: ["ACTIVE", "SOLD"] } } },
      },
      orderBy: { lastMessageAt: "desc" },
      select: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            status: true,
            seller: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  // One conversation per listing for a buyer, but dedupe defensively.
  const buyingMap = new Map<string, ListingRow & { sellerName: string }>();
  for (const c of buyingConversations) {
    if (c.listing) {
      buyingMap.set(c.listing.id, { ...c.listing, sellerName: c.listing.seller.name });
    }
  }
  const buying = Array.from(buyingMap.values());

  return (
    <div className="py-6 space-y-8">
      <h1 className="text-2xl font-bold">Orders</h1>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
          Selling ({selling.length})
        </h2>
        {selling.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center border rounded-xl">
            You&apos;re not selling anything yet.
          </p>
        ) : (
          <div className="space-y-3">
            {selling.map((listing) => (
              <ItemRow
                key={listing.id}
                listing={listing}
                trailing={
                  listing.status === "ACTIVE" ? (
                    <MarkSoldButton listingId={listing.id} title={listing.title} />
                  ) : null
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
          Buying ({buying.length})
        </h2>
        {buying.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center border rounded-xl">
            You haven&apos;t contacted any sellers yet.
          </p>
        ) : (
          <div className="space-y-3">
            {buying.map((listing) => (
              <ItemRow
                key={listing.id}
                listing={listing}
                subtitle={`Seller: ${listing.sellerName}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

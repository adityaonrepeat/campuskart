import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MarkSoldButton } from "@/components/orders/mark-sold-button";
import AppHeader from "@/components/AppHeader";
import type { ListingCategory, ListingStatus } from "@prisma/client";

type Tab = "all" | "selling" | "buying";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

const CATEGORY_LABEL: Record<ListingCategory, string> = {
  BOOKS: "Books",
  ELECTRONICS: "Electronics",
  CLOTHING: "Clothing",
  FURNITURE: "Furniture",
  NOTES: "Notes",
  SPORTS: "Sports & Fitness",
  OTHER: "Other",
};

const STATUS_CONFIG: Record<ListingStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-[#EEF2FF] text-[#4F46E5]" },
  SOLD: { label: "Sold", className: "bg-[#ECFDF5] text-[#059669]" },
  ARCHIVED: { label: "Archived", className: "bg-[#F3F4F6] text-[#6B7280]" },
};

type SellingItem = {
  id: string;
  title: string;
  price: number;
  images: string[];
  status: ListingStatus;
  category: ListingCategory;
  createdAt: Date;
};

type BuyingItem = SellingItem & { sellerName: string };

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: ListingStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}

function SellingCard({ item }: { item: SellingItem }) {
  const image = item.images[0];
  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl border border-[#E5E4E0] shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
      <div className="relative w-[100px] h-[100px] shrink-0 rounded-xl overflow-hidden bg-[#F8F7F4]">
        {image ? (
          <Image src={image} alt={item.title} fill className="object-cover" sizes="100px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-[#9CA3AF]">
            No img
          </div>
        )}
        <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-[5px] bg-[#4F46E5] text-white uppercase tracking-wider">
          Selling
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-[#1A1A2E] leading-snug mb-0.5 line-clamp-2">
          {item.title}
        </h3>
        <p className="text-xs text-[#9CA3AF] mb-2.5">
          {CATEGORY_LABEL[item.category]} · {formatDate(item.createdAt)}
        </p>
        <StatusBadge status={item.status} />
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="font-sans text-lg font-semibold text-[#4F46E5]">
          ₹{item.price.toLocaleString("en-IN")}
        </span>
        {item.status === "ACTIVE" && (
          <MarkSoldButton listingId={item.id} title={item.title} />
        )}
        <Link
          href={`/listings/${item.id}`}
          className="text-xs font-medium text-[#6B7280] hover:text-[#4F46E5] transition-colors"
        >
          View
        </Link>
      </div>
    </div>
  );
}

function BuyingCard({ item }: { item: BuyingItem }) {
  const image = item.images[0];
  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl border border-[#E5E4E0] shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
      <div className="relative w-[100px] h-[100px] shrink-0 rounded-xl overflow-hidden bg-[#F8F7F4]">
        {image ? (
          <Image src={image} alt={item.title} fill className="object-cover" sizes="100px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-[#9CA3AF]">
            No img
          </div>
        )}
        <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-[5px] bg-[#F59E0B] text-white uppercase tracking-wider">
          Buying
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-[#1A1A2E] leading-snug mb-0.5 line-clamp-2">
          {item.title}
        </h3>
        <p className="text-xs text-[#9CA3AF] mb-2.5">
          {CATEGORY_LABEL[item.category]} · {formatDate(item.createdAt)}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={item.status} />
          <span className="text-xs text-[#9CA3AF]">
            Seller:{" "}
            <span className="font-medium text-[#6B7280]">{item.sellerName}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="font-sans text-lg font-semibold text-[#4F46E5]">
          ₹{item.price.toLocaleString("en-IN")}
        </span>
        <Link
          href={`/listings/${item.id}`}
          className="text-xs font-medium text-[#6B7280] hover:text-[#4F46E5] transition-colors"
        >
          View
        </Link>
      </div>
    </div>
  );
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { tab: rawTab } = await searchParams;
  const tab: Tab =
    rawTab === "selling" || rawTab === "buying" ? rawTab : "all";

  const userId = session.user.id;

  const [selling, buyingConversations] = await Promise.all([
    db.listing.findMany({
      where: { sellerId: userId, status: { in: ["ACTIVE", "SOLD"] } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        price: true,
        images: true,
        status: true,
        category: true,
        createdAt: true,
      },
    }),
    db.conversation.findMany({
      where: {
        participants: { some: { userId } },
        listing: {
          is: {
            sellerId: { not: userId },
            status: { in: ["ACTIVE", "SOLD"] },
          },
        },
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
            category: true,
            createdAt: true,
            seller: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const buyingMap = new Map<string, BuyingItem>();
  for (const c of buyingConversations) {
    if (c.listing && !buyingMap.has(c.listing.id)) {
      const { seller, ...listingFields } = c.listing;
      buyingMap.set(c.listing.id, { ...listingFields, sellerName: seller.name });
    }
  }
  const buying = Array.from(buyingMap.values());

  const totalCount = selling.length + buying.length;

  const visibleSelling = tab === "buying" ? [] : selling;
  const visibleBuying = tab === "selling" ? [] : buying;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: totalCount },
    { key: "selling", label: "Selling", count: selling.length },
    { key: "buying", label: "Buying", count: buying.length },
  ];

  return (
    <div className="min-h-screen bg-white">
      <AppHeader
        user={{ name: session.user.name, avatarUrl: session.user.avatarUrl }}
        forceScrolled
      />

      {/* Hero */}
      <div className="pt-24 pb-8 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] mb-1">My Orders</h1>
              <p className="text-sm text-[#6B7280]">
                Track items you are selling or buying on campus.
              </p>
            </div>
            <Link
              href="/listings/new"
              className="flex self-start sm:self-auto items-center gap-1.5 bg-accent text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-accent/90 transition-colors whitespace-nowrap"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              List New Item
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2.5 bg-white border border-[#E5E4E0] rounded-xl px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold text-[#1A1A2E] leading-none">
                  {selling.length}
                </div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">Selling</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white border border-[#E5E4E0] rounded-xl px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57L23 6H6" />
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold text-[#1A1A2E] leading-none">
                  {buying.length}
                </div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">Buying</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cream panel: tabs + cards */}
      <div className="bg-[#F8F7F4] border-t border-[#E5E4E0] min-h-[60vh] pb-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
          {/* Tabs */}
          <div className="flex gap-1.5 mb-6 bg-[#F8F7F4] border border-[#E5E4E0] rounded-xl p-1 w-fit">
            {tabs.map(({ key, label, count }) => (
              <Link
                key={key}
                href={key === "all" ? "/orders" : `/orders?tab=${key}`}
                className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-all ${
                  tab === key
                    ? "bg-[#4F46E5] text-white shadow-sm"
                    : "text-[#6B7280] hover:text-[#1A1A2E]"
                }`}
              >
                {label} ({count})
              </Link>
            ))}
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {visibleSelling.length === 0 && visibleBuying.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mx-auto mb-4">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[#1A1A2E] mb-1">Nothing here yet</p>
                <p className="text-xs text-[#9CA3AF]">
                  {tab === "selling"
                    ? "You haven't listed anything for sale yet."
                    : tab === "buying"
                    ? "You haven't contacted any sellers yet."
                    : "Start by listing an item or browsing the marketplace."}
                </p>
              </div>
            ) : (
              <>
                {visibleSelling.map((item) => (
                  <SellingCard key={item.id} item={item} />
                ))}
                {visibleBuying.map((item) => (
                  <BuyingCard key={item.id} item={item} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

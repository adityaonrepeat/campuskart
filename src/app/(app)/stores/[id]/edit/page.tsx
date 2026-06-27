import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { StoreForm } from "@/components/stores/store-form";
import type { StoreDetail } from "@/types/store";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Edit store - CampusKart" };

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
    <div>
      {/* Hero */}
      <div className="bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent-light blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <Link
            href={`/stores/${id}`}
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/80 text-xs mb-5 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to store
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A5B4FC" strokeWidth="1.8">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white leading-tight">
                Edit store
              </h1>
              <p className="text-white/60 text-sm mt-1.5 leading-relaxed max-w-lg">
                Update your store details — changes go live immediately for your campus.
              </p>
            </div>
          </div>

          {/* Info chips */}
          <div className="flex flex-wrap gap-2 mt-5">
            {[
              { icon: "✏️", text: "Edits go live instantly" },
              { icon: "🖼️", text: "Update photos anytime" },
              { icon: "⏰", text: "Set your open hours" },
            ].map((chip) => (
              <span
                key={chip.text}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/70 text-xs font-medium"
              >
                {chip.icon} {chip.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
          <StoreForm store={store as StoreDetail} />
        </div>
      </div>
    </div>
  );
}

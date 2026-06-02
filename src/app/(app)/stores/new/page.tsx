import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { StoreForm } from "@/components/stores/store-form";

export const metadata = { title: "List your store — CampusKart" };

export default async function NewStorePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const existing = await db.store.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  if (existing) redirect(`/stores/${existing.id}`);

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
            href="/stores"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/80 text-xs mb-5 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to stores
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A5B4FC" strokeWidth="1.8">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white leading-tight">
                List your store
              </h1>
              <p className="text-white/60 text-sm mt-1.5 leading-relaxed max-w-lg">
                Reach thousands of students on campus. Fill in a few details and we&apos;ll get you verified quickly.
              </p>
            </div>
          </div>

          {/* Info chips */}
          <div className="flex flex-wrap gap-2 mt-5">
            {[
              { icon: "⚡", text: "Fast verification" },
              { icon: "💬", text: "Chat with buyers" },
              { icon: "🎯", text: "College-scoped visibility" },
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
          <StoreForm />
        </div>
      </div>
    </div>
  );
}

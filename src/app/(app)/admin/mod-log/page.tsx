import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

const PAGE_SIZE = 30;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ModLogPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const role = (session.user.role ?? "USER") as Role;
  if (role !== "ADMIN") redirect("/admin/listings");

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr ?? 1));

  const [logs, total] = await Promise.all([
    db.moderationLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        listingId: true,
        listingTitle: true,
        sellerName: true,
        reason: true,
        createdAt: true,
        moderator: { select: { name: true } },
        college: { select: { name: true } },
      },
    }),
    db.moderationLog.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {total} action{total !== 1 ? "s" : ""}
      </p>

      {logs.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-12 border rounded-xl">
          No moderation actions yet.
        </p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="p-4 border rounded-xl bg-card space-y-1">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/listings/${log.listingId}`}
                  className="text-sm font-medium hover:underline line-clamp-1"
                >
                  {log.listingTitle}
                </Link>
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {new Date(log.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Seller: {log.sellerName} · College: {log.college.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Removed by:{" "}
                <span className="font-medium text-foreground">{log.moderator.name}</span>
              </p>
              {log.reason && (
                <p className="text-xs text-muted-foreground">
                  Reason: <span className="text-foreground">{log.reason}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Link
            href={`/admin/mod-log?page=${page - 1}`}
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
            href={`/admin/mod-log?page=${page + 1}`}
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

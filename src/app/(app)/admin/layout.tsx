import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { canModerate, isAdmin, roleOf } from "@/lib/permissions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  if (!canModerate(session.user)) redirect("/listings");

  const role = roleOf(session.user);
  const admin = isAdmin(session.user);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <Link
        href="/listings"
        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back to listings
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Admin</h1>
          <p className="text-xs text-muted-foreground">
            {admin ? "Global access - all colleges" : "Moderator - your college only"}
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            admin
              ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
          }`}
        >
          {role}
        </span>
      </div>

      <AdminNav isAdmin={admin} />

      {children}
    </div>
  );
}

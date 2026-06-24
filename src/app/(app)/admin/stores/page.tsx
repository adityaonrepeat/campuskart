import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { CheckCircle, Trash2, Clock, ExternalLink } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyStore, removeStore } from "@/actions/admin-actions";
import { StoreAdminFilters } from "@/components/admin/store-admin-filters";
import { STORE_CATEGORY_LABELS } from "@/types/store";
import { StoreStatus } from "@prisma/client";
import type { Prisma, Role } from "@prisma/client";

export const metadata = { title: "Store verification - Admin" };

function VerifyButton({ storeId }: { storeId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await verifyStore(storeId);
      }}
    >
      <button
        type="submit"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
      >
        <CheckCircle className="h-3.5 w-3.5" />
        Verify
      </button>
    </form>
  );
}

function RemoveButton({ storeId, label }: { storeId: string; label: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await removeStore(storeId);
      }}
    >
      <button
        type="submit"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-colors border border-red-200"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {label}
      </button>
    </form>
  );
}

interface PageProps {
  searchParams: Promise<{ search?: string; college?: string; status?: string }>;
}

const VALID_STATUSES = new Set<string>(Object.values(StoreStatus));

export default async function AdminStoresPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const role = (session.user.role ?? "USER") as Role;
  if (role !== "MODERATOR" && role !== "ADMIN") redirect("/listings");

  const { search, college, status } = await searchParams;
  const collegeFilter = role === "ADMIN" ? (college || undefined) : session.user.collegeId;
  const statusFilter =
    status && VALID_STATUSES.has(status) ? (status as StoreStatus) : undefined;

  const where: Prisma.StoreWhereInput = {
    ...(collegeFilter ? { collegeId: collegeFilter } : {}),
    ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const [stores, colleges] = await Promise.all([
    db.store.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        images: true,
        status: true,
        isVerified: true,
        createdAt: true,
        owner: { select: { name: true, email: true } },
      },
    }),
    role === "ADMIN"
      ? db.college.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })
      : Promise.resolve([] as { id: string; name: string }[]),
  ]);

  const pending = stores.filter((s) => s.status === "PENDING");
  const active = stores.filter((s) => s.status === "ACTIVE");
  const archived = stores.filter((s) => s.status === "ARCHIVED");

  const showPending = !statusFilter || statusFilter === "PENDING";
  const showActive = !statusFilter || statusFilter === "ACTIVE";
  const showArchived = role === "ADMIN" && (!statusFilter || statusFilter === "ARCHIVED");

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h1 className="text-xl font-bold">Store verification</h1>
        <StoreAdminFilters
          isAdmin={role === "ADMIN"}
          colleges={colleges}
          defaultValues={{ search, college, status: statusFilter }}
        />
        {(search || college || statusFilter) && (
          <p className="text-sm text-muted-foreground">
            {stores.length} store{stores.length !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      {/* Pending */}
      {showPending && (
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-600" />
          <h2 className="font-semibold">Pending ({pending.length})</h2>
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">All caught up!</p>
        ) : (
          <div className="space-y-3">
            {pending.map((store) => (
              <StoreRow
                key={store.id}
                store={store}
                actions={
                  <>
                    <VerifyButton storeId={store.id} />
                    <RemoveButton storeId={store.id} label={role === "ADMIN" ? "Delete" : "Archive"} />
                  </>
                }
              />
            ))}
          </div>
        )}
      </section>
      )}

      {/* Active */}
      {showActive && (
      <section className="space-y-3">
        <h2 className="font-semibold">Active ({active.length})</h2>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active stores yet.</p>
        ) : (
          <div className="space-y-3">
            {active.map((store) => (
              <StoreRow
                key={store.id}
                store={store}
                actions={
                  <RemoveButton storeId={store.id} label={role === "ADMIN" ? "Delete" : "Archive"} />
                }
              />
            ))}
          </div>
        )}
      </section>
      )}

      {/* Archived */}
      {showArchived && archived.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-muted-foreground">Archived ({archived.length})</h2>
          <div className="space-y-3">
            {archived.map((store) => (
              <StoreRow
                key={store.id}
                store={store}
                actions={
                  <RemoveButton storeId={store.id} label="Delete permanently" />
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

type StoreRowProps = {
  store: {
    id: string;
    name: string;
    description: string;
    category: string;
    images: string[];
    status: string;
    isVerified: boolean;
    createdAt: Date;
    owner: { name: string; email: string };
  };
  actions: React.ReactNode;
};

function StoreRow({ store, actions }: StoreRowProps) {
  const categoryLabel =
    STORE_CATEGORY_LABELS[store.category as keyof typeof STORE_CATEGORY_LABELS] ?? store.category;

  const storeHref = `/stores/${store.id}`;

  return (
    <div className="rounded-xl border p-4 bg-white">
      <div className="flex items-start gap-3">
        <Link
          href={storeHref}
          target="_blank"
          rel="noopener noreferrer"
          className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-muted block"
        >
          {store.images[0] ? (
            <Image src={store.images[0]} alt={store.name} fill className="object-cover" sizes="64px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={storeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sm hover:text-primary hover:underline inline-flex items-center gap-1"
            >
              {store.name}
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </Link>
            <span className="text-xs text-muted-foreground bg-white border border-border px-1.5 py-0.5 rounded">
              {categoryLabel}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {store.images.length} photo{store.images.length !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{store.description}</p>
          <p className="text-xs text-muted-foreground mt-1">
            By {store.owner.name} · {store.owner.email} ·{" "}
            {new Date(store.createdAt).toLocaleDateString("en-IN")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-end mt-3">
        <Link
          href={storeHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 hover:bg-muted/60 text-foreground text-xs font-semibold rounded-lg transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Review
        </Link>
        {actions}
      </div>
    </div>
  );
}

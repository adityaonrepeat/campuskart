import Image from "next/image";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { CheckCircle, Trash2, Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyStore, removeStore } from "@/actions/admin-actions";
import { STORE_CATEGORY_LABELS } from "@/types/store";
import type { Role } from "@prisma/client";

export const metadata = { title: "Store verification — Admin" };

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

export default async function AdminStoresPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const role = (session.user.role ?? "USER") as Role;
  if (role !== "MODERATOR" && role !== "ADMIN") redirect("/listings");

  const stores = await db.store.findMany({
    where: role === "MODERATOR" ? { collegeId: session.user.collegeId } : {},
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
  });

  const pending = stores.filter((s) => s.status === "PENDING");
  const active = stores.filter((s) => s.status === "ACTIVE");
  const archived = stores.filter((s) => s.status === "ARCHIVED");

  return (
    <div className="py-6 space-y-8">
      <h1 className="text-xl font-bold">Store verification</h1>

      {/* Pending */}
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

      {/* Active */}
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

      {/* Archived — only admins see this (can permanently delete) */}
      {role === "ADMIN" && archived.length > 0 && (
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

  return (
    <div className="flex items-start gap-3 rounded-xl border p-4">
      <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        {store.images[0] ? (
          <Image src={store.images[0]} alt={store.name} fill className="object-cover" sizes="64px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm">{store.name}</p>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {categoryLabel}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{store.description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          By {store.owner.name} · {store.owner.email} ·{" "}
          {new Date(store.createdAt).toLocaleDateString("en-IN")}
        </p>
      </div>

      <div className="flex flex-col gap-2 flex-shrink-0">{actions}</div>
    </div>
  );
}

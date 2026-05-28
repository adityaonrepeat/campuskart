import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { BottomNav } from "@/components/shared/bottom-nav";
import { SocketInitializer } from "@/components/shared/socket-initializer";
import type { Role } from "@prisma/client";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const role = (session.user.role ?? "USER") as Role;
  const showAdmin = role === "MODERATOR" || role === "ADMIN";

  return (
    <div className="min-h-screen pb-20">
      <SocketInitializer />
      <main className="max-w-3xl mx-auto px-4">{children}</main>
      <BottomNav showAdmin={showAdmin} />
    </div>
  );
}

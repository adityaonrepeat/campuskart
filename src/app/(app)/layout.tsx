import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { BottomNav } from "@/components/shared/bottom-nav";
import { SocketInitializer } from "@/components/shared/socket-initializer";
import { canModerate } from "@/lib/permissions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (!session.user.collegeId) redirect("/complete-profile");

  const showAdmin = canModerate(session.user);

  return (
    <div className="min-h-screen app-main-pb">
      <SocketInitializer />
      <main>{children}</main>
      <BottomNav showAdmin={showAdmin} />
    </div>
  );
}

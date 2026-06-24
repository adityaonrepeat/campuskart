import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import AppLogo from "@/components/ui/AppLogo";
import { CompleteProfileForm } from "./complete-profile-form";

export const metadata = {
  title: "Pick Your College - CampusKart",
  description: "Select your college to finish setting up your CampusKart account.",
};

export default async function CompleteProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.collegeId) redirect("/listings");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E4E0] shadow-card p-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-8">
          <AppLogo size={36} />
          <span className="text-xl font-semibold tracking-tight text-[#3730A3]" style={{ fontFamily: "var(--font-dm-sans)" }}>CampusKart</span>
        </Link>

        <h1 className="font-display text-2xl font-semibold text-[#1A1A2E] mb-1">
          Almost there!
        </h1>
        <p className="text-sm text-[#6B7280] mb-6">
          Select your college so we can show you the right listings.
        </p>

        <CompleteProfileForm />
      </div>
    </div>
  );
}

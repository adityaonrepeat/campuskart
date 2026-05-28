import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Create account — CampusKart" };

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <RegisterForm />
    </main>
  );
}

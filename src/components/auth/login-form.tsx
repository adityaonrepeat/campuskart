"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl") ?? "/listings";
  const callbackUrl =
    rawCallback.startsWith("/") && !rawCallback.startsWith("//") ? rawCallback : "/listings";
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function handleGoogleSignIn() {
    setIsPending(true);
    const result = await signIn.social({ provider: "google", callbackURL: "/complete-profile" });
    if (result?.error) {
      toast.error(result.error.message ?? "Google sign-in failed. Please try again.");
      setIsPending(false);
    }
  }

  async function onSubmit(values: LoginValues) {
    setIsPending(true);
    const { error } = await signIn.email({
      email: values.email,
      password: values.password,
    });
    setIsPending(false);

    if (error) {
      toast.error(error.message ?? "Login failed. Please try again.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex border-b border-[#E5E4E0] mb-8">
        <Link href="/login" className="flex-1 pb-3 text-sm font-semibold text-center auth-tab-active">
          Log In
        </Link>
        <Link href="/signup" className="flex-1 pb-3 text-sm font-semibold text-center auth-tab-inactive">
          Create Account
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@college.edu"
            autoComplete="email"
            className="input-field"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#111111]">Password</label>
            <button type="button" className="text-xs text-indigo-600 hover:underline">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              autoComplete="current-password"
              className="input-field pr-11"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-[calc(50%-9px)] -translate-y-1/2 text-[#6B7280] hover:text-[#111111] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full btn-shimmer text-white font-semibold py-3.5 rounded-xl transition-shadow duration-300 mt-2 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Log In to CampusKart
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-[#E5E4E0]" />
          <span className="text-xs text-[#6B7280]">or</span>
          <div className="flex-1 h-px bg-[#E5E4E0]" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-3 border border-[#E5E4E0] bg-white py-3 rounded-xl text-sm font-medium text-[#111111] hover:bg-[#F8F7F4] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="text-center text-xs text-[#6B7280] mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">
            Sign up free
          </Link>
        </p>
      </form>
    </div>
  );
}

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

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/listings";
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

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
        <Link href="/register" className="flex-1 pb-3 text-sm font-semibold text-center auth-tab-inactive">
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111111] transition-colors"
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

        <p className="text-center text-xs text-[#6B7280] mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
            Sign up free
          </Link>
        </p>
      </form>
    </div>
  );
}

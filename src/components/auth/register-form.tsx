"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { CollegeCombobox } from "@/components/shared/college-combobox";
import Link from "next/link";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    collegeId: z.string().min(1, "Please select your college"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { collegeId: "" },
  });

  async function onSubmit(values: RegisterValues) {
    setIsPending(true);
    const { error } = await signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      username: values.username,
      collegeId: values.collegeId,
    } as Parameters<typeof signUp.email>[0]);
    setIsPending(false);

    if (error) {
      toast.error(error.message ?? "Registration failed. Please try again.");
      return;
    }

    toast.success("Account created! Welcome to CampusKart.");
    router.push("/listings");
    router.refresh();
  }

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex border-b border-[#E5E4E0] mb-8">
        <Link href="/login" className="flex-1 pb-3 text-sm font-semibold text-center auth-tab-inactive">
          Log In
        </Link>
        <Link href="/register" className="flex-1 pb-3 text-sm font-semibold text-center auth-tab-active">
          Create Account
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1.5">Full Name</label>
          <input
            type="text"
            placeholder="e.g. Aditya Singh"
            className="input-field"
            {...register("name")}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1.5">Username</label>
          <input
            type="text"
            placeholder="e.g. aditya_s"
            className="input-field"
            {...register("username")}
          />
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
        </div>

        {/* College */}
        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1.5">
            College / University
          </label>
          <Controller
            name="collegeId"
            control={control}
            render={({ field }) => (
              <CollegeCombobox
                value={field.value ?? ""}
                onChange={field.onChange}
                disabled={isPending}
              />
            )}
          />
          {errors.collegeId && (
            <p className="text-red-500 text-xs mt-1">{errors.collegeId.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1.5">Email Address</label>
          <input
            type="email"
            placeholder="you@college.edu"
            autoComplete="email"
            className="input-field"
            {...register("email")}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
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
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1.5">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter password"
              autoComplete="new-password"
              className="input-field pr-11"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111111] transition-colors"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full btn-shimmer text-white font-semibold py-3.5 rounded-xl transition-shadow duration-300 mt-2 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Student Account
        </button>

        <p className="text-center text-xs text-[#6B7280] mt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

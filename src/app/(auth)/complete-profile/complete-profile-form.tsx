"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CollegeCombobox } from "@/components/shared/college-combobox";
import { completeProfile } from "@/actions/user-actions";

const schema = z.object({
  collegeId: z.string().min(1, "Please select your college"),
});
type FormValues = z.infer<typeof schema>;

export function CompleteProfileForm() {
  const [isPending, setIsPending] = useState(false);

  const { handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { collegeId: "" },
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);
    const result = await completeProfile(values.collegeId);
    if (result?.error) {
      toast.error(result.error);
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[#111111] mb-1.5">
          College / University
        </label>
        <Controller
          name="collegeId"
          control={control}
          render={({ field }) => (
            <CollegeCombobox
              value={field.value}
              onChange={field.onChange}
              disabled={isPending}
            />
          )}
        />
        {errors.collegeId && (
          <p className="text-red-500 text-xs mt-1">{errors.collegeId.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full btn-shimmer text-white font-semibold py-3.5 rounded-xl transition-shadow duration-300 mt-2 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Continue to CampusKart
      </button>
    </form>
  );
}

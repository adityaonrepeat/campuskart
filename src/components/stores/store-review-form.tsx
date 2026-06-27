"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { createReviewSchema, type CreateReviewInput } from "@/types/store";
import { submitStoreReview } from "@/actions/store-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface StoreReviewFormProps {
  storeId: string;
  existingRating?: number;
  onSuccess?: () => void;
}

export function StoreReviewForm({ storeId, existingRating, onSuccess }: StoreReviewFormProps) {
  const queryClient = useQueryClient();
  const [hovered, setHovered] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: { rating: existingRating ?? 0 },
  });

  const rating = watch("rating") ?? 0;

  async function onSubmit(values: CreateReviewInput) {
    const result = await submitStoreReview(storeId, values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(existingRating ? "Review updated!" : "Review submitted!");
    await queryClient.invalidateQueries({ queryKey: ["store", storeId] });
    onSuccess?.();
  }

  return (
    <form method="post" onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1.5">
        <p className="text-sm font-medium">Your rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setValue("rating", star, { shouldValidate: true })}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-7 w-7 transition-colors",
                  (hovered || rating) >= star
                    ? "fill-amber-400 text-amber-400"
                    : "fill-none text-muted-foreground/40"
                )}
              />
            </button>
          ))}
        </div>
        {errors.rating && <p className="text-xs text-destructive">{errors.rating.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Textarea
          placeholder="Share your experience (optional)…"
          rows={3}
          {...register("body")}
        />
        {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
      </div>

      <Button type="submit" size="sm" disabled={isSubmitting || rating === 0}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {existingRating ? "Update review" : "Submit review"}
      </Button>
    </form>
  );
}

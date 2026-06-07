"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createListingSchema, type CreateListingInput } from "@/types/listing";
import { createListing, updateListing } from "@/actions/listing-actions";
import { ImageUploader } from "@/components/shared/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ListingDetail } from "@/types/listing";

const CATEGORIES = [
  { value: "BOOKS", label: "Books" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "CLOTHING", label: "Clothing" },
  { value: "FURNITURE", label: "Furniture" },
  { value: "NOTES", label: "Notes" },
  { value: "SPORTS", label: "Sports" },
  { value: "OTHER", label: "Other" },
] as const;

const CONDITIONS = [
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
] as const;

const LISTING_TYPES = [
  { value: "FIXED_PRICE", label: "Fixed Price" },
  { value: "NEGOTIABLE", label: "Negotiable" },
] as const;

interface ListingFormProps {
  listing?: ListingDetail;
}

export function ListingForm({ listing }: ListingFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!listing;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateListingInput>({
    resolver: zodResolver(createListingSchema),
    defaultValues: listing
      ? {
          title: listing.title,
          description: listing.description,
          price: listing.price,
          category: listing.category,
          condition: listing.condition,
          listingType: listing.listingType,
          images: listing.images,
          imageKeys: [],
        }
      : {
          images: [],
          imageKeys: [],
          listingType: "FIXED_PRICE" as const,
        },
  });

  const images = watch("images");
  const imageKeys = watch("imageKeys");

  async function onSubmit(values: CreateListingInput) {
    const result = isEditing
      ? await updateListing(listing.id, values)
      : await createListing(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Listing updated!" : "Listing posted!");
    await queryClient.invalidateQueries({ queryKey: ["listings"] });
    router.push(isEditing ? `/listings/${listing.id}` : "/listings");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="What are you selling?"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the item — condition, any accessories included, reason for selling..."
          rows={4}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="price">Price (₹)</Label>
        <Input
          id="price"
          type="number"
          min={1}
          step={1}
          placeholder="0"
          {...register("price", { valueAsNumber: true })}
        />
        {errors.price && (
          <p className="text-sm text-destructive">{errors.price.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="listingType">Listing Type</Label>
        <Controller
          name="listingType"
          control={control}
          render={({ field }) => (
            <select
              id="listingType"
              value={field.value ?? "FIXED_PRICE"}
              onChange={field.onChange}
              className="flex h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {LISTING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          )}
        />
        {errors.listingType && (
          <p className="text-sm text-destructive">{errors.listingType.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <select
                id="category"
                value={field.value ?? ""}
                onChange={field.onChange}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="" disabled>
                  Select category
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="condition">Condition</Label>
          <Controller
            name="condition"
            control={control}
            render={({ field }) => (
              <select
                id="condition"
                value={field.value ?? ""}
                onChange={field.onChange}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="" disabled>
                  Select condition
                </option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.condition && (
            <p className="text-sm text-destructive">{errors.condition.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Photos</Label>
        <ImageUploader
          value={images?.map((url, i) => ({ url, key: imageKeys?.[i] ?? url })) ?? []}
          onChange={(imgs) => {
            setValue("images", imgs.map((i) => i.url), { shouldValidate: true });
            setValue("imageKeys", imgs.map((i) => i.key));
          }}
          disabled={isSubmitting}
        />
        {errors.images && (
          <p className="text-sm text-destructive">{errors.images.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Save changes" : "Post listing"}
        </Button>
      </div>
    </form>
  );
}

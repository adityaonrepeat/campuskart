"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, X, Plus } from "lucide-react";
import { createStoreSchema, STORE_CATEGORIES, STORE_CATEGORY_LABELS } from "@/types/store";
import type { CreateStoreInput, UpdateStoreInput, StoreDetail } from "@/types/store";
import { createStore, updateStore } from "@/actions/store-actions";
import { ImageUploader } from "@/components/shared/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StoreFormProps {
  store?: StoreDetail;
}

export function StoreForm({ store }: StoreFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!store;
  const [newReply, setNewReply] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateStoreInput>({
    resolver: zodResolver(createStoreSchema) as Resolver<CreateStoreInput>,
    defaultValues: store
      ? {
          name: store.name,
          description: store.description,
          category: store.category,
          phone: store.phone ?? "",
          whatsapp: store.whatsapp ?? "",
          location: store.location ?? "",
          mapUrl: store.mapUrl ?? "",
          hours: store.hours ?? "",
          quickReplies: store.quickReplies,
          images: store.images,
          imageKeys: [],
        }
      : {
          quickReplies: [],
          images: [],
          imageKeys: [],
        },
  });

  const images = watch("images") ?? [];
  const imageKeys = watch("imageKeys") ?? [];
  const quickReplies = watch("quickReplies") ?? [];

  function addReply() {
    const trimmed = newReply.trim();
    if (!trimmed || quickReplies.length >= 8) return;
    setValue("quickReplies", [...quickReplies, trimmed]);
    setNewReply("");
  }

  function removeReply(index: number) {
    setValue("quickReplies", quickReplies.filter((_, i) => i !== index));
  }

  async function onSubmit(values: CreateStoreInput) {
    const result = isEditing
      ? await updateStore(store.id, values as UpdateStoreInput)
      : await createStore(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Store updated!" : "Store created! It will be visible once verified by a moderator.");
    await queryClient.invalidateQueries({ queryKey: ["stores"] });
    router.push(isEditing ? `/stores/${store.id}` : "/stores");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic info */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Store name</Label>
        <Input id="name" placeholder="e.g. Campus Canteen" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="What does your store sell? What makes it special?"
          rows={3}
          {...register("description")}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

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
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="" disabled>Select category</option>
              {STORE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{STORE_CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          )}
        />
        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
      </div>

      {/* Contact */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" type="tel" placeholder="e.g. 9876543210" {...register("phone")} />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp (optional)</Label>
          <Input id="whatsapp" type="tel" placeholder="e.g. 9876543210" {...register("whatsapp")} />
          {errors.whatsapp && <p className="text-sm text-destructive">{errors.whatsapp.message}</p>}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <Label htmlFor="location">Campus location (optional)</Label>
        <Input id="location" placeholder="e.g. Block C, Ground Floor near library" {...register("location")} />
        {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mapUrl">Google Maps link (optional)</Label>
        <Input id="mapUrl" type="url" placeholder="https://maps.app.goo.gl/..." {...register("mapUrl")} />
        <p className="text-xs text-muted-foreground">Paste a Google Maps share link so students can navigate to you.</p>
        {errors.mapUrl && <p className="text-sm text-destructive">{errors.mapUrl.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hours">Opening hours (optional)</Label>
        <Input id="hours" placeholder="e.g. Mon–Sat 9 am–8 pm, Closed Sunday" {...register("hours")} />
        {errors.hours && <p className="text-sm text-destructive">{errors.hours.message}</p>}
      </div>

      {/* Quick replies */}
      <div className="space-y-2">
        <Label>Quick replies in chat (optional, max 8)</Label>
        <p className="text-xs text-muted-foreground">
          Pre-set messages customers can tap when chatting with your store.
        </p>
        <div className="flex flex-wrap gap-2 min-h-[32px]">
          {quickReplies.map((reply, i) => (
            <span
              key={i}
              className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full"
            >
              {reply}
              <button
                type="button"
                onClick={() => removeReply(i)}
                className="hover:text-indigo-900 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        {quickReplies.length < 8 && (
          <div className="flex gap-2">
            <Input
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addReply(); } }}
              placeholder="e.g. &quot;Is this available?&quot; or &quot;What are today&apos;s specials?&quot;"
              maxLength={100}
            />
            <Button type="button" variant="outline" size="sm" onClick={addReply} disabled={!newReply.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Images */}
      <div className="space-y-1.5">
        <Label>Photos (optional, max 10)</Label>
        <p className="text-xs text-muted-foreground">Add photos of your store, menu, or products.</p>
        <ImageUploader
          value={images.map((url, i) => ({ url, key: imageKeys[i] ?? url }))}
          onChange={(imgs) => {
            setValue("images", imgs.map((i) => i.url), { shouldValidate: true });
            setValue("imageKeys", imgs.map((i) => i.key));
          }}
          disabled={isSubmitting}
          maxFiles={10}
        />
        {errors.images && <p className="text-sm text-destructive">{errors.images.message}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Save changes" : "Register store"}
        </Button>
      </div>
    </form>
  );
}

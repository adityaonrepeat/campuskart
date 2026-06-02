"use client";

import React, { useState, useEffect } from "react";
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

const FULFILLMENT_TAGS = ["Delivery Available", "Self Pickup"];

const PRESET_TAGS = [
  "Cafe", "Biryani", "Cake", "Dosa", "Chicken",
  "Chowmin", "Lachha Paratha", "Pizza", "Burger", "Tea", "Snacks",
];

const DAY_PRESETS = [
  { label: "Everyday", value: "Everyday" },
  { label: "Mon–Sat", value: "Mon–Sat" },
  { label: "Mon–Fri", value: "Mon–Fri" },
  { label: "Weekends", value: "Sat–Sun" },
];

function to12h(t: string): string {
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

interface HoursPickerProps {
  initialValue?: string;
  onChange: (v: string) => void;
}

function HoursPicker({ initialValue, onChange }: HoursPickerProps) {
  const [dayPreset, setDayPreset] = useState("Mon–Sat");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("21:00");

  // Best-effort parse of "Mon–Sat, 9 AM – 9 PM" back into state for the edit case
  useEffect(() => {
    if (!initialValue) return;
    const [days] = initialValue.split(",");
    const found = DAY_PRESETS.find((p) => days.trim() === p.value);
    if (found) setDayPreset(found.value);
  }, [initialValue]);

  useEffect(() => {
    onChange(`${dayPreset}, ${to12h(openTime)} – ${to12h(closeTime)}`);
  }, [dayPreset, openTime, closeTime, onChange]);

  return (
    <div className="space-y-3">
      {/* Day presets */}
      <div className="flex flex-wrap gap-2">
        {DAY_PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setDayPreset(p.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
              dayPreset === p.value
                ? "bg-accent text-white border-accent"
                : "bg-surface border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Time range */}
      <div className="flex items-center gap-3">
        <div className="space-y-1 flex-1">
          <p className="text-xs text-muted-foreground font-medium">Opens at</p>
          <input
            type="time"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="pt-5 text-muted-foreground text-sm">—</div>
        <div className="space-y-1 flex-1">
          <p className="text-xs text-muted-foreground font-medium">Closes at</p>
          <input
            type="time"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Preview */}
      <p className="text-xs text-muted-foreground">
        Preview:{" "}
        <span className="font-medium text-foreground">
          {dayPreset}, {to12h(openTime)} – {to12h(closeTime)}
        </span>
      </p>
    </div>
  );
}

interface StoreFormProps {
  store?: StoreDetail;
}

export function StoreForm({ store }: StoreFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!store;
  const [customTag, setCustomTag] = useState("");

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
          tags: store.tags,
          images: store.images,
          imageKeys: [],
        }
      : {
          tags: [],
          images: [],
          imageKeys: [],
        },
  });

  const images = watch("images") ?? [];
  const imageKeys = watch("imageKeys") ?? [];
  const tags = watch("tags") ?? [];

  function toggleTag(tag: string) {
    if (tags.includes(tag)) {
      setValue("tags", tags.filter((t) => t !== tag));
    } else if (tags.length < 10) {
      setValue("tags", [...tags, tag]);
    }
  }

  function addCustomTag() {
    const trimmed = customTag.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= 10) return;
    setValue("tags", [...tags, trimmed]);
    setCustomTag("");
  }

  function removeTag(tag: string) {
    setValue("tags", tags.filter((t) => t !== tag));
  }

  async function onSubmit(values: CreateStoreInput) {
    const result = isEditing
      ? await updateStore(store.id, values as UpdateStoreInput)
      : await createStore(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Store updated!" : "Store listed! It'll appear once verified by a moderator.");
    await queryClient.invalidateQueries({ queryKey: ["stores"] });
    router.push(isEditing ? `/stores/${store.id}` : "/stores");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* ── Basic info ── */}
      <section className="space-y-5">
        <SectionHeader icon="store" title="Store info" />

        <div className="space-y-1.5">
          <Label htmlFor="name">Store name <span className="text-destructive">*</span></Label>
          <Input id="name" placeholder="e.g. Campus Canteen" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
          <Textarea
            id="description"
            placeholder="What do you sell? What makes your store special for campus students?"
            rows={3}
            {...register("description")}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
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
                <option value="" disabled>Select a category</option>
                {STORE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{STORE_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            )}
          />
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>
      </section>

      {/* ── Delivery or Pickup ── */}
      <section className="space-y-3">
        <div>
          <Label>Do you deliver to hostels? <span className="text-destructive">*</span></Label>
          <p className="text-xs text-muted-foreground mt-0.5">Select one — students will see this on your store card</p>
        </div>
        <div className="flex gap-3">
          {FULFILLMENT_TAGS.map((tag) => {
            const selected = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  const withoutFulfillment = tags.filter((t) => !FULFILLMENT_TAGS.includes(t));
                  setValue("tags", selected ? withoutFulfillment : [...withoutFulfillment, tag]);
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
                  selected
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-muted-foreground hover:border-accent/50 hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Tags ── */}
      <section className="space-y-4">
        <SectionHeader icon="tag" title="Food / item tags" sub="Help students find you by what you sell" />

        <div className="flex flex-wrap gap-2">
          {PRESET_TAGS.map((tag) => {
            const selected = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                  selected
                    ? "bg-accent text-white border-accent"
                    : "bg-surface border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {tags.length < 10 && (
          <div className="flex gap-2">
            <Input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTag(); } }}
              placeholder="Add a custom tag (e.g. Shawarma)"
              maxLength={30}
              className="text-sm"
            />
            <Button type="button" variant="outline" size="sm" onClick={addCustomTag} disabled={!customTag.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-surface border border-border">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 bg-white border border-border text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors ml-0.5">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ── Hours ── */}
      <section className="space-y-4">
        <SectionHeader icon="clock" title="Opening hours" sub="When are you open for orders?" />
        <HoursPicker
          initialValue={store?.hours ?? undefined}
          onChange={(v) => setValue("hours", v)}
        />
        {errors.hours && <p className="text-xs text-destructive">{errors.hours.message}</p>}
      </section>

      {/* ── Contact & location ── */}
      <section className="space-y-4">
        <SectionHeader icon="phone" title="Contact & location" sub="How students reach you" />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" type="tel" placeholder="9876543210" {...register("phone")} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp (optional)</Label>
            <Input id="whatsapp" type="tel" placeholder="9876543210" {...register("whatsapp")} />
            {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">Campus location (optional)</Label>
          <Input id="location" placeholder="e.g. Block C, Ground Floor near library" {...register("location")} />
          {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="mapUrl">Google Maps link (optional)</Label>
          <Input id="mapUrl" type="url" placeholder="https://maps.app.goo.gl/..." {...register("mapUrl")} />
          <p className="text-xs text-muted-foreground">Paste a share link so students can navigate to you.</p>
          {errors.mapUrl && <p className="text-xs text-destructive">{errors.mapUrl.message}</p>}
        </div>
      </section>

      {/* ── Photos ── */}
      <section className="space-y-4">
        <SectionHeader icon="image" title="Photos" sub="Show your store, menu, or products (max 10)" />
        <ImageUploader
          value={images.map((url, i) => ({ url, key: imageKeys[i] ?? url }))}
          onChange={(imgs) => {
            setValue("images", imgs.map((i) => i.url), { shouldValidate: true });
            setValue("imageKeys", imgs.map((i) => i.key));
          }}
          disabled={isSubmitting}
          maxFiles={10}
        />
        {errors.images && <p className="text-xs text-destructive">{errors.images.message}</p>}
      </section>

      {/* ── Default quick replies notice ── */}
      <div className="flex gap-3 p-4 rounded-xl bg-surface border border-border">
        <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-primary">Chat quick replies included</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Your store gets default quick-reply buttons automatically: <span className="font-medium text-foreground">Order confirmed</span>, <span className="font-medium text-foreground">Yes, available!</span>, <span className="font-medium text-foreground">Sold out</span>, and <span className="font-medium text-foreground">Have to wait</span>. You can always chat manually too.
          </p>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-2 pb-6">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting} className="rounded-xl px-6">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="rounded-xl px-8">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Save changes" : "List my store"}
        </Button>
      </div>
    </form>
  );
}

// ── Shared section header ──────────────────────────────────────────────────────

type IconName = "store" | "tag" | "clock" | "phone" | "image";

const ICONS: Record<IconName, React.ReactElement> = {
  store: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  ),
  tag: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  phone: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.97a16 16 0 006.09 6.09l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),
  image: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
};

function SectionHeader({ icon, title, sub }: { icon: IconName; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 pb-3 border-b border-border">
      <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        {ICONS[icon]}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-primary">{title}</h2>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

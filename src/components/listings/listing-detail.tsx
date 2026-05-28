"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { deleteListing } from "@/actions/listing-actions";
import type { ListingDetail as ListingDetailType } from "@/types/listing";
import type { ApiResponse } from "@/types/api";

const CONDITION_LABEL: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

const CATEGORY_LABEL: Record<string, string> = {
  BOOKS: "Books",
  ELECTRONICS: "Electronics",
  CLOTHING: "Clothing",
  FURNITURE: "Furniture",
  NOTES: "Notes",
  SPORTS: "Sports",
  OTHER: "Other",
};

interface ListingDetailProps {
  listing: ListingDetailType;
  currentUserId: string;
}

export function ListingDetailView({ listing, currentUserId }: ListingDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = listing.sellerId === currentUserId;
  const isSold = listing.status === "SOLD";
  const isActive = listing.status === "ACTIVE";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isContacting, setIsContacting] = useState(false);

  async function handleContactSeller() {
    setIsContacting(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          message: message.trim() || undefined,
        }),
      });
      const json = (await res.json()) as ApiResponse<{ conversationId: string }>;

      if (json.success) {
        setMessage("");
        setDialogOpen(false);
        // Refresh the chat list so the conversation shows up immediately.
        await queryClient.invalidateQueries({ queryKey: ["conversations"] });
        router.push(`/chat/${json.data.conversationId}`);
        return;
      }

      if (json.code === "LISTING_NOT_ACTIVE") {
        toast.error("This item has already been sold.");
        await queryClient.invalidateQueries({ queryKey: ["listings", listing.id] });
        await queryClient.invalidateQueries({ queryKey: ["listings"] });
      } else {
        toast.error(json.error);
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to open chat. Please try again.");
    } finally {
      setIsContacting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Archive this listing? It will no longer appear in browse.")) return;
    setIsDeleting(true);
    const result = await deleteListing(listing.id);
    setIsDeleting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Listing archived.");
    await queryClient.invalidateQueries({ queryKey: ["listings"] });
    router.push("/listings");
  }

  return (
    <div className="py-6 space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="space-y-4">
        <div className="relative aspect-square rounded-xl overflow-hidden border bg-muted">
          {listing.images[selectedImage] ? (
            <Image
              src={listing.images[selectedImage]}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="bg-red-600 text-white text-base font-bold px-4 py-2 rounded-full">
                Sold
              </span>
            </div>
          )}
        </div>

        {listing.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {listing.images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedImage(i)}
                className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === selectedImage ? "border-primary" : "border-transparent"
                }`}
              >
                <Image
                  src={img}
                  alt={`Image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold leading-tight">{listing.title}</h1>
          <span className="text-2xl font-bold text-primary whitespace-nowrap">
            ₹{listing.price.toLocaleString("en-IN")}
          </span>
        </div>

        {isSold && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300">
            This item has been sold.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <span className="bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-full">
            {CATEGORY_LABEL[listing.category] ?? listing.category}
          </span>
          <span className="bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-full">
            {CONDITION_LABEL[listing.condition] ?? listing.condition}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
          {listing.description}
        </p>
      </div>

      <div className="flex items-center gap-3 py-3 border-t">
        <UserAvatar name={listing.seller.name} avatarUrl={listing.seller.avatarUrl} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{listing.seller.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {listing.seller.college.name}
          </p>
        </div>
        <Link
          href={`/profile/${listing.seller.username}`}
          className="text-xs text-primary hover:underline"
        >
          View profile
        </Link>
      </div>

      {isOwner ? (
        <div className="flex gap-3">
          <Link
            href={`/listings/${listing.id}/edit`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Pencil className="h-4 w-4 mr-1.5" />
            Edit
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            {isDeleting ? "Archiving..." : "Archive"}
          </Button>
        </div>
      ) : (
        <>
          <Button
            className="w-full"
            disabled={!isActive}
            onClick={() => isActive && setDialogOpen(true)}
          >
            {isSold ? "Already Sold" : "Contact Seller"}
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Message the seller</DialogTitle>
                <DialogDescription>
                  Start a conversation about <strong>{listing.title}</strong> (₹
                  {listing.price.toLocaleString("en-IN")}). Your message is the first
                  thing the seller sees.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label htmlFor="contact-message">Message (optional)</Label>
                <Textarea
                  id="contact-message"
                  placeholder="e.g. Hi! Is this still available? Can we meet at the library?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {message.length}/500
                </p>
              </div>

              <DialogFooter showCloseButton>
                <Button onClick={handleContactSeller} disabled={isContacting}>
                  {isContacting ? "Opening…" : "Send message"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

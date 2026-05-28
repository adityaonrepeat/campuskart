"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { moderateListing } from "@/actions/admin-actions";

interface RemoveListingButtonProps {
  listingId: string;
  title: string;
}

export function RemoveListingButton({ listingId, title }: RemoveListingButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  async function confirmRemove() {
    setLoading(true);
    const res = await moderateListing(listingId, reason);
    setLoading(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    setOpen(false);
    setReason("");
    toast.success("Listing removed.");
    router.refresh();
  }

  return (
    <>
      <Button size="sm" variant="destructive" onClick={() => setOpen(true)}>
        Remove
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Remove listing?</DialogTitle>
            <DialogDescription>
              &ldquo;{title}&rdquo; will be archived and hidden from all users.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)…"
            rows={2}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none placeholder:text-muted-foreground"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemove} disabled={loading}>
              {loading ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

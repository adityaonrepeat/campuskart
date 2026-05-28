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
import { markListingSold } from "@/actions/listing-actions";

interface MarkSoldButtonProps {
  listingId: string;
  title: string;
}

export function MarkSoldButton({ listingId, title }: MarkSoldButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function confirmSold() {
    setLoading(true);
    const res = await markListingSold(listingId);
    setLoading(false);
    setOpen(false);

    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Marked as sold.");
    router.refresh();
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Mark as Sold
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Mark as sold?</DialogTitle>
            <DialogDescription>
              &ldquo;{title}&rdquo; will be marked as sold. Buyers won&apos;t
              be able to contact you about it anymore.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={confirmSold} disabled={loading}>
              {loading ? "Updating…" : "Mark as Sold"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

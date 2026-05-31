import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ListingForm } from "@/components/listings/listing-form";

export default function NewListingPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#E5E4E0]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/listings"
            className="flex items-center gap-1 text-[#6B7280] hover:text-[#1A1A2E] transition-colors text-sm font-medium"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-[#E5E4E0] select-none">|</span>
          <h1 className="font-semibold text-[#1A1A2E] text-sm">List an Item</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
        <ListingForm />
      </div>
    </div>
  );
}

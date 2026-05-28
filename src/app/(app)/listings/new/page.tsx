import { ListingForm } from "@/components/listings/listing-form";

export default function NewListingPage() {
  return (
    <div className="py-6 space-y-6">
      <h1 className="text-xl font-bold">Create listing</h1>
      <ListingForm />
    </div>
  );
}

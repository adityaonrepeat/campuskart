"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { generateUploadButton } from "@uploadthing/react";
import { updateProfile } from "@/actions/profile-actions";
import { updateProfileSchema, type UpdateProfileInput } from "@/types/profile";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OurFileRouter } from "@/lib/uploadthing";

const UploadButton = generateUploadButton<OurFileRouter>();

interface ProfileEditFormProps {
  initialValues: {
    name: string;
    username: string;
    avatarUrl: string | null;
  };
}

export function ProfileEditForm({ initialValues }: ProfileEditFormProps) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialValues.avatarUrl);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialValues.name,
      username: initialValues.username,
      avatarUrl: initialValues.avatarUrl ?? "",
    },
  });

  async function onSubmit(values: UpdateProfileInput) {
    const result = await updateProfile({ ...values, avatarUrl: avatarUrl ?? "" });

    if (!result.success) {
      if (result.code === "USERNAME_TAKEN") {
        toast.error("That username is already taken.");
      } else {
        toast.error(result.error);
      }
      return;
    }

    toast.success("Profile updated!");
    router.push("/profile");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar */}
      <div className="space-y-3">
        <Label>Profile photo</Label>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <div className="relative h-20 w-20 rounded-full overflow-hidden border shrink-0">
              <Image src={avatarUrl} alt="Avatar" fill className="object-cover" sizes="80px" />
              <button
                type="button"
                onClick={() => setAvatarUrl(null)}
                className="absolute top-0 right-0 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <UserAvatar
              name={initialValues.name}
              avatarUrl={null}
              size="xl"
              className="shrink-0"
            />
          )}

          <UploadButton
            endpoint="avatarUpload"
            disabled={isUploading}
            onUploadBegin={() => setIsUploading(true)}
            onClientUploadComplete={(res) => {
              setIsUploading(false);
              if (res[0]) setAvatarUrl(res[0].ufsUrl ?? res[0].url);
            }}
            onUploadError={(err) => {
              setIsUploading(false);
              toast.error(`Upload failed: ${err.message}`);
            }}
            appearance={{
              button: "text-sm px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-medium",
              allowedContent: "hidden",
            }}
            content={{ button: isUploading ? "Uploading…" : "Change photo" }}
          />
        </div>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Display name</Label>
        <Input id="name" placeholder="Your name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Username */}
      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
          <Input
            id="username"
            placeholder="username"
            className="pl-7"
            {...register("username")}
          />
        </div>
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Lowercase letters, numbers, and underscores only.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting || isUploading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}

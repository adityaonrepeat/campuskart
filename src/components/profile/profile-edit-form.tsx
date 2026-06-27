"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { updateProfile } from "@/actions/profile-actions";
import { updateProfileSchema, type UpdateProfileInput } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileEditFormProps {
  initialValues: {
    name: string;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
  };
}

export function ProfileEditForm({ initialValues }: ProfileEditFormProps) {
  const router = useRouter();

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
      bio: initialValues.bio ?? "",
    },
  });

  async function onSubmit(values: UpdateProfileInput) {
    const result = await updateProfile(values);

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
    <form method="post" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <span className="absolute left-3 top-[18%] -translate-y-1/2 text-muted-foreground text-sm">@</span>
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

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
        <Textarea
          id="bio"
          placeholder="Tell buyers a little about yourself…"
          rows={3}
          className="resize-none"
          {...register("bio")}
        />
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio.message}</p>
        )}
        <p className="text-xs text-muted-foreground">Max 200 characters.</p>
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
          Save changes
        </Button>
      </div>
    </form>
  );
}

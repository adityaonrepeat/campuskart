import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_MAP = {
  sm: { container: "h-8 w-8", icon: "h-4 w-4", text: "text-xs" },
  md: { container: "h-10 w-10", icon: "h-5 w-5", text: "text-sm" },
  lg: { container: "h-14 w-14", icon: "h-7 w-7", text: "text-base" },
  xl: { container: "h-20 w-20", icon: "h-10 w-10", text: "text-xl" },
} as const;

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function UserAvatar({ name, avatarUrl, size = "md", className }: UserAvatarProps) {
  const { container, icon, text } = SIZE_MAP[size];

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0",
        container,
        className
      )}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 80px, 80px"
        />
      ) : name ? (
        <span className={cn("font-semibold text-muted-foreground select-none", text)}>
          {getInitials(name)}
        </span>
      ) : (
        <User className={cn("text-muted-foreground", icon)} />
      )}
    </div>
  );
}

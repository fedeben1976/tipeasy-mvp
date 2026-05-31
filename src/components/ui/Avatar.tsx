import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-10 h-10 text-sm",
  md: "w-14 h-14 text-lg",
  lg: "w-20 h-20 text-2xl",
  xl: "w-28 h-28 text-4xl",
};

export default function Avatar({ name, image, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const colors = [
    "from-emerald-400 to-teal-500",
    "from-blue-400 to-indigo-500",
    "from-violet-400 to-purple-500",
    "from-amber-400 to-orange-500",
    "from-pink-400 to-rose-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  if (image) {
    return (
      <div className={cn("relative rounded-full overflow-hidden", sizeClasses[size], className)}>
        <Image src={image} alt={name} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-white",
        color,
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}

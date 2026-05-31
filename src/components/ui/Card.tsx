import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg" | "none";
}

export default function Card({ children, className, padding = "md", ...props }: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-3xl border border-slate-100 shadow-sm",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

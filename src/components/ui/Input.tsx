"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-4 py-3 rounded-2xl border bg-white text-slate-900 placeholder-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
            "transition-all duration-200",
            error
              ? "border-red-400 focus:ring-red-500"
              : "border-slate-200 hover:border-slate-300",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {hint && !error && <p className="text-sm text-slate-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;

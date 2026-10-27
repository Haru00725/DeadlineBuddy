"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-body-sm font-medium text-graphite"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full h-10 px-3 bg-surface border border-border rounded-xl text-body text-graphite",
            "placeholder:text-muted",
            "focus:outline-none focus:border-graphite focus:ring-1 focus:ring-graphite/10",
            "transition-colors duration-150",
            error && "border-overdue focus:border-overdue focus:ring-overdue/10",
            className
          )}
          {...props}
        />
        {error && <p className="text-micro text-overdue">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };

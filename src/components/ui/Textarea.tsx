"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-body text-graphite",
            "placeholder:text-muted resize-none",
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

Textarea.displayName = "Textarea";

export { Textarea };

"use client";

import { forwardRef, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, ...props }, ref) => {
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
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              "w-full h-10 px-3 pr-10 bg-surface border border-border rounded-xl text-body text-graphite",
              "appearance-none cursor-pointer",
              "focus:outline-none focus:border-graphite focus:ring-1 focus:ring-graphite/10",
              "transition-colors duration-150",
              error && "border-overdue focus:border-overdue focus:ring-overdue/10",
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        </div>
        {error && <p className="text-micro text-overdue">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };

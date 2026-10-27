"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "lime" | "warning" | "danger" | "success";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
}: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    lime: "bg-lime-muted text-graphite",
    warning: "bg-warning-bg text-amber-700",
    danger: "bg-overdue-bg text-overdue",
    success: "bg-success-bg text-success",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-micro",
    md: "px-2.5 py-1 text-caption",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-md",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

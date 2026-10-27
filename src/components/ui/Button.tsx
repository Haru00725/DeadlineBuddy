"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const reducedMotion = useReducedMotion();

    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-lime text-graphite hover:bg-lime-hover active:bg-lime-hover",
      secondary:
        "bg-surface border border-border text-graphite hover:bg-off-white active:bg-off-white",
      ghost:
        "text-graphite hover:bg-black/5 active:bg-black/5",
      danger:
        "bg-overdue text-white hover:bg-red-600 active:bg-red-600",
    };

    const sizes = {
      sm: "h-8 px-3 text-body-sm rounded-lg gap-1.5",
      md: "h-10 px-4 text-body rounded-xl gap-2",
      lg: "h-12 px-6 text-body-lg rounded-xl gap-2.5",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        whileTap={reducedMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.1 }}
        {...(props as any)}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };

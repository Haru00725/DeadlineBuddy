"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onChange, disabled, className }: CheckboxProps) {
  const reducedMotion = useReducedMotion();

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-5 h-5 rounded-md border-2 transition-colors duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        checked
          ? "bg-lime border-lime"
          : "bg-surface border-border hover:border-muted",
        className
      )}
    >
      <AnimatePresence>
        {checked && (
          <motion.span
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 500, damping: 30 }
            }
            className="absolute inset-0 flex items-center justify-center"
          >
            <Check className="w-3.5 h-3.5 text-graphite" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

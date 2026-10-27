"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FilterChipProps {
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}

export function FilterChip({ label, count, isActive, onClick }: FilterChipProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative px-3.5 py-1.5 rounded-full text-body-sm font-medium transition-colors",
        isActive
          ? "text-graphite"
          : "text-muted hover:text-graphite"
      )}
      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
    >
      {isActive && (
        <motion.div
          layoutId="activeFilter"
          className="absolute inset-0 bg-lime rounded-full"
          transition={
            reducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 400, damping: 30 }
          }
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {label}
        {typeof count === "number" && (
          <span
            className={cn(
              "text-micro tabular-nums",
              isActive ? "text-graphite/70" : "text-muted"
            )}
          >
            {count}
          </span>
        )}
      </span>
    </motion.button>
  );
}

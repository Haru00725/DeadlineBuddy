"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.1 }}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-off-white flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-display font-semibold text-graphite text-heading mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-body-sm text-muted max-w-xs mb-4">{description}</p>
      )}
      {action}
    </motion.div>
  );
}

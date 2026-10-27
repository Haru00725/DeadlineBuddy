"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "../ui/AnimatedCounter";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: "default" | "lime" | "warning" | "danger";
  delay?: number;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  variant = "default",
  delay = 0,
}: StatsCardProps) {
  const reducedMotion = useReducedMotion();

  const variants = {
    default: {
      bg: "bg-surface",
      iconBg: "bg-off-white",
      iconColor: "text-muted",
    },
    lime: {
      bg: "bg-lime-muted",
      iconBg: "bg-lime",
      iconColor: "text-graphite",
    },
    warning: {
      bg: "bg-warning-bg",
      iconBg: "bg-warning",
      iconColor: "text-white",
    },
    danger: {
      bg: "bg-overdue-bg",
      iconBg: "bg-overdue",
      iconColor: "text-white",
    },
  };

  const style = variants[variant];

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { duration: 0.3, delay: delay * 0.08, ease: "easeOut" }
      }
      className={cn(
        "p-4 rounded-xl border border-border transition-shadow hover:shadow-card",
        style.bg
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-body-sm text-muted mb-1">{title}</p>
          <p className="font-display font-semibold text-display-sm text-graphite tabular-nums">
            <AnimatedCounter value={value} />
          </p>
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            style.iconBg
          )}
        >
          <Icon className={cn("w-5 h-5", style.iconColor)} />
        </div>
      </div>
    </motion.div>
  );
}

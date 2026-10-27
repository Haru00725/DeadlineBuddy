"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { ProgressRing } from "../ui/ProgressRing";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface WeeklyProgressProps {
  progress: number;
  completed: number;
  total: number;
}

export function WeeklyProgress({ progress, completed, total }: WeeklyProgressProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.45 }}
      className="bg-surface rounded-2xl border border-border p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-muted" />
        <h2 className="font-display font-semibold text-heading text-graphite">
          Weekly Progress
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <ProgressRing progress={progress} size={96} strokeWidth={8} showLabel={false} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-bold text-display-sm text-graphite">
              {progress}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-micro text-muted">Completed</p>
            <p className="font-display font-semibold text-heading text-graphite">
              {completed} tasks
            </p>
          </div>
          <div>
            <p className="text-micro text-muted">Total this week</p>
            <p className="font-display font-semibold text-heading text-graphite">
              {total} tasks
            </p>
          </div>
        </div>
      </div>

      {progress === 100 ? (
        <p className="mt-4 text-body-sm text-lime font-medium">
          Great job! You&apos;ve completed all your tasks this week.
        </p>
      ) : progress >= 75 ? (
        <p className="mt-4 text-body-sm text-muted">
          Almost there! Keep up the momentum.
        </p>
      ) : progress >= 50 ? (
        <p className="mt-4 text-body-sm text-muted">
          Halfway through! You&apos;ve got this.
        </p>
      ) : total > 0 ? (
        <p className="mt-4 text-body-sm text-muted">
          Let&apos;s get started on those tasks!
        </p>
      ) : (
        <p className="mt-4 text-body-sm text-muted">
          No tasks scheduled for this week.
        </p>
      )}
    </motion.section>
  );
}

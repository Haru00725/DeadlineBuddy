"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckCircle2 } from "lucide-react";
import { Task } from "@/lib/types";
import { TaskRow } from "../tasks/TaskRow";
import { EmptyState } from "../ui/EmptyState";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TodaysFocusProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TodaysFocus({ tasks, onToggle, onEdit, onDelete }: TodaysFocusProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.35 }}
      className="bg-surface rounded-2xl border border-border p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-lime" />
        <h2 className="font-display font-semibold text-heading text-graphite">
          Today&apos;s Focus
        </h2>
        {tasks.length > 0 && (
          <span className="ml-auto text-body-sm text-muted">
            {tasks.filter((t) => t.status === "completed").length}/{tasks.length} done
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-7 h-7 text-lime" />}
          title="All clear for today!"
          description="You have no tasks due today. Enjoy your time or plan ahead."
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => onToggle(task.id)}
                onEdit={() => onEdit(task)}
                onDelete={() => onDelete(task.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.section>
  );
}

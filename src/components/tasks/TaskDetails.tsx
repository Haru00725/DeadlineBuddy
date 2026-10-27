"use client";

import { format } from "date-fns";
import { X, Clock, BookOpen, Tag, Flag, FileText, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "@/lib/types";
import { cn, getTaskTypeLabel, getTaskTypeColor, formatFullDate } from "@/lib/utils";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TaskDetailsProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskDetails({
  task,
  isOpen,
  onClose,
  onToggle,
  onEdit,
  onDelete,
}: TaskDetailsProps) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && task && (
        <>
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            className="fixed inset-0 bg-graphite/20 z-50 md:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={reducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: "100%" }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 400, damping: 40 }
            }
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface border-l border-border z-50 overflow-y-auto scroll-touch pb-safe"
          >
            <div className="sticky top-0 bg-surface/95 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between pt-safe z-10">
              <h2 className="font-display font-semibold text-heading text-graphite">
                Task Details
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted hover:text-graphite hover:bg-black/5 active:scale-90 transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={task.status === "completed"}
                  onChange={() => onToggle(task.id)}
                  className="mt-1"
                />
                <h3
                  className={cn(
                    "font-display font-semibold text-display-sm text-graphite",
                    task.status === "completed" && "line-through text-muted"
                  )}
                >
                  {task.title}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-off-white flex items-center justify-center">
                    <BookOpen className="w-4.5 h-4.5 text-muted" />
                  </div>
                  <div>
                    <p className="text-micro text-muted">Subject</p>
                    <p className="text-body font-medium text-graphite">
                      {task.subject}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-off-white flex items-center justify-center">
                    <Tag className="w-4.5 h-4.5 text-muted" />
                  </div>
                  <div>
                    <p className="text-micro text-muted">Type</p>
                    <Badge className={getTaskTypeColor(task.type)}>
                      {getTaskTypeLabel(task.type)}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-off-white flex items-center justify-center">
                    <Clock className="w-4.5 h-4.5 text-muted" />
                  </div>
                  <div>
                    <p className="text-micro text-muted">Due Date</p>
                    <p className="text-body font-medium text-graphite">
                      {formatFullDate(task.dueDate)}
                      {task.dueTime && ` at ${task.dueTime}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-off-white flex items-center justify-center">
                    <Flag className="w-4.5 h-4.5 text-muted" />
                  </div>
                  <div>
                    <p className="text-micro text-muted">Priority</p>
                    <p className="text-body font-medium text-graphite capitalize">
                      {task.priority}
                    </p>
                  </div>
                </div>

                {task.description && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-off-white flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4.5 h-4.5 text-muted" />
                    </div>
                    <div>
                      <p className="text-micro text-muted mb-1">Description</p>
                      <p className="text-body text-graphite whitespace-pre-wrap">
                        {task.description}
                      </p>
                    </div>
                  </div>
                )}

                {task.progress !== undefined && task.status === "pending" && (
                  <div className="pt-2">
                    <p className="text-micro text-muted mb-2">Progress</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-lime rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-body-sm font-medium text-graphite">
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    onEdit(task);
                    onClose();
                  }}
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => {
                    onDelete(task.id);
                    onClose();
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>

              {task.status === "completed" && task.completedAt && (
                <p className="text-micro text-muted text-center">
                  Completed on {format(task.completedAt, "MMM d, yyyy")}
                </p>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

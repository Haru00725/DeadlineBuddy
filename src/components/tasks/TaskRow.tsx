"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Clock, AlertTriangle } from "lucide-react";
import { Task } from "@/lib/types";
import { cn, formatDueDate, getTaskTypeLabel, getTaskTypeColor, getPriorityDot } from "@/lib/utils";
import { Checkbox } from "../ui/Checkbox";
import { Badge } from "../ui/Badge";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { isToday, isBefore, startOfDay } from "date-fns";

interface TaskRowProps {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showHoverActions?: boolean;
}

export function TaskRow({
  task,
  onToggle,
  onEdit,
  onDelete,
  showHoverActions = true,
}: TaskRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();

  const isOverdue =
    task.status === "pending" && task.dueDate && isBefore(task.dueDate, startOfDay(new Date()));
  const isDueToday = task.status === "pending" && task.dueDate && isToday(task.dueDate);

  return (
    <motion.div
      layout={!reducedMotion}
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative flex items-start gap-3 p-4 bg-surface rounded-xl border transition-all",
        isOverdue
          ? "border-overdue/20 bg-overdue-bg/30"
          : "border-border hover:border-border-strong hover:shadow-card",
        task.status === "completed" && "opacity-60"
      )}
    >
      <div className="pt-0.5">
        <Checkbox checked={task.status === "completed"} onChange={onToggle} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <h3
            className={cn(
              "font-medium text-body text-graphite",
              task.status === "completed" && "line-through text-muted"
            )}
          >
            {task.title}
          </h3>
          {isOverdue && (
            <AlertTriangle className="w-4 h-4 text-overdue flex-shrink-0" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-body-sm text-muted">
          <span className="font-medium">{task.subject}</span>
          <span className="text-border-strong">·</span>
          <span className={cn("flex items-center gap-1", isDueToday && "text-graphite font-medium", isOverdue && "text-overdue font-medium")}>
            <Clock className="w-3.5 h-3.5" />
            {formatDueDate(task.dueDate)}
            {task.dueTime && ` at ${task.dueTime}`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge className={getTaskTypeColor(task.type)}>
            {getTaskTypeLabel(task.type)}
          </Badge>
          <div className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", getPriorityDot(task.priority))} />
            <span className="text-micro text-muted capitalize">{task.priority}</span>
          </div>
          {task.progress !== undefined && task.status === "pending" && (
            <div className="flex items-center gap-1.5 ml-2">
              <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-lime rounded-full transition-all"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <span className="text-micro text-muted">{task.progress}%</span>
            </div>
          )}
        </div>
      </div>

      {showHoverActions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="flex items-center gap-1"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 rounded-lg text-muted hover:text-graphite hover:bg-black/5 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 rounded-lg text-muted hover:text-overdue hover:bg-overdue-bg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

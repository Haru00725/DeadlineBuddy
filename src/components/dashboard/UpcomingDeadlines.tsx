"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Task } from "@/lib/types";
import { cn, formatDueDate, getTaskTypeLabel, getTaskTypeColor, getPriorityDot } from "@/lib/utils";
import { Badge } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { format, isToday, isTomorrow } from "date-fns";

interface UpcomingDeadlinesProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function UpcomingDeadlines({ tasks, onTaskClick }: UpcomingDeadlinesProps) {
  const reducedMotion = useReducedMotion();

  const groupedTasks = tasks.reduce(
    (acc, task) => {
      if (!task.dueDate) return acc;
      const dateKey = format(task.dueDate, "yyyy-MM-dd");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(task);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  const sortedDates = Object.keys(groupedTasks).sort();

  return (
    <motion.section
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.4 }}
      className="bg-surface rounded-2xl border border-border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-muted" />
          <h2 className="font-display font-semibold text-heading text-graphite">
            Coming Up
          </h2>
        </div>
        <Link
          href="/calendar"
          className="flex items-center gap-1 text-body-sm text-muted hover:text-graphite transition-colors"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="w-7 h-7 text-muted" />}
          title="No upcoming deadlines"
          description="You're all caught up! Add new tasks to see them here."
        />
      ) : (
        <div className="space-y-4">
          {sortedDates.slice(0, 5).map((dateKey, dateIndex) => {
            const date = new Date(dateKey);
            const dateTasks = groupedTasks[dateKey];

            return (
              <motion.div
                key={dateKey}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { duration: 0.2, delay: 0.45 + dateIndex * 0.05 }
                }
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={cn(
                      "text-body-sm font-medium",
                      isToday(date)
                        ? "text-lime"
                        : isTomorrow(date)
                        ? "text-graphite"
                        : "text-muted"
                    )}
                  >
                    {formatDueDate(date)}
                  </span>
                  <span className="text-micro text-muted font-mono">
                    {format(date, "MMM d")}
                  </span>
                </div>

                <div className="space-y-2 pl-2 border-l-2 border-border">
                  {dateTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className="w-full text-left p-3 rounded-lg bg-off-white/50 hover:bg-off-white transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-medium text-body text-graphite truncate">
                            {task.title}
                          </h4>
                          <p className="text-body-sm text-muted">{task.subject}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge size="sm" className={getTaskTypeColor(task.type)}>
                            {getTaskTypeLabel(task.type)}
                          </Badge>
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full",
                              getPriorityDot(task.priority)
                            )}
                          />
                        </div>
                      </div>
                      {task.dueTime && (
                        <div className="flex items-center gap-1 mt-1.5 text-micro text-muted">
                          <Clock className="w-3 h-3" />
                          {task.dueTime}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}

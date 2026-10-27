"use client";

import { createContext, useContext } from "react";
import { Task, FilterType, DashboardStats } from "./types";
import { isToday, isBefore, isAfter, startOfDay, endOfDay, addDays, startOfWeek, endOfWeek } from "date-fns";

export interface TaskStore {
  tasks: Task[];
  isLoaded: boolean;
  addTask: (task: Omit<Task, "id" | "createdAt" | "status">) => void;
  addTasks: (tasks: Omit<Task, "id" | "createdAt" | "status">[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  getFilteredTasks: (filter: FilterType, searchQuery?: string) => Task[];
  getStats: () => DashboardStats;
  getTodaysTasks: () => Task[];
  getUpcomingTasks: (limit?: number) => Task[];
  getTasksForDate: (date: Date) => Task[];
  getWeekTasks: (weekStart: Date) => Task[];
  clearAllTasks: () => void;
  exportTasks: (format: "json" | "ics") => void;
  importTasks: (json: string) => boolean;
  checkDuplicate: (title: string, dueDate: Date | null) => boolean;
}

export const TaskContext = createContext<TaskStore | null>(null);

export function useTaskStore(): TaskStore {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskStore must be used within a TaskProvider");
  }
  return context;
}

export function calculateStats(tasks: Task[]): DashboardStats {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const dueToday = pendingTasks.filter(
    (t) => t.dueDate && t.dueDate >= todayStart && t.dueDate <= todayEnd
  ).length;

  const overdue = pendingTasks.filter(
    (t) => t.dueDate && isBefore(t.dueDate, todayStart)
  ).length;

  const upcoming = pendingTasks.filter(
    (t) => t.dueDate && isAfter(t.dueDate, todayEnd)
  ).length;

  const weekTasks = tasks.filter(
    (t) => t.dueDate && t.dueDate >= weekStart && t.dueDate <= weekEnd
  );
  const weekCompleted = weekTasks.filter((t) => t.status === "completed").length;
  const weeklyProgress = weekTasks.length > 0
    ? Math.round((weekCompleted / weekTasks.length) * 100)
    : 0;

  return {
    dueToday,
    upcoming,
    overdue,
    completed: completedTasks.length,
    weeklyProgress,
  };
}

export function filterTasks(
  tasks: Task[],
  filter: FilterType,
  searchQuery?: string
): Task[] {
  let filtered = [...tasks];

  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
    );
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  switch (filter) {
    case "today":
      return filtered.filter(
        (t) =>
          t.status === "pending" &&
          t.dueDate &&
          t.dueDate >= todayStart &&
          t.dueDate <= todayEnd
      );
    case "upcoming":
      return filtered.filter(
        (t) => t.status === "pending" && t.dueDate && isAfter(t.dueDate, todayEnd)
      );
    case "overdue":
      return filtered.filter(
        (t) => t.status === "pending" && t.dueDate && isBefore(t.dueDate, todayStart)
      );
    case "completed":
      return filtered.filter((t) => t.status === "completed");
    default:
      return filtered;
  }
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "pending" ? -1 : 1;
    }
    if (a.status === "pending") {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    return (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0);
  });
}

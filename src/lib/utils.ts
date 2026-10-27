import { clsx, type ClassValue } from "clsx";
import { format, isToday, isTomorrow, isYesterday, differenceInDays } from "date-fns";
import { TaskType, Priority } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function ensureDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  if (date instanceof Date) return isNaN(date.getTime()) ? null : date;
  if (typeof date === "string") {
    // If it's a simple YYYY-MM-DD string, construct local date to avoid UTC midnight drift
    const ymd = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymd) {
      return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]), 23, 59, 59);
    }
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function getTaskDateKey(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  if (typeof date === "string") {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : format(d, "yyyy-MM-dd");
  }
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : format(date, "yyyy-MM-dd");
  }
  return null;
}

export function formatDueDate(date: Date | string | null): string {
  const d = ensureDate(date);
  if (!d) return "No date";
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isYesterday(d)) return "Yesterday";

  const daysFromNow = differenceInDays(d, new Date());
  if (daysFromNow > 0 && daysFromNow <= 6) {
    return format(d, "EEEE");
  }

  return format(d, "MMM d");
}

export function formatDateTime(date: Date | null, time?: string): string {
  if (!date) return "No date";
  const dateStr = formatDueDate(date);
  if (time) {
    return `${dateStr} at ${time}`;
  }
  return dateStr;
}

export function formatFullDate(date: Date | string | null): string {
  const d = ensureDate(date);
  if (!d) return "No date specified";
  return format(d, "EEEE, MMMM d, yyyy");
}

export function formatShortDate(date: Date | string | null): string {
  const d = ensureDate(date);
  if (!d) return "No date";
  return format(d, "MMM d");
}

export function formatTime(date: Date): string {
  return format(date, "h:mm a");
}

export function getTaskTypeLabel(type: TaskType): string {
  const labels: Record<TaskType, string> = {
    assignment: "Assignment",
    exam: "Exam",
    project: "Project",
    quiz: "Quiz",
    presentation: "Presentation",
    registration: "Registration",
    payment: "Payment",
    reading: "Reading",
    other: "Other",
  };
  return labels[type] || "Other";
}

export function getTaskTypeColor(type: TaskType): string {
  const colors: Record<TaskType, string> = {
    assignment: "bg-blue-100 text-blue-700",
    exam: "bg-purple-100 text-purple-700",
    project: "bg-amber-100 text-amber-700",
    quiz: "bg-cyan-100 text-cyan-700",
    presentation: "bg-pink-100 text-pink-700",
    registration: "bg-orange-100 text-orange-700",
    payment: "bg-rose-100 text-rose-700",
    reading: "bg-emerald-100 text-emerald-700",
    other: "bg-gray-100 text-gray-600",
  };
  return colors[type] || "bg-gray-100 text-gray-600";
}

export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-gray-100 text-gray-600",
  };
  return colors[priority];
}

export function getPriorityDot(priority: Priority): string {
  const colors: Record<Priority, string> = {
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-gray-400",
  };
  return colors[priority];
}

export function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getDayProgress(): number {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return Math.round(((hours * 60 + minutes) / (24 * 60)) * 100);
}

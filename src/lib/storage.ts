"use client";

import { Task, SerializedTask } from "./types";

const STORAGE_KEY = "deadlinebuddy_tasks";
const STORAGE_VERSION = "1";

export function serializeTask(task: Task): SerializedTask {
  return {
    ...task,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    completedAt: task.completedAt ? task.completedAt.toISOString() : undefined,
  };
}

export function deserializeTask(data: SerializedTask): Task {
  return {
    ...data,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    createdAt: new Date(data.createdAt),
    completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
  };
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return;

  try {
    const serialized = tasks.map(serializeTask);
    const data = {
      version: STORAGE_VERSION,
      tasks: serialized,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save tasks:", error);
  }
}

export function loadTasks(): Task[] | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);

    if (!data.tasks || !Array.isArray(data.tasks)) {
      console.warn("Invalid stored data format");
      return null;
    }

    const tasks = data.tasks
      .filter((t: unknown) => {
        if (!t || typeof t !== "object") return false;
        const task = t as Record<string, unknown>;
        return (
          typeof task.id === "string" &&
          typeof task.title === "string" &&
          typeof task.subject === "string"
        );
      })
      .map((t: SerializedTask) => {
        try {
          return deserializeTask(t);
        } catch {
          return null;
        }
      })
      .filter((t: Task | null): t is Task => t !== null);

    return tasks;
  } catch (error) {
    console.error("Failed to load tasks:", error);
    return null;
  }
}

export function clearTasks(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function exportTasksJSON(tasks: Task[]): string {
  const serialized = tasks.map(serializeTask);
  const data = {
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    tasks: serialized,
  };
  return JSON.stringify(data, null, 2);
}

export function importTasksJSON(json: string): Task[] | null {
  try {
    const data = JSON.parse(json);

    if (!data.tasks || !Array.isArray(data.tasks)) {
      return null;
    }

    return data.tasks
      .filter((t: unknown) => {
        if (!t || typeof t !== "object") return false;
        const task = t as Record<string, unknown>;
        return (
          typeof task.id === "string" &&
          typeof task.title === "string" &&
          typeof task.subject === "string"
        );
      })
      .map((t: SerializedTask) => {
        try {
          return deserializeTask(t);
        } catch {
          return null;
        }
      })
      .filter((t: Task | null): t is Task => t !== null);
  } catch {
    return null;
  }
}

export function generateICS(tasks: Task[]): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const escapeText = (text: string): string => {
    return text.replace(/[\\;,\n]/g, (match) => {
      if (match === "\n") return "\\n";
      return "\\" + match;
    });
  };

  const events = tasks
    .filter((t) => t.dueDate !== null)
    .map((task) => {
      const dueDate = task.dueDate!;
      const startDate = new Date(dueDate);

      if (task.dueTime) {
        const [hours, minutes] = task.dueTime.split(":").map(Number);
        startDate.setHours(hours, minutes, 0, 0);
      } else {
        startDate.setHours(23, 59, 0, 0);
      }

      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      const summary = `[${task.type.toUpperCase()}] ${task.title}`;
      const description = [
        task.subject !== "General" ? `Subject: ${task.subject}` : "",
        task.description || "",
        task.sourceExcerpt ? `Source: ${task.sourceExcerpt}` : "",
      ]
        .filter(Boolean)
        .join("\\n");

      return [
        "BEGIN:VEVENT",
        `UID:${task.id}@deadlinebuddy`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${escapeText(summary)}`,
        description ? `DESCRIPTION:${escapeText(description)}` : "",
        task.priority === "high" ? "PRIORITY:1" : task.priority === "medium" ? "PRIORITY:5" : "PRIORITY:9",
        task.status === "completed" ? "STATUS:COMPLETED" : "STATUS:CONFIRMED",
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\r\n");
    });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DeadlineBuddy//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:DeadlineBuddy Tasks",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

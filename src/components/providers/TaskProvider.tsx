"use client";

import { useState, useCallback, useMemo, useEffect, ReactNode } from "react";
import { Task, FilterType } from "@/lib/types";
import { TaskContext, calculateStats, filterTasks, sortTasks } from "@/lib/store";
import { generateId } from "@/lib/utils";
import { saveTasks, loadTasks, clearTasks as clearStoredTasks, exportTasksJSON, importTasksJSON, generateICS, downloadFile } from "@/lib/storage";
import {
  isToday,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = loadTasks();
    if (stored && stored.length > 0) {
      setTasks(stored);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveTasks(tasks);
    }
  }, [tasks, isLoaded]);

  const addTask = useCallback(
    (taskData: Omit<Task, "id" | "createdAt" | "status">) => {
      const newTask: Task = {
        ...taskData,
        id: generateId(),
        status: "pending",
        createdAt: new Date(),
      };
      setTasks((prev) => [...prev, newTask]);
    },
    []
  );

  const addTasks = useCallback(
    (taskDataList: Omit<Task, "id" | "createdAt" | "status">[]) => {
      const newTasks = taskDataList.map((taskData) => ({
        ...taskData,
        id: generateId(),
        status: "pending" as const,
        createdAt: new Date(),
      }));
      setTasks((prev) => [...prev, ...newTasks]);
    },
    []
  );

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const newStatus = task.status === "completed" ? "pending" : "completed";
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === "completed" ? new Date() : undefined,
        };
      })
    );
  }, []);

  const getFilteredTasks = useCallback(
    (filter: FilterType, searchQuery?: string) => {
      return sortTasks(filterTasks(tasks, filter, searchQuery));
    },
    [tasks]
  );

  const getStats = useCallback(() => {
    return calculateStats(tasks);
  }, [tasks]);

  const getTodaysTasks = useCallback(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    return sortTasks(
      tasks.filter(
        (t) => t.dueDate && t.dueDate >= todayStart && t.dueDate <= todayEnd
      )
    );
  }, [tasks]);

  const getUpcomingTasks = useCallback(
    (limit?: number) => {
      const todayEnd = endOfDay(new Date());
      const upcoming = sortTasks(
        tasks.filter((t) => t.status === "pending" && t.dueDate && isAfter(t.dueDate, todayEnd))
      );
      return limit ? upcoming.slice(0, limit) : upcoming;
    },
    [tasks]
  );

  const getTasksForDate = useCallback(
    (date: Date) => {
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      return sortTasks(
        tasks.filter((t) => t.dueDate && t.dueDate >= dayStart && t.dueDate <= dayEnd)
      );
    },
    [tasks]
  );

  const getWeekTasks = useCallback(
    (weekStart: Date) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      return sortTasks(
        tasks.filter((t) => t.dueDate && t.dueDate >= weekStart && t.dueDate <= weekEnd)
      );
    },
    [tasks]
  );

  const clearAllTasks = useCallback(() => {
    setTasks([]);
    clearStoredTasks();
  }, []);

  const exportTasks = useCallback((format: "json" | "ics") => {
    const date = new Date().toISOString().split("T")[0];
    if (format === "json") {
      const json = exportTasksJSON(tasks);
      downloadFile(json, `deadlinebuddy-tasks-${date}.json`, "application/json");
    } else {
      const ics = generateICS(tasks);
      downloadFile(ics, `deadlinebuddy-tasks-${date}.ics`, "text/calendar");
    }
  }, [tasks]);

  const importTasks = useCallback((json: string): boolean => {
    const imported = importTasksJSON(json);
    if (!imported) return false;

    const existingIds = new Set(tasks.map((t) => t.id));
    const newTasks = imported.filter((t) => !existingIds.has(t.id));

    if (newTasks.length > 0) {
      setTasks((prev) => [...prev, ...newTasks]);
    }
    return true;
  }, [tasks]);

  const checkDuplicate = useCallback(
    (title: string, dueDate: Date | null): boolean => {
      return tasks.some(
        (t) =>
          t.title.toLowerCase() === title.toLowerCase() &&
          ((t.dueDate === null && dueDate === null) ||
            (t.dueDate && dueDate && t.dueDate.getTime() === dueDate.getTime()))
      );
    },
    [tasks]
  );

  const value = useMemo(
    () => ({
      tasks,
      isLoaded,
      addTask,
      addTasks,
      updateTask,
      deleteTask,
      toggleTaskComplete,
      getFilteredTasks,
      getStats,
      getTodaysTasks,
      getUpcomingTasks,
      getTasksForDate,
      getWeekTasks,
      clearAllTasks,
      exportTasks,
      importTasks,
      checkDuplicate,
    }),
    [
      tasks,
      isLoaded,
      addTask,
      addTasks,
      updateTask,
      deleteTask,
      toggleTaskComplete,
      getFilteredTasks,
      getStats,
      getTodaysTasks,
      getUpcomingTasks,
      getTasksForDate,
      getWeekTasks,
      clearAllTasks,
      exportTasks,
      importTasks,
      checkDuplicate,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

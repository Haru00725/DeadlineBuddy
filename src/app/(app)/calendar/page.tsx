"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTaskStore } from "@/lib/store";
import { Task } from "@/lib/types";
import { WeekCalendar } from "@/components/calendar/WeekCalendar";
import { TaskModal } from "@/components/tasks/TaskModal";
import { TaskDetails } from "@/components/tasks/TaskDetails";
import { useToast } from "@/components/ui/Toast";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useMediaQuery";

export default function CalendarPage() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<Date | null>(null);

  const { tasks, addTask, updateTask, deleteTask, toggleTaskComplete } =
    useTaskStore();

  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const handleNewTask = (date?: Date) => {
    setEditingTask(null);
    setPrefilledDate(date || null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setPrefilledDate(null);
    setIsTaskModalOpen(true);
    setIsDetailsOpen(false);
  };

  const handleSaveTask = (
    taskData: Omit<Task, "id" | "createdAt" | "status" | "completedAt">
  ) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      showToast("Task updated successfully");
    } else {
      addTask(taskData);
      showToast("Task created successfully");
    }
    setPrefilledDate(null);
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    setIsDetailsOpen(false);
    showToast("Task deleted");
  };

  const handleToggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    toggleTaskComplete(id);
    if (task) {
      showToast(
        task.status === "completed" ? "Task marked as pending" : "Task completed!"
      );
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const handleDateClick = (date: Date) => {
    // Date selection handled internally by WeekCalendar
  };

  return (
    <div className={isMobile ? "px-4 py-6" : ""}>
      <motion.header
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="font-display font-bold text-display-sm text-graphite">
          Calendar
        </h1>
        <p className="text-body-sm text-muted mt-1">
          View and manage your deadlines by date
        </p>
      </motion.header>

      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.1 }}
        className="bg-surface rounded-2xl border border-border p-4 sm:p-6"
      >
        <WeekCalendar
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onDateClick={handleDateClick}
          onNewTask={(date) => handleNewTask(date)}
        />
      </motion.div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setPrefilledDate(null);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
        prefilledDate={prefilledDate}
      />

      <TaskDetails
        task={selectedTask}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onToggle={handleToggleTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}

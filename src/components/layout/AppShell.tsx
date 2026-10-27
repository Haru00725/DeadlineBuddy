"use client";

import { useState, ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { MobileHeader } from "./MobileHeader";
import { TaskModal } from "../tasks/TaskModal";
import { TaskDetails } from "../tasks/TaskDetails";
import { ToastProvider, useToast } from "../ui/Toast";
import { TaskProvider } from "../providers/TaskProvider";
import { useTaskStore } from "@/lib/store";
import { Task } from "@/lib/types";
import { useIsMobile } from "@/hooks/useMediaQuery";

function AppShellContent({ children }: { children: ReactNode }) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { addTask, updateTask, deleteTask, toggleTaskComplete } = useTaskStore();
  const { showToast } = useToast();
  const isMobile = useIsMobile();

  const handleNewTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
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
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    setIsDetailsOpen(false);
    showToast("Task deleted");
  };

  const handleToggleTask = (id: string) => {
    const task = selectedTask?.id === id ? selectedTask : null;
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

  return (
    <div className="min-h-screen bg-off-white">
      {isMobile ? (
        <>
          <MobileHeader />
          <main className="pb-28">{children}</main>
          <MobileNav onNewTask={handleNewTask} />
        </>
      ) : (
        <>
          <Sidebar onNewTask={handleNewTask} />
          <main className="pl-64">
            <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
          </main>
        </>
      )}

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
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

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TaskProvider>
      <ToastProvider>
        <AppShellContent>{children}</AppShellContent>
      </ToastProvider>
    </TaskProvider>
  );
}

export function useAppShell() {
  const { showToast } = useToast();
  return { showToast };
}

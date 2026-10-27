"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, CalendarCheck, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useTaskStore } from "@/lib/store";
import { Task } from "@/lib/types";
import { getGreeting } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TodaysFocus } from "@/components/dashboard/TodaysFocus";
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";
import { WeeklyProgress } from "@/components/dashboard/WeeklyProgress";
import { WelcomeAnimation } from "@/components/dashboard/WelcomeAnimation";
import { TaskModal } from "@/components/tasks/TaskModal";
import { TaskDetails } from "@/components/tasks/TaskDetails";
import { useToast } from "@/components/ui/Toast";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useMediaQuery";

export default function DashboardPage() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    getStats,
    getTodaysTasks,
    getUpcomingTasks,
  } = useTaskStore();

  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const stats = getStats();
  const todaysTasks = getTodaysTasks();
  const upcomingTasks = getUpcomingTasks(10);

  const weekTasksCount = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return t.dueDate >= weekStart && t.dueDate <= weekEnd;
  }).length;

  const weekCompletedCount = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return (
      t.status === "completed" &&
      t.dueDate >= weekStart &&
      t.dueDate <= weekEnd
    );
  }).length;

  const handleNewTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
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

  const isEmpty = tasks.length === 0;

  return (
    <div className={isMobile ? "px-4 py-6" : ""}>
      <motion.header
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="font-display font-bold text-display-md text-graphite">
            {getGreeting()}
          </h1>
          <p className="text-body text-muted mt-1">
            Here&apos;s what your week looks like.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-body-sm text-muted font-mono">
            {format(new Date(), "EEE, MMM d")}
          </span>
          <Button onClick={handleNewTask}>
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
      </motion.header>

      {isEmpty ? (
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.1 }}
          className="bg-surface rounded-2xl border border-border p-8"
        >
          <WelcomeAnimation />
          <div className="text-center max-w-md mx-auto">
            <h2 className="font-display font-semibold text-display-sm text-graphite mb-2">
              Welcome to DeadlineBuddy
            </h2>
            <p className="text-body text-muted mb-6">
              Your deadlines, under control. Start by adding your first task or scan
              a college notice to automatically extract deadlines.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleNewTask}>
                <Plus className="w-4 h-4" />
                Create First Task
              </Button>
              <Button variant="secondary" onClick={() => window.location.href = "/scan"}>
                Scan a Notice
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatsCard
              title="Due Today"
              value={stats.dueToday}
              icon={CalendarCheck}
              variant="lime"
              delay={0}
            />
            <StatsCard
              title="Upcoming"
              value={stats.upcoming}
              icon={Clock}
              delay={1}
            />
            <StatsCard
              title="Overdue"
              value={stats.overdue}
              icon={AlertTriangle}
              variant={stats.overdue > 0 ? "danger" : "default"}
              delay={2}
            />
            <StatsCard
              title="Completed"
              value={stats.completed}
              icon={CheckCircle2}
              delay={3}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <TodaysFocus
                tasks={todaysTasks}
                onToggle={handleToggleTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
              <UpcomingDeadlines
                tasks={upcomingTasks}
                onTaskClick={handleTaskClick}
              />
            </div>

            <div>
              <WeeklyProgress
                progress={stats.weeklyProgress}
                completed={weekCompletedCount}
                total={weekTasksCount}
              />
            </div>
          </div>
        </div>
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

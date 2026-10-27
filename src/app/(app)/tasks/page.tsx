"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, SlidersHorizontal, ListFilter } from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { Task, FilterType } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FilterChip } from "@/components/ui/FilterChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { TaskRow } from "@/components/tasks/TaskRow";
import { TaskModal } from "@/components/tasks/TaskModal";
import { TaskDetails } from "@/components/tasks/TaskDetails";
import { useToast } from "@/components/ui/Toast";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useMediaQuery";

const filters: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "overdue", label: "Overdue" },
  { key: "completed", label: "Completed" },
];

export default function TasksPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
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
    getFilteredTasks,
    getStats,
  } = useTaskStore();

  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const stats = getStats();
  const filteredTasks = useMemo(
    () => getFilteredTasks(activeFilter, searchQuery),
    [getFilteredTasks, activeFilter, searchQuery]
  );

  const filterCounts: Record<FilterType, number> = {
    all: tasks.length,
    today: stats.dueToday,
    upcoming: stats.upcoming,
    overdue: stats.overdue,
    completed: stats.completed,
  };

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

  return (
    <div className={isMobile ? "px-4 py-6" : ""}>
      <motion.header
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="font-display font-bold text-display-sm text-graphite">
            My Tasks
          </h1>
          <p className="text-body-sm text-muted mt-1">
            {tasks.length} total tasks
          </p>
        </div>
        <Button onClick={handleNewTask}>
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </motion.header>

      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.1 }}
        className="bg-surface rounded-2xl border border-border p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-off-white border border-border rounded-xl text-body text-graphite placeholder:text-muted focus:outline-none focus:border-graphite focus:ring-1 focus:ring-graphite/10 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-6 pb-4 border-b border-border">
          {filters.map((filter) => (
            <FilterChip
              key={filter.key}
              label={filter.label}
              count={filterCounts[filter.key]}
              isActive={activeFilter === filter.key}
              onClick={() => setActiveFilter(filter.key)}
            />
          ))}
        </div>

        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={<ListFilter className="w-7 h-7 text-muted" />}
            title={
              searchQuery
                ? "No matching tasks"
                : activeFilter === "all"
                ? "No tasks yet"
                : `No ${activeFilter} tasks`
            }
            description={
              searchQuery
                ? "Try adjusting your search or filters."
                : "Create a task to get started."
            }
            action={
              !searchQuery &&
              activeFilter === "all" && (
                <Button onClick={handleNewTask}>
                  <Plus className="w-4 h-4" />
                  Create Task
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="cursor-pointer"
                >
                  <TaskRow
                    task={task}
                    onToggle={() => handleToggleTask(task.id)}
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

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

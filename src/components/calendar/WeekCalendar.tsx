"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  List,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isToday,
  isSameDay,
  isSameMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfDay,
  endOfDay,
  isBefore,
  isAfter,
} from "date-fns";
import { Task } from "@/lib/types";
import {
  cn,
  getTaskTypeColor,
  getTaskTypeLabel,
  getPriorityDot,
  getTaskDateKey,
  ensureDate,
  formatDueDate,
} from "@/lib/utils";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useMediaQuery";

type ViewMode = "month" | "week" | "agenda";

interface WeekCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDateClick: (date: Date) => void;
  onNewTask: (date?: Date) => void;
}

export function WeekCalendar({
  tasks,
  onTaskClick,
  onDateClick,
  onNewTask,
}: WeekCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [slideDirection, setSlideDirection] = useState<number>(0);

  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Normalize all tasks and index by yyyy-MM-dd key
  const { tasksByDate, allDatedTasks, undatedTasks } = useMemo(() => {
    const map = new Map<string, Task[]>();
    const dated: Task[] = [];
    const undated: Task[] = [];

    tasks.forEach((task) => {
      const dateKey = getTaskDateKey(task.dueDate);
      if (!dateKey) {
        undated.push(task);
        return;
      }
      dated.push(task);
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(task);
    });

    // Sort dated tasks chronologically
    dated.sort((a, b) => {
      const da = ensureDate(a.dueDate)?.getTime() || 0;
      const db = ensureDate(b.dueDate)?.getTime() || 0;
      return da - db;
    });

    return { tasksByDate: map, allDatedTasks: dated, undatedTasks: undated };
  }, [tasks]);

  // Find the next upcoming task with a deadline for quick jumping
  const nextUpcomingTask = useMemo(() => {
    const todayStart = startOfDay(new Date());
    return (
      allDatedTasks.find(
        (t) =>
          t.status === "pending" &&
          ensureDate(t.dueDate) &&
          !isBefore(ensureDate(t.dueDate)!, todayStart)
      ) || allDatedTasks[0] || null
    );
  }, [allDatedTasks]);

  // Tasks for currently selected day
  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const selectedDateTasks = useMemo(() => {
    return tasksByDate.get(selectedDateKey) || [];
  }, [tasksByDate, selectedDateKey]);

  // Week range
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: weekEnd }),
    [weekStart, weekEnd]
  );

  // Month range
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthGridDays = useMemo(() => {
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [monthStart, monthEnd]);

  // Tasks present in currently viewed period
  const hasTasksInCurrentPeriod = useMemo(() => {
    if (viewMode === "week") {
      return weekDays.some((d) => (tasksByDate.get(format(d, "yyyy-MM-dd")) || []).length > 0);
    }
    if (viewMode === "month") {
      return monthGridDays.some(
        (d) => isSameMonth(d, currentDate) && (tasksByDate.get(format(d, "yyyy-MM-dd")) || []).length > 0
      );
    }
    return allDatedTasks.length > 0;
  }, [viewMode, weekDays, monthGridDays, tasksByDate, currentDate, allDatedTasks]);

  const handlePrev = () => {
    setSlideDirection(-1);
    if (viewMode === "month") {
      const newMonth = subMonths(currentDate, 1);
      setCurrentDate(newMonth);
      setSelectedDate(startOfMonth(newMonth));
    } else {
      const newWeek = subWeeks(currentDate, 1);
      setCurrentDate(newWeek);
      setSelectedDate(startOfWeek(newWeek, { weekStartsOn: 1 }));
    }
  };

  const handleNext = () => {
    setSlideDirection(1);
    if (viewMode === "month") {
      const newMonth = addMonths(currentDate, 1);
      setCurrentDate(newMonth);
      setSelectedDate(startOfMonth(newMonth));
    } else {
      const newWeek = addWeeks(currentDate, 1);
      setCurrentDate(newWeek);
      setSelectedDate(startOfWeek(newWeek, { weekStartsOn: 1 }));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setSlideDirection(today > currentDate ? 1 : -1);
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleSelectDay = (day: Date) => {
    setSelectedDate(day);
    setCurrentDate(day);
    onDateClick(day);
  };

  const jumpToTaskDate = (task: Task) => {
    const d = ensureDate(task.dueDate);
    if (d) {
      setCurrentDate(d);
      setSelectedDate(d);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Navigation / Month-Week Title */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl text-muted hover:text-graphite hover:bg-black/5 active:scale-95 transition-all"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="font-display font-semibold text-heading text-graphite min-w-[160px] text-center">
            {viewMode === "month"
              ? format(currentDate, "MMMM yyyy")
              : viewMode === "week"
              ? `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
              : "All Deadlines"}
          </h2>

          <button
            onClick={handleNext}
            className="p-2 rounded-xl text-muted hover:text-graphite hover:bg-black/5 active:scale-95 transition-all"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleToday}
            className="ml-1 px-3 py-1.5 text-body-sm font-medium rounded-xl border border-border bg-surface text-graphite hover:bg-off-white active:scale-95 transition-all"
          >
            Today
          </button>
        </div>

        {/* View Mode Switcher & New Task */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="flex p-1 bg-off-white rounded-xl border border-border">
            <button
              onClick={() => setViewMode("month")}
              className={cn(
                "px-3 py-1.5 text-micro font-medium rounded-lg transition-all",
                viewMode === "month"
                  ? "bg-surface text-graphite shadow-sm"
                  : "text-muted hover:text-graphite"
              )}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={cn(
                "px-3 py-1.5 text-micro font-medium rounded-lg transition-all",
                viewMode === "week"
                  ? "bg-surface text-graphite shadow-sm"
                  : "text-muted hover:text-graphite"
              )}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={cn(
                "px-3 py-1.5 text-micro font-medium rounded-lg transition-all flex items-center gap-1",
                viewMode === "agenda"
                  ? "bg-surface text-graphite shadow-sm"
                  : "text-muted hover:text-graphite"
              )}
            >
              <List className="w-3.5 h-3.5" />
              Schedule ({allDatedTasks.length})
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => onNewTask(selectedDate)}
            className="active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">New Task</span>
          </Button>
        </div>
      </div>

      {/* Quick Jump Banner when current view is empty but tasks exist */}
      {!hasTasksInCurrentPeriod && nextUpcomingTask && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-lime-muted/60 border border-lime/40 rounded-xl text-body-sm"
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon className="w-4 h-4 text-graphite flex-shrink-0" />
            <span className="text-graphite font-medium truncate">
              Next deadline:{" "}
              <strong className="font-semibold">{nextUpcomingTask.title}</strong> (
              {formatDueDate(nextUpcomingTask.dueDate)})
            </span>
          </div>
          <button
            onClick={() => jumpToTaskDate(nextUpcomingTask)}
            className="flex items-center gap-1 text-graphite font-semibold hover:underline text-micro ml-3 flex-shrink-0"
          >
            Jump to date <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Main Calendar Content Based on View Mode */}
      <AnimatePresence mode="wait">
        {viewMode === "month" && (
          <motion.div
            key={`month-${format(currentDate, "yyyy-MM")}`}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: slideDirection * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: slideDirection * -20 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            {/* Month Days Grid */}
            <div className="border border-border rounded-2xl overflow-hidden bg-surface shadow-card">
              {/* Day of week headers */}
              <div className="grid grid-cols-7 border-b border-border bg-off-white/80 text-center py-2.5">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <span key={d} className="text-micro font-semibold text-muted tracking-wider">
                    {d}
                  </span>
                ))}
              </div>

              {/* Days cells */}
              <div className="grid grid-cols-7 divide-x divide-y divide-border/60">
                {monthGridDays.map((day) => {
                  const dayKey = format(day, "yyyy-MM-dd");
                  const dayTasks = tasksByDate.get(dayKey) || [];
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isCurrentDay = isToday(day);
                  const isSelected = isSameDay(day, selectedDate);

                  return (
                    <button
                      key={dayKey}
                      onClick={() => handleSelectDay(day)}
                      className={cn(
                        "min-h-[72px] sm:min-h-[96px] p-1.5 sm:p-2 text-left flex flex-col justify-between transition-colors relative",
                        !isCurrentMonth && "bg-off-white/40 text-muted/60",
                        isSelected && "bg-lime-muted/50 ring-2 ring-lime inset-0 z-10",
                        !isSelected && "hover:bg-off-white/60"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-display font-semibold text-micro sm:text-body-sm transition-all",
                            isCurrentDay
                              ? "bg-lime text-graphite font-bold shadow-sm"
                              : isSelected
                              ? "bg-graphite text-white font-bold"
                              : isCurrentMonth
                              ? "text-graphite"
                              : "text-muted"
                          )}
                        >
                          {format(day, "d")}
                        </span>

                        {dayTasks.length > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-lime text-graphite hidden sm:inline-block">
                            {dayTasks.length}
                          </span>
                        )}
                      </div>

                      {/* Task preview dots / snippets */}
                      <div className="mt-1 space-y-1 overflow-hidden w-full">
                        {/* Mobile: Colored dots indicator */}
                        <div className="flex flex-wrap gap-1 sm:hidden">
                          {dayTasks.slice(0, 4).map((t) => (
                            <span
                              key={t.id}
                              className={cn(
                                "w-2 h-2 rounded-full",
                                t.status === "completed" ? "bg-muted" : "bg-lime-hover"
                              )}
                            />
                          ))}
                        </div>

                        {/* Desktop: Mini task title badges */}
                        <div className="hidden sm:block space-y-1">
                          {dayTasks.slice(0, 2).map((t) => (
                            <div
                              key={t.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onTaskClick(t);
                              }}
                              className={cn(
                                "px-1.5 py-0.5 rounded text-[10px] font-medium truncate border transition-colors",
                                t.status === "completed"
                                  ? "bg-off-white/80 text-muted line-through border-transparent"
                                  : "bg-surface border-border hover:border-graphite/30 text-graphite shadow-sm"
                              )}
                            >
                              {t.title}
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <p className="text-[10px] text-muted font-medium pl-1">
                              +{dayTasks.length - 2} more
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Task List Details below Month Grid */}
            <DayTaskList
              selectedDate={selectedDate}
              tasks={selectedDateTasks}
              onTaskClick={onTaskClick}
              onNewTask={() => onNewTask(selectedDate)}
            />
          </motion.div>
        )}

        {viewMode === "week" && (
          <motion.div
            key={`week-${weekDays[0].toISOString()}`}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: slideDirection * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: slideDirection * -20 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            {/* Week Strip */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {weekDays.map((day) => {
                const dayKey = format(day, "yyyy-MM-dd");
                const dayTasks = tasksByDate.get(dayKey) || [];
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);

                return (
                  <button
                    key={dayKey}
                    onClick={() => handleSelectDay(day)}
                    className={cn(
                      "flex flex-col items-center justify-between p-2 sm:p-3 rounded-2xl border transition-all text-center min-h-[90px] sm:min-h-[120px]",
                      isSelected
                        ? "border-lime bg-lime-muted/60 shadow-sm"
                        : isCurrentDay
                        ? "border-lime/60 bg-surface"
                        : "border-border bg-surface hover:border-muted"
                    )}
                  >
                    <span className="text-micro font-medium text-muted uppercase">
                      {format(day, "EEE")}
                    </span>

                    <span
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-display font-semibold text-body sm:text-body-lg my-1",
                        isCurrentDay
                          ? "bg-lime text-graphite font-bold"
                          : isSelected
                          ? "bg-graphite text-white"
                          : "text-graphite"
                      )}
                    >
                      {format(day, "d")}
                    </span>

                    {/* Task count indicator */}
                    <div className="h-4 flex items-center justify-center">
                      {dayTasks.length > 0 ? (
                        <div className="flex gap-1 items-center">
                          {dayTasks.slice(0, 3).map((t) => (
                            <span
                              key={t.id}
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                t.status === "completed" ? "bg-muted" : "bg-lime"
                              )}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted/40">•</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Day Task List */}
            <DayTaskList
              selectedDate={selectedDate}
              tasks={selectedDateTasks}
              onTaskClick={onTaskClick}
              onNewTask={() => onNewTask(selectedDate)}
            />
          </motion.div>
        )}

        {viewMode === "agenda" && (
          <motion.div
            key="agenda"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <AgendaView
              tasks={allDatedTasks}
              undatedTasks={undatedTasks}
              onTaskClick={onTaskClick}
              onNewTask={() => onNewTask()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------------------------------------
// Day Tasks List Panel Component
// ----------------------------------------------------------------------------------
interface DayTaskListProps {
  selectedDate: Date;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onNewTask: () => void;
}

function DayTaskList({
  selectedDate,
  tasks,
  onTaskClick,
  onNewTask,
}: DayTaskListProps) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-card">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div>
          <h3 className="font-display font-semibold text-heading text-graphite">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h3>
          <p className="text-body-sm text-muted">
            {tasks.length === 0
              ? "No deadlines scheduled for this day"
              : `${tasks.length} deadline${tasks.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <button
          onClick={onNewTask}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-body-sm font-medium bg-off-white hover:bg-border rounded-xl text-graphite transition-colors active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="py-8 text-center">
          <Clock className="w-8 h-8 text-muted mx-auto mb-2 opacity-40" />
          <p className="text-body-sm text-muted">Enjoy your day! No deadlines due.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className={cn(
                "p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99]",
                task.status === "completed"
                  ? "bg-off-white/40 border-border/60 opacity-60"
                  : "bg-surface border-border hover:border-graphite/40 shadow-sm"
              )}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0",
                    getPriorityDot(task.priority)
                  )}
                />
                <div className="min-w-0">
                  <h4
                    className={cn(
                      "font-medium text-body text-graphite truncate group-hover:text-black",
                      task.status === "completed" && "line-through text-muted"
                    )}
                  >
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-micro text-muted font-medium">
                      {task.subject}
                    </span>
                    <Badge size="sm" className={getTaskTypeColor(task.type)}>
                      {getTaskTypeLabel(task.type)}
                    </Badge>
                    {task.dueTime && (
                      <span className="text-micro text-muted">
                        at {task.dueTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                {task.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-muted" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted group-hover:text-graphite transition-colors" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------------
// Agenda View Component (All Scheduled Tasks Chronologically)
// ----------------------------------------------------------------------------------
interface AgendaViewProps {
  tasks: Task[];
  undatedTasks: Task[];
  onTaskClick: (task: Task) => void;
  onNewTask: () => void;
}

function AgendaView({
  tasks,
  undatedTasks,
  onTaskClick,
  onNewTask,
}: AgendaViewProps) {
  // Group tasks into Overdue, Today, Tomorrow, This Week, and Later
  const groups = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const tomorrowStart = startOfDay(new Date(now.getTime() + 24 * 60 * 60 * 1000));
    const tomorrowEnd = endOfDay(tomorrowStart);
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const overdue: Task[] = [];
    const today: Task[] = [];
    const tomorrow: Task[] = [];
    const thisWeek: Task[] = [];
    const later: Task[] = [];

    tasks.forEach((task) => {
      const d = ensureDate(task.dueDate);
      if (!d) return;

      if (task.status === "pending" && isBefore(d, todayStart)) {
        overdue.push(task);
      } else if (d >= todayStart && d <= todayEnd) {
        today.push(task);
      } else if (d >= tomorrowStart && d <= tomorrowEnd) {
        tomorrow.push(task);
      } else if (d > tomorrowEnd && d <= weekEnd) {
        thisWeek.push(task);
      } else {
        later.push(task);
      }
    });

    return [
      { id: "overdue", title: "Overdue", items: overdue, color: "text-overdue" },
      { id: "today", title: "Due Today", items: today, color: "text-graphite" },
      { id: "tomorrow", title: "Due Tomorrow", items: tomorrow, color: "text-graphite" },
      { id: "thisWeek", title: "Due This Week", items: thisWeek, color: "text-graphite" },
      { id: "later", title: "Upcoming Later", items: later, color: "text-graphite" },
    ].filter((g) => g.items.length > 0);
  }, [tasks]);

  return (
    <div className="space-y-6">
      {groups.length === 0 && undatedTasks.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-12 text-center">
          <CalendarIcon className="w-12 h-12 text-muted mx-auto mb-3 opacity-40" />
          <h3 className="font-display font-semibold text-heading text-graphite mb-1">
            No Scheduled Deadlines
          </h3>
          <p className="text-body-sm text-muted max-w-sm mx-auto mb-6">
            Add tasks with due dates or scan a syllabus to populate your deadlines schedule.
          </p>
          <Button onClick={onNewTask}>
            <Plus className="w-4 h-4" />
            Create Task
          </Button>
        </div>
      ) : (
        <>
          {groups.map((group) => (
            <div key={group.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className={cn("font-display font-bold text-body-lg", group.color)}>
                  {group.title}
                </h3>
                <span className="text-micro font-semibold px-2 py-0.5 rounded-full bg-off-white text-muted">
                  {group.items.length}
                </span>
              </div>

              <div className="space-y-2">
                {group.items.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="p-3.5 bg-surface rounded-xl border border-border hover:border-graphite/40 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-card active:scale-[0.99]"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        className={cn(
                          "w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0",
                          getPriorityDot(task.priority)
                        )}
                      />
                      <div className="min-w-0">
                        <h4
                          className={cn(
                            "font-medium text-body text-graphite truncate",
                            task.status === "completed" && "line-through text-muted"
                          )}
                        >
                          {task.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-micro font-semibold text-graphite">
                            {formatDueDate(task.dueDate)}
                            {task.dueTime && ` • ${task.dueTime}`}
                          </span>
                          <span className="text-micro text-muted">{task.subject}</span>
                          <Badge size="sm" className={getTaskTypeColor(task.type)}>
                            {getTaskTypeLabel(task.type)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-muted flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {undatedTasks.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-body text-muted">
                  Undated Tasks
                </h3>
                <span className="text-micro font-semibold px-2 py-0.5 rounded-full bg-off-white text-muted">
                  {undatedTasks.length}
                </span>
              </div>

              <div className="space-y-2">
                {undatedTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="p-3 bg-off-white/60 rounded-xl border border-border/80 hover:bg-surface transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-body-sm text-graphite truncate">
                        {task.title}
                      </p>
                      <span className="text-micro text-muted">
                        No deadline set • Tap to schedule
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

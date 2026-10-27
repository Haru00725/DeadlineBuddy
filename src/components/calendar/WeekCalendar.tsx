"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  isSameDay,
  addWeeks,
  subWeeks,
} from "date-fns";
import { Task } from "@/lib/types";
import { cn, getTaskTypeColor, getPriorityDot } from "@/lib/utils";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface WeekCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDateClick: (date: Date) => void;
  onNewTask: () => void;
}

export function WeekCalendar({
  tasks,
  onTaskClick,
  onDateClick,
  onNewTask,
}: WeekCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [slideDirection, setSlideDirection] = useState(0);
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const dateKey = format(task.dueDate, "yyyy-MM-dd");
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(task);
    });
    return map;
  }, [tasks]);

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    return tasksByDate.get(format(selectedDate, "yyyy-MM-dd")) || [];
  }, [selectedDate, tasksByDate]);

  const goToPreviousWeek = () => {
    setSlideDirection(-1);
    setCurrentWeek((w) => subWeeks(w, 1));
  };

  const goToNextWeek = () => {
    setSlideDirection(1);
    setCurrentWeek((w) => addWeeks(w, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setSlideDirection(today > currentWeek ? 1 : -1);
    setCurrentWeek(today);
    setSelectedDate(today);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick(date);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="p-2 rounded-lg text-muted hover:text-graphite hover:bg-black/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-display font-semibold text-heading text-graphite min-w-[180px] text-center">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </h2>
          <button
            onClick={goToNextWeek}
            className="p-2 rounded-lg text-muted hover:text-graphite hover:bg-black/5 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button size="sm" onClick={onNewTask}>
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
      </div>

      {isMobile ? (
        <MobileCalendar
          weekDays={weekDays}
          selectedDate={selectedDate}
          tasksByDate={tasksByDate}
          onDateClick={handleDateClick}
          selectedDateTasks={selectedDateTasks}
          onTaskClick={onTaskClick}
          slideDirection={slideDirection}
          reducedMotion={reducedMotion}
        />
      ) : (
        <DesktopCalendar
          weekDays={weekDays}
          selectedDate={selectedDate}
          tasksByDate={tasksByDate}
          onDateClick={handleDateClick}
          onTaskClick={onTaskClick}
          slideDirection={slideDirection}
          reducedMotion={reducedMotion}
        />
      )}
    </div>
  );
}

interface DesktopCalendarProps {
  weekDays: Date[];
  selectedDate: Date | null;
  tasksByDate: Map<string, Task[]>;
  onDateClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
  slideDirection: number;
  reducedMotion: boolean;
}

function DesktopCalendar({
  weekDays,
  selectedDate,
  tasksByDate,
  onDateClick,
  onTaskClick,
  slideDirection,
  reducedMotion,
}: DesktopCalendarProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={weekDays[0].toISOString()}
        initial={
          reducedMotion
            ? { opacity: 1 }
            : { opacity: 0, x: slideDirection * 30 }
        }
        animate={{ opacity: 1, x: 0 }}
        exit={
          reducedMotion
            ? { opacity: 0 }
            : { opacity: 0, x: slideDirection * -30 }
        }
        transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
        className="grid grid-cols-7 gap-2"
      >
        {weekDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayTasks = tasksByDate.get(dateKey) || [];
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const today = isToday(day);

          return (
            <button
              key={dateKey}
              onClick={() => onDateClick(day)}
              className={cn(
                "flex flex-col min-h-[140px] p-3 rounded-xl border transition-all text-left",
                isSelected
                  ? "border-lime bg-lime-muted"
                  : "border-border hover:border-border-strong bg-surface"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    "text-body-sm font-medium",
                    today ? "text-lime" : "text-muted"
                  )}
                >
                  {format(day, "EEE")}
                </span>
                <span
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center font-display font-semibold text-body",
                    today
                      ? "bg-lime text-graphite"
                      : isSelected
                      ? "bg-graphite text-white"
                      : "text-graphite"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>

              <div className="flex-1 space-y-1.5 overflow-hidden">
                {dayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick(task);
                    }}
                    className={cn(
                      "p-2 rounded-lg text-left cursor-pointer transition-colors",
                      task.status === "completed"
                        ? "bg-off-white/50 opacity-60"
                        : "bg-off-white hover:bg-border"
                    )}
                  >
                    <p
                      className={cn(
                        "text-micro font-medium text-graphite truncate",
                        task.status === "completed" && "line-through"
                      )}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          getPriorityDot(task.priority)
                        )}
                      />
                      <span className="text-[10px] text-muted truncate">
                        {task.subject}
                      </span>
                    </div>
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <p className="text-micro text-muted pl-2">
                    +{dayTasks.length - 3} more
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}

interface MobileCalendarProps {
  weekDays: Date[];
  selectedDate: Date | null;
  tasksByDate: Map<string, Task[]>;
  onDateClick: (date: Date) => void;
  selectedDateTasks: Task[];
  onTaskClick: (task: Task) => void;
  slideDirection: number;
  reducedMotion: boolean;
}

function MobileCalendar({
  weekDays,
  selectedDate,
  tasksByDate,
  onDateClick,
  selectedDateTasks,
  onTaskClick,
  slideDirection,
  reducedMotion,
}: MobileCalendarProps) {
  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={weekDays[0].toISOString()}
          initial={
            reducedMotion
              ? { opacity: 1 }
              : { opacity: 0, x: slideDirection * 20 }
          }
          animate={{ opacity: 1, x: 0 }}
          exit={
            reducedMotion
              ? { opacity: 0 }
              : { opacity: 0, x: slideDirection * -20 }
          }
          transition={reducedMotion ? { duration: 0 } : { duration: 0.15 }}
          className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4"
        >
          {weekDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDate.get(dateKey) || [];
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const today = isToday(day);

            return (
              <button
                key={dateKey}
                onClick={() => onDateClick(day)}
                className={cn(
                  "flex flex-col items-center min-w-[48px] py-2 px-3 rounded-xl transition-all",
                  isSelected
                    ? "bg-lime"
                    : today
                    ? "bg-lime-muted"
                    : "bg-surface border border-border"
                )}
              >
                <span
                  className={cn(
                    "text-micro font-medium",
                    isSelected ? "text-graphite" : "text-muted"
                  )}
                >
                  {format(day, "EEE")}
                </span>
                <span
                  className={cn(
                    "font-display font-semibold text-body-lg mt-0.5",
                    isSelected || today ? "text-graphite" : "text-graphite"
                  )}
                >
                  {format(day, "d")}
                </span>
                {dayTasks.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {dayTasks.slice(0, 3).map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "w-1 h-1 rounded-full",
                          isSelected ? "bg-graphite/50" : "bg-lime"
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="bg-surface rounded-xl border border-border p-4">
        <h3 className="font-display font-semibold text-body text-graphite mb-3">
          {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a date"}
        </h3>

        {selectedDateTasks.length === 0 ? (
          <p className="text-body-sm text-muted py-4 text-center">
            No tasks for this day
          </p>
        ) : (
          <div className="space-y-2">
            {selectedDateTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="w-full p-3 rounded-lg bg-off-white hover:bg-border transition-colors text-left"
              >
                <p
                  className={cn(
                    "font-medium text-body text-graphite",
                    task.status === "completed" && "line-through text-muted"
                  )}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-body-sm text-muted">{task.subject}</span>
                  <Badge size="sm" className={getTaskTypeColor(task.type)}>
                    {task.type}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  ScanLine,
  Settings,
  Plus,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ProgressRing } from "../ui/ProgressRing";
import { useTaskStore } from "@/lib/store";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/" },
  { id: "tasks", label: "My Tasks", icon: CheckSquare, href: "/tasks" },
  { id: "calendar", label: "Calendar", icon: Calendar, href: "/calendar" },
  { id: "scan", label: "Scan Notice", icon: ScanLine, href: "/scan" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

interface SidebarProps {
  onNewTask: () => void;
}

export function Sidebar({ onNewTask }: SidebarProps) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const { getStats } = useTaskStore();
  const stats = getStats();

  return (
    <motion.aside
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
      className="fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border flex flex-col z-40"
    >
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-lime flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-graphite" />
          </div>
          <span className="font-display font-semibold text-graphite text-lg tracking-tight">
            DeadlineBuddy
          </span>
        </Link>
      </div>

      <div className="px-4 mb-4">
        <motion.button
          onClick={onNewTask}
          className="w-full flex items-center justify-center gap-2 h-11 bg-lime text-graphite rounded-xl font-medium text-body hover:bg-lime-hover transition-colors"
          whileTap={reducedMotion ? undefined : { scale: 0.98 }}
        >
          <Plus className="w-4.5 h-4.5" />
          New Task
        </motion.button>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-body font-medium transition-colors",
                    isActive
                      ? "text-graphite"
                      : "text-muted hover:text-graphite hover:bg-black/[0.03]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-lime-muted rounded-xl"
                      transition={
                        reducedMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 400, damping: 30 }
                      }
                    />
                  )}
                  <Icon
                    className={cn(
                      "relative z-10 w-5 h-5",
                      isActive ? "text-graphite" : "text-muted"
                    )}
                  />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-4 bg-off-white rounded-xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ProgressRing
                progress={stats.weeklyProgress}
                size={48}
                strokeWidth={4}
                showLabel={false}
              />
              <span className="absolute inset-0 flex items-center justify-center font-display font-semibold text-micro text-graphite">
                {stats.weeklyProgress}%
              </span>
            </div>
            <div>
              <p className="text-body-sm font-medium text-graphite">This Week</p>
              <p className="text-micro text-muted">
                {stats.completed} completed
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 px-1 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-graphite/10 flex items-center justify-center">
            <span className="text-micro font-medium text-graphite">S</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-sm font-medium text-graphite truncate">Student</p>
            <p className="text-micro text-muted truncate">Local account</p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

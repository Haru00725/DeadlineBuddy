"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  ScanLine,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const navItems = [
  { id: "overview", label: "Home", icon: LayoutDashboard, href: "/" },
  { id: "tasks", label: "Tasks", icon: CheckSquare, href: "/tasks" },
  { id: "scan", label: "Scan", icon: ScanLine, href: "/scan" },
  { id: "calendar", label: "Calendar", icon: Calendar, href: "/calendar" },
];

interface MobileNavProps {
  onNewTask: () => void;
}

export function MobileNav({ onNewTask }: MobileNavProps) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  return (
    <motion.nav
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 pb-safe"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors",
                isActive ? "text-graphite" : "text-muted"
              )}
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveNav"
                    className="absolute -inset-2 bg-lime-muted rounded-xl"
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 400, damping: 30 }
                    }
                  />
                )}
                <Icon className="relative z-10 w-5 h-5" />
              </div>
              <span className="relative z-10 text-micro font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}

        <button
          onClick={onNewTask}
          className="flex items-center justify-center w-14 h-14 -mt-6 bg-lime rounded-2xl shadow-elevated"
        >
          <Plus className="w-6 h-6 text-graphite" />
        </button>

        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors",
                isActive ? "text-graphite" : "text-muted"
              )}
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveNav"
                    className="absolute -inset-2 bg-lime-muted rounded-xl"
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 400, damping: 30 }
                    }
                  />
                )}
                <Icon className="relative z-10 w-5 h-5" />
              </div>
              <span className="relative z-10 text-micro font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}

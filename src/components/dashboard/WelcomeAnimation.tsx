"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle2, Star } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function WelcomeAnimation() {
  const reducedMotion = useReducedMotion();

  const cards = [
    { icon: Calendar, label: "Oct 28", color: "bg-blue-100 text-blue-600" },
    { icon: Clock, label: "Due Soon", color: "bg-amber-100 text-amber-600" },
    { icon: CheckCircle2, label: "Done!", color: "bg-lime text-graphite" },
  ];

  if (reducedMotion) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <div className="flex items-center gap-3">
            {cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="w-20 h-24 bg-surface rounded-xl border border-border shadow-card flex flex-col items-center justify-center gap-2"
                >
                  <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-micro font-medium text-graphite">{card.label}</span>
                </div>
              );
            })}
          </div>
          <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-lime flex items-center justify-center">
            <Star className="w-4 h-4 text-graphite" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <motion.div className="flex items-center gap-3">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, rotate: -5 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.15,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                className="w-20 h-24 bg-surface rounded-xl border border-border shadow-card flex flex-col items-center justify-center gap-2"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-micro font-medium text-graphite">
                  {card.label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            delay: 0.6,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-lime flex items-center justify-center shadow-card"
        >
          <Star className="w-4 h-4 text-graphite" />
        </motion.div>
      </div>
    </div>
  );
}

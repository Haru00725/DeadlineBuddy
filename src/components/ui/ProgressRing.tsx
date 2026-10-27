"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  showLabel = true,
  className,
}: ProgressRingProps) {
  const [mounted, setMounted] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-border"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className="text-lime"
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: mounted ? offset : circumference,
          }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 0.8, ease: "easeOut", delay: 0.3 }
          }
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {showLabel && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <span className="font-display font-semibold text-graphite text-body-lg">
            {progress}%
          </span>
        </div>
      )}
    </div>
  );
}

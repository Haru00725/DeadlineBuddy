"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    if (isInView && !hasAnimated) {
      if (reducedMotion) {
        spring.set(value);
      } else {
        spring.set(value);
      }
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated, reducedMotion, spring, value]);

  useEffect(() => {
    if (hasAnimated) {
      spring.set(value);
    }
  }, [value, hasAnimated, spring]);

  if (reducedMotion) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}

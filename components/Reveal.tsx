"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function Reveal({
  children,
  delay = 0,
  as = "div",
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  as?: "div" | "section";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  const MotionTag = as === "section" ? motion.section : motion.div;

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
    >
      {children}
    </MotionTag>
  );
}

"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

type MotionWrapperProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function MotionWrapper({
  children,
  className,
  delay = 0,
}: MotionWrapperProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

type MotionHoverProps = {
  children: ReactNode;
  className?: string;
};

export function MotionHover({ children, className }: MotionHoverProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}

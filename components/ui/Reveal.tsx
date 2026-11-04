'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}

/**
 * Scroll-triggered reveal — SAFE BY DEFAULT.
 * The server and the first client render output a plain, fully visible <div>
 * (no inline opacity:0 in the HTML). Only after mount — and only when
 * IntersectionObserver exists and reduced motion is off — does it switch to
 * the animated variant. If JS or the animation fails, content stays visible.
 */
export default function Reveal({ children, delay = 0, y = 26, className, once = true }: RevealProps) {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    setEnabled(true);
  }, []);

  if (reduced || !enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.65, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

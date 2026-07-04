"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Elegant first-load splash: the Réserve wordmark rises, a thin gold rule draws
 * beneath it, then the whole panel wipes up to reveal the app. Shown once per
 * full page load; skipped entirely under reduced-motion.
 */
export function SplashScreen() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (reduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(false);
      return;
    }
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => setShow(false), 2000);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [reduce]);

  return (
    <AnimatePresence onExitComplete={() => (document.body.style.overflow = "")}>
      {show && (
        <motion.div
          key="splash"
          className="rz fixed inset-0 z-[200] flex items-center justify-center bg-ink"
          initial={{ opacity: 1 }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          style={{ willChange: "clip-path" }}
        >
          <div className="flex flex-col items-center">
            <div className="overflow-hidden">
              <motion.span
                className="rz-serif block text-5xl font-bold tracking-tight text-paper sm:text-6xl"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
              >
                Réserve
              </motion.span>
            </div>
            <motion.span
              className="rz-mono mt-2.5 text-[10px] uppercase tracking-[0.42em] text-paper/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
            >
              Concierge
            </motion.span>
            <motion.div
              className="mt-6 h-px"
              style={{ background: "var(--accent)" }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 132, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.75, ease: [0.22, 0.61, 0.36, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

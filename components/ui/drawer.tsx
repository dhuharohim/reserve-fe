"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { DURATION, EASE } from "@/lib/motion";
import { Ms } from "@/components/icon";

/** Slide-in panel with scrim. Locks scroll + closes on Escape / scrim click. */
export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  title?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const offscreen = side === "right" ? "100%" : "-100%";

  return (
    <AnimatePresence>
      {open && (
        <div className="rz fixed inset-0 z-[125]">
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.normal }}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: offscreen }}
            animate={{ x: 0 }}
            exit={{ x: offscreen }}
            transition={{ duration: DURATION.medium, ease: EASE.out }}
            className={cn(
              "absolute top-0 flex h-full w-[86%] max-w-sm flex-col bg-surface shadow-[0_0_60px_-10px_rgba(30,20,10,0.4)]",
              side === "right" ? "right-0" : "left-0",
            )}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="rz-serif text-xl font-semibold">{title}</span>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-panel hover:text-ink"
              >
                <Ms name="close" style={{ fontSize: 22 }} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

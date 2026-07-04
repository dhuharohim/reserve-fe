"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { DURATION, EASE } from "@/lib/motion";
import { Ms } from "@/components/icon";

export interface AccordionEntry {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

/** Height-animated accordion. Single-open by default; set allowMultiple to stack. */
export function Accordion({
  items,
  defaultOpen,
  allowMultiple = false,
  className,
}: {
  items: AccordionEntry[];
  defaultOpen?: string;
  allowMultiple?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState<string[]>(defaultOpen ? [defaultOpen] : []);

  function toggle(id: string) {
    setOpen((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : allowMultiple
          ? [...current, id]
          : [id],
    );
  }

  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <div key={item.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggle(item.id)}
              className="flex w-full items-center justify-between gap-3 py-4 text-left"
            >
              <span className="rz-serif text-lg font-semibold text-ink">{item.title}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: DURATION.normal, ease: EASE.out }}
                className={cn("text-muted", isOpen && "text-accent-deep")}
              >
                <Ms name="expand_more" style={{ fontSize: 22 }} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: DURATION.medium, ease: EASE.out }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 text-[14px] leading-relaxed text-muted">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

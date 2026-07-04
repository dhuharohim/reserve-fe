"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Category } from "@/lib/types";
import { Ms } from "@/components/icon";

/**
 * Categories mega-menu — opens on hover or click, expands into an aesthetic
 * card of categories with a staggered entrance. Closes on route change / Escape.
 */
export function CategoriesMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  // Close the menu whenever the route changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function openNow() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function closeSoon() {
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  }

  const active = pathname.startsWith("/c/");

  return (
    <div className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[13.5px] transition-colors ${
          active || open ? "font-semibold text-white" : "text-muted hover:text-ink"
        }`}
        style={active || open ? { background: "var(--accent-deep)" } : undefined}
      >
        Categories
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex">
          <Ms name="expand_more" style={{ fontSize: 18 }} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            style={{ transformOrigin: "top left" }}
            className="absolute left-0 top-[calc(100%+10px)] z-50 w-[min(92vw,560px)] overflow-hidden rounded-[var(--r)] border border-line bg-surface p-2 shadow-[0_30px_70px_-30px_rgba(30,20,10,0.55)]"
          >
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {categories.map((category, i) => (
                <motion.div
                  key={category.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
                >
                  <Link
                    href={`/c/${category.key}`}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 rounded-[var(--r-sm)] p-2.5 transition-colors hover:bg-panel"
                  >
                    <span
                      className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] transition-transform group-hover:-rotate-6"
                      style={{
                        background: "var(--accent-tint)",
                        color: category.color ?? "var(--accent-deep)",
                      }}
                    >
                      {category.icon && <Ms name={category.icon} style={{ fontSize: 20 }} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold text-ink">{category.label}</span>
                      <span className="block truncate text-[12px] text-muted">{category.tagline}</span>
                    </span>
                    <Ms
                      name="arrow_forward"
                      style={{ fontSize: 17 }}
                      className="flex-none -translate-x-1 text-accent-deep opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </Link>
                </motion.div>
              ))}
            </div>

            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-center gap-1.5 rounded-[var(--r-sm)] border-t border-line py-2.5 text-[12.5px] font-medium text-accent-deep"
            >
              Browse everything <Ms name="arrow_forward" style={{ fontSize: 15 }} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { DURATION, EASE } from "@/lib/motion";
import { Ms } from "@/components/icon";

type Tone = "info" | "success" | "error";

interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: Tone;
}

const ToastContext = createContext<{
  show: (toast: { title: string; description?: string; tone?: Tone }) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const ICON: Record<Tone, string> = {
  info: "info",
  success: "check_circle",
  error: "error",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const show = useCallback(
    ({ title, description, tone = "info" }: { title: string; description?: string; tone?: Tone }) => {
      const id = idRef.current++;
      setToasts((prev) => [...prev, { id, title, description, tone }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        aria-live="polite"
        className="rz pointer-events-none fixed inset-x-0 top-4 z-[130] flex flex-col items-center gap-2 px-4"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: DURATION.normal, ease: EASE.out }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[var(--r-sm)] border border-line bg-surface p-3.5 shadow-[0_20px_44px_-24px_rgba(60,45,30,0.5)]"
            >
              <Ms
                name={ICON[toast.tone]}
                fill={toast.tone !== "info"}
                style={{
                  fontSize: 20,
                  color: toast.tone === "error" ? "var(--danger)" : "var(--accent-deep)",
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold text-ink">{toast.title}</div>
                {toast.description && (
                  <div className="text-[12.5px] text-muted">{toast.description}</div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

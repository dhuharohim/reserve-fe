import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full appearance-none rounded-[var(--r-sm)] border border-input bg-[var(--field-bg)] px-3 text-[14.5px] text-ink outline-none",
        "transition-[border-color,box-shadow] duration-[var(--dur-fast)] placeholder:text-muted",
        "focus-visible:border-accent focus-visible:shadow-[var(--field-glow)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "[&::-webkit-calendar-picker-indicator]:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

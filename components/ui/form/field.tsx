"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Ms } from "@/components/icon";

/**
 * Shared control base — every form primitive uses these tokens so sizing,
 * radius, typography, focus ring, disabled + validation states are identical.
 */
export function controlClass(opts?: {
  error?: boolean;
  success?: boolean;
  className?: string;
}): string {
  return cn(
    "flex h-11 w-full appearance-none items-center rounded-[var(--r-sm)] border bg-[var(--field-bg)] px-3 text-[14.5px] text-ink outline-none",
    "transition-[border-color,box-shadow] duration-[var(--dur-fast)] placeholder:text-muted",
    "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    opts?.error
      ? "border-danger focus-visible:border-danger focus-visible:shadow-[var(--field-glow-danger)] focus-within:border-danger focus-within:shadow-[var(--field-glow-danger)]"
      : opts?.success
        ? "border-accent focus-visible:border-accent focus-visible:shadow-[var(--field-glow)]"
        : "border-input focus-visible:border-accent focus-visible:shadow-[var(--field-glow)] focus-within:border-accent focus-within:shadow-[var(--field-glow)]",
    opts?.className,
  );
}

export function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="rz-mono mb-2 block text-[10px] uppercase tracking-[0.16em] text-muted"
    >
      {children}
      {required ? (
        <span className="ml-0.5 text-danger">*</span>
      ) : (
        <span className="ml-1 tracking-normal normal-case text-muted/70"> optional</span>
      )}
    </label>
  );
}

/** Animated helper / error / success line — never a bare red border alone. */
export function FieldMessage({
  error,
  success,
  hint,
}: {
  error?: string;
  success?: string;
  hint?: string;
}) {
  if (error) {
    return (
      <p
        key={error}
        role="alert"
        className="rz-field-msg mt-1.5 flex items-center gap-1.5 text-[12.5px] text-danger"
      >
        <Ms name="error" style={{ fontSize: 15 }} />
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p className="rz-field-msg mt-1.5 flex items-center gap-1.5 text-[12.5px]" style={{ color: "var(--accent-deep)" }}>
        <Ms name="check_circle" fill style={{ fontSize: 15 }} />
        {success}
      </p>
    );
  }
  if (hint) {
    return <p className="mt-1.5 text-[12.5px] leading-snug text-muted">{hint}</p>;
  }
  return null;
}

/** The wrapper every primitive composes: label + control + validation line. */
export function Field({
  id,
  label,
  required,
  error,
  success,
  hint,
  className,
  children,
}: {
  id?: string;
  label?: string;
  required?: boolean;
  error?: string;
  success?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("w-full", error && "rz-shake", className)}>
      {label && (
        <FieldLabel htmlFor={id} required={required}>
          {label}
        </FieldLabel>
      )}
      {children}
      <FieldMessage error={error} success={success} hint={hint} />
    </div>
  );
}

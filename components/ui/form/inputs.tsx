"use client";

import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Ms } from "@/components/icon";
import { Field } from "./field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ---- shared shell (focus-within so adornments live inside the border) ---- */

function shellClass(opts: { error?: boolean; disabled?: boolean; className?: string }) {
  return cn(
    "flex h-11 w-full items-center gap-2 rounded-[var(--r-sm)] border bg-[var(--field-bg)] px-3",
    "transition-[border-color,box-shadow] duration-[var(--dur-fast)]",
    opts.error
      ? "border-danger focus-within:border-danger focus-within:shadow-[var(--field-glow-danger)]"
      : "border-input focus-within:border-accent focus-within:shadow-[var(--field-glow)]",
    opts.disabled && "pointer-events-none opacity-50",
    opts.className,
  );
}

const bareInput =
  "min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-[14.5px] text-ink outline-none placeholder:text-muted [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-search-cancel-button]:hidden";

function Spinner() {
  return <Ms name="progress_activity" className="animate-spin text-muted" style={{ fontSize: 18 }} />;
}

interface BaseProps {
  label?: string;
  required?: boolean;
  error?: string;
  success?: string;
  hint?: string;
  loading?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  wrapperClassName?: string;
}

type InputProps = BaseProps &
  Omit<ComponentProps<"input">, "size" | "children">;

/* ---- text / email / number share one core ---- */

function TextField({
  label,
  required,
  error,
  success,
  hint,
  loading,
  leading,
  trailing,
  wrapperClassName,
  id,
  disabled,
  ...props
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Field id={inputId} label={label} required={required} error={error} success={success} hint={hint}>
      <div className={shellClass({ error: Boolean(error), disabled: Boolean(disabled), className: wrapperClassName })}>
        {leading}
        <input id={inputId} className={bareInput} disabled={disabled} aria-invalid={Boolean(error)} {...props} />
        {loading ? <Spinner /> : trailing}
        {success && !loading && !trailing && (
          <Ms name="check_circle" fill style={{ fontSize: 18, color: "var(--accent-deep)" }} />
        )}
      </div>
    </Field>
  );
}

export function TextInput(props: InputProps) {
  return <TextField type="text" {...props} />;
}

export function EmailInput(props: InputProps) {
  return (
    <TextField
      type="email"
      autoComplete="email"
      inputMode="email"
      leading={<Ms name="mail" style={{ fontSize: 18 }} className="text-muted" />}
      {...props}
    />
  );
}

export function PasswordInput(props: InputProps) {
  const [show, setShow] = useState(false);
  return (
    <TextField
      type={show ? "text" : "password"}
      autoComplete="current-password"
      leading={<Ms name="lock" style={{ fontSize: 18 }} className="text-muted" />}
      trailing={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-muted transition-colors hover:text-ink"
        >
          <Ms name={show ? "visibility_off" : "visibility"} style={{ fontSize: 18 }} />
        </button>
      }
      {...props}
    />
  );
}

export function NumberInput({
  value,
  min,
  max,
  step = 1,
  onValueChange,
  ...props
}: BaseProps & {
  value?: number | string;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
} & Omit<ComponentProps<"input">, "value" | "onChange" | "size">) {
  const num = typeof value === "string" ? Number(value) : (value ?? 0);
  const clamp = (n: number) =>
    Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  return (
    <TextField
      type="number"
      inputMode="numeric"
      value={value ?? ""}
      onChange={(e) => onValueChange?.(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      trailing={
        <span className="flex flex-col">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Increase"
            onClick={() => onValueChange?.(clamp(num + step))}
            className="-my-0.5 flex h-4 items-center text-muted hover:text-ink"
          >
            <Ms name="expand_less" style={{ fontSize: 17 }} />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Decrease"
            onClick={() => onValueChange?.(clamp(num - step))}
            className="-my-0.5 flex h-4 items-center text-muted hover:text-ink"
          >
            <Ms name="expand_more" style={{ fontSize: 17 }} />
          </button>
        </span>
      }
      {...props}
    />
  );
}

export function CurrencyInput({
  currency = "$",
  ...props
}: InputProps & { currency?: string }) {
  return (
    <TextField
      type="text"
      inputMode="decimal"
      leading={<span className="text-[14.5px] text-muted">{currency}</span>}
      {...props}
    />
  );
}

const DIAL_CODES = ["+1", "+44", "+62", "+65", "+61", "+81", "+49", "+33"];

export function PhoneInput({
  dialCode = "+1",
  onDialCodeChange,
  ...props
}: InputProps & { dialCode?: string; onDialCodeChange?: (code: string) => void }) {
  return (
    <TextField
      type="tel"
      autoComplete="tel"
      inputMode="tel"
      leading={
        <Select value={dialCode} onValueChange={(v) => onDialCodeChange?.(v)}>
          <SelectTrigger className="h-8 w-[74px] shrink-0 border-0 bg-transparent px-1.5 focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIAL_CODES.map((code) => (
              <SelectItem key={code} value={code}>
                {code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
      placeholder="Phone number"
      {...props}
    />
  );
}

export function Textarea({
  label,
  required,
  error,
  success,
  hint,
  id,
  rows = 4,
  className,
  ...props
}: BaseProps & Omit<ComponentProps<"textarea">, "size">) {
  const autoId = useId();
  const areaId = id ?? autoId;
  return (
    <Field id={areaId} label={label} required={required} error={error} success={success} hint={hint}>
      <textarea
        id={areaId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full resize-y rounded-[var(--r-sm)] border bg-[var(--field-bg)] px-3 py-2.5 text-[14.5px] leading-relaxed text-ink outline-none",
          "transition-[border-color,box-shadow] duration-[var(--dur-fast)] placeholder:text-muted disabled:opacity-50",
          error
            ? "border-danger focus-visible:border-danger focus-visible:shadow-[var(--field-glow-danger)]"
            : "border-input focus-visible:border-accent focus-visible:shadow-[var(--field-glow)]",
          className,
        )}
        {...props}
      />
    </Field>
  );
}

"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";
import { Ms } from "@/components/icon";

/* ---- Checkbox ---- */

export function Checkbox({
  label,
  className,
  id,
  ...props
}: React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & { label?: React.ReactNode }) {
  const autoId = React.useId();
  const boxId = id ?? autoId;
  return (
    <div className="inline-flex items-center gap-2.5">
      <CheckboxPrimitive.Root
        id={boxId}
        className={cn(
          "flex h-[18px] w-[18px] items-center justify-center rounded-[6px] border border-input bg-surface outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-accent/25 disabled:opacity-50",
          "data-[state=checked]:border-transparent data-[state=checked]:bg-[var(--accent-deep)]",
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator>
          <Ms name="check" style={{ fontSize: 15, color: "#fff" }} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label htmlFor={boxId} className="cursor-pointer text-[14px] text-ink">
          {label}
        </label>
      )}
    </div>
  );
}

/* ---- Radio group ---- */

export const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn("flex flex-col gap-2.5", className)} {...props} />
));
RadioGroup.displayName = "RadioGroup";

export function RadioItem({
  value,
  label,
  id,
}: {
  value: string;
  label: React.ReactNode;
  id?: string;
}) {
  const autoId = React.useId();
  const radioId = id ?? autoId;
  return (
    <div className="inline-flex items-center gap-2.5">
      <RadioGroupPrimitive.Item
        id={radioId}
        value={value}
        className={cn(
          "flex h-[18px] w-[18px] items-center justify-center rounded-full border border-input bg-surface outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-accent/25 disabled:opacity-50",
          "data-[state=checked]:border-[var(--accent-deep)]",
        )}
      >
        <RadioGroupPrimitive.Indicator className="h-2.5 w-2.5 rounded-full bg-[var(--accent-deep)]" />
      </RadioGroupPrimitive.Item>
      <label htmlFor={radioId} className="cursor-pointer text-[14px] text-ink">
        {label}
      </label>
    </div>
  );
}

/* ---- Switch (a.k.a. Toggle switch) ---- */

export function Switch({
  label,
  className,
  id,
  ...props
}: React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> & { label?: React.ReactNode }) {
  const autoId = React.useId();
  const switchId = id ?? autoId;
  return (
    <div className="inline-flex items-center gap-2.5">
      <SwitchPrimitive.Root
        id={switchId}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border border-input bg-panel outline-none transition-colors duration-[var(--dur-normal)]",
          "focus-visible:ring-2 focus-visible:ring-accent/25 disabled:opacity-50",
          "data-[state=checked]:border-transparent data-[state=checked]:bg-[var(--accent-deep)]",
          className,
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb className="block h-[18px] w-[18px] translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-[var(--dur-normal)] data-[state=checked]:translate-x-[22px]" />
      </SwitchPrimitive.Root>
      {label && (
        <label htmlFor={switchId} className="cursor-pointer text-[14px] text-ink">
          {label}
        </label>
      )}
    </div>
  );
}

/* ---- Toggle (pressable pill) ---- */

export function Toggle({
  pressed,
  onPressedChange,
  className,
  children,
}: {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] transition-colors duration-[var(--dur-fast)]",
        pressed
          ? "border-accent bg-[var(--accent-tint)] font-semibold text-[var(--accent-deep)]"
          : "border-input text-muted hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

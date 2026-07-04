"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Ms } from "@/components/icon";
import { formatDate } from "@/lib/format";
import { Field, controlClass } from "./field";
import { Calendar, type DateRange } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function triggerClass(error?: boolean) {
  return cn(controlClass({ error }), "cursor-pointer justify-between gap-2 text-left");
}

export function DatePicker({
  label,
  required,
  error,
  hint,
  value,
  onChange,
  placeholder = "Select a date",
  minDate,
}: {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value?: string | null;
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Field label={label} required={required} error={error} hint={hint}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={triggerClass(Boolean(error))}>
            <span className="flex items-center gap-2">
              <Ms name="calendar_today" style={{ fontSize: 17 }} className="text-muted" />
              <span className={value ? "text-ink" : "text-muted"}>
                {value ? formatDate(value) : placeholder}
              </span>
            </span>
            <Ms name="expand_more" style={{ fontSize: 18 }} className="text-muted" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="rz-pop-anim w-auto border-0 p-0">
          <Calendar
            mode="single"
            selected={value}
            minDate={minDate}
            onSelect={(d) => {
              onChange(d);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}

export function DateRangePicker({
  label,
  required,
  error,
  hint,
  value,
  onChange,
  placeholder = "Add dates",
  minDate,
}: {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value?: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  minDate?: string;
}) {
  const [open, setOpen] = useState(false);
  const range = value ?? { from: null, to: null };
  const display =
    range.from && range.to
      ? `${formatDate(range.from)} → ${formatDate(range.to)}`
      : range.from
        ? `${formatDate(range.from)} → …`
        : placeholder;

  return (
    <Field label={label} required={required} error={error} hint={hint}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={triggerClass(Boolean(error))}>
            <span className="flex items-center gap-2">
              <Ms name="date_range" style={{ fontSize: 17 }} className="text-muted" />
              <span className={range.from ? "text-ink" : "text-muted"}>{display}</span>
            </span>
            <Ms name="expand_more" style={{ fontSize: 18 }} className="text-muted" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="rz-pop-anim w-auto border-0 p-0">
          <Calendar
            mode="range"
            range={range}
            minDate={minDate}
            onRangeChange={(r) => {
              onChange(r);
              if (r.from && r.to) setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}

function halfHours(): string[] {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
}

export function TimePicker({
  label,
  required,
  error,
  hint,
  value,
  onChange,
  options,
  placeholder = "Select a time",
}: {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value?: string;
  onChange: (time: string) => void;
  options?: string[];
  placeholder?: string;
}) {
  const times = options ?? halfHours();
  return (
    <Field label={label} required={required} error={error} hint={hint}>
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-danger focus:ring-danger/25" : undefined}>
          <span className="flex items-center gap-2">
            <Ms name="schedule" style={{ fontSize: 17 }} className="text-muted" />
            <SelectValue placeholder={placeholder} />
          </span>
        </SelectTrigger>
        <SelectContent>
          {times.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

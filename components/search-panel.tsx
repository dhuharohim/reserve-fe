"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Category, ReservationType, SearchFilter } from "@/lib/types";
import { Ms } from "@/components/icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiCombobox, type ComboOption } from "@/components/ui/combobox";
import {
  DatePicker,
  DateRangePicker,
  TimePicker,
} from "@/components/ui/form/date-picker";
import { LineArt } from "@/components/line-art";

type Values = Record<string, string>;

/**
 * Airbnb-style discovery: a search bar, category filter, and the selected
 * category's component-driven search filters (rendered from the API config).
 */
export function SearchPanel({
  types,
  categories,
}: {
  types: ReservationType[];
  categories: Category[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [values, setValues] = useState<Values>({});

  // Representative type for the chosen category drives the filter set.
  const activeType = useMemo(
    () => types.find((t) => t.category?.key === category) ?? null,
    [types, category],
  );
  const filters = activeType?.search_filters ?? [];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return types
      .filter((type) => {
        const inCategory = !category || type.category?.key === category;
        return (
          inCategory &&
          (type.name.toLowerCase().includes(q) ||
            (type.subtitle ?? "").toLowerCase().includes(q) ||
            (type.category?.label ?? "").toLowerCase().includes(q))
        );
      })
      .slice(0, 6);
  }, [types, query, category]);

  function setValue(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function submit() {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([k, v]) => v && params.set(k, v));
    const qs = params.toString();
    if (category) {
      router.push(`/c/${category}${qs ? `?${qs}` : ""}`);
    } else if (results[0]) {
      router.push(`/reservations/${results[0].slug}`);
    } else if (categories[0]) {
      router.push(`/c/${categories[0].key}`);
    }
  }

  return (
    <div className="w-full">
      {/* search bar */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-full bg-surface p-2 pl-5 shadow-[0_28px_70px_-26px_rgba(15,10,5,0.8)] ring-1 ring-black/[0.06]">
          <Ms name="search" style={{ fontSize: 22, color: "var(--accent-deep)" }} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Search stays, tables, treatments, events…"
            className="h-11 min-w-0 flex-1 appearance-none border-0 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
            aria-label="Search reservations"
          />
          <motion.button
            type="button"
            onClick={submit}
            aria-label="Search"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="flex h-12 w-12 flex-none items-center justify-center rounded-full text-white"
            style={{ background: "var(--accent-deep)" }}
          >
            <Ms name="arrow_forward" style={{ fontSize: 22 }} />
          </motion.button>
        </div>

        {/* live results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-x-2 top-[calc(100%+12px)] z-30 overflow-hidden rounded-[var(--r)] border border-line bg-surface text-left shadow-[0_30px_60px_-24px_rgba(20,14,8,0.55)]"
            >
              {results.map((type) => (
                <Link
                  key={type.id}
                  href={`/reservations/${type.slug}`}
                  className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0 hover:bg-panel"
                >
                  <span
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px]"
                    style={{ background: "var(--accent-tint)", color: type.color ?? "var(--accent-deep)" }}
                  >
                    {type.icon && <Ms name={type.icon} style={{ fontSize: 18 }} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold">{type.name}</div>
                    <div className="truncate text-[12px] text-muted">
                      {type.category?.label} · {type.subtitle}
                    </div>
                  </div>
                  <span className="rz-mono flex-none text-[12px] text-accent-deep">
                    {type.price_display}
                  </span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* category chips — glass on the hero */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Chip active={category === null} onClick={() => { setCategory(null); setValues({}); }}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip
            key={c.key}
            active={category === c.key}
            onClick={() => {
              setCategory(category === c.key ? null : c.key);
              setValues({});
            }}
          >
            {c.icon && <Ms name={c.icon} style={{ fontSize: 16 }} />}
            {c.label}
          </Chip>
        ))}
      </div>

      {/* dynamic component-driven filters */}
      <AnimatePresence initial={false}>
        {filters.length > 0 && (
          <motion.div
            key={category}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="relative mt-3 overflow-hidden rounded-[var(--r)] border border-[var(--panel-border)] bg-surface p-4 text-left shadow-[0_24px_50px_-30px_rgba(60,45,30,0.4)]">
              <LineArt opacity={0.5} />
              <div className="rz-mono mb-3 text-[10px] uppercase tracking-[0.16em] text-muted">
                Refine {activeType?.category?.label ?? "search"}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filters.map((filter) => (
                  <FilterField
                    key={filter.key}
                    filter={filter}
                    value={values[filter.key] ?? ""}
                    onChange={(v) => setValue(filter.key, v)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---- component registry: renders a filter by its `component` ---- */

function FilterField({
  filter,
  value,
  onChange,
}: {
  filter: SearchFilter;
  value: string;
  onChange: (value: string) => void;
}) {
  const options = optionList(filter.settings.options);
  const max = num(filter.settings.max, 20);
  const min = num(filter.settings.min, 1);
  const multiple = filter.settings.multiple === true;
  const icon = COMPONENT_ICON[filter.component] ?? "tune";

  const label = (
    <span className="rz-mono flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-muted">
      <Ms name={icon} style={{ fontSize: 14, color: "var(--accent-deep)" }} />
      {filter.label}
    </span>
  );

  function control() {
    // "Combobox if it's multiple" — a multi-select over the options.
    if (multiple && options.length > 0) {
      return (
        <MultiCombobox
          options={options as ComboOption[]}
          value={value ? value.split(",") : []}
          onChange={(arr) => onChange(arr.join(","))}
          placeholder={filter.placeholder ?? "Select…"}
        />
      );
    }

    switch (filter.component) {
      case "date_picker":
        return (
          <DatePicker
            value={value || null}
            onChange={onChange}
            placeholder={filter.placeholder ?? "Any day"}
          />
        );

      case "date_range":
        return (
          <DateRangePicker
            value={{ from: value.split("|")[0] || null, to: value.split("|")[1] || null }}
            onChange={(r) => onChange(`${r.from ?? ""}|${r.to ?? ""}`)}
            placeholder={filter.placeholder ?? "Add dates"}
          />
        );

      case "guest_picker":
        return <Stepper value={num(value, 0)} min={0} minLabel={min} max={max} onChange={(n) => onChange(String(n))} placeholder={filter.placeholder} />;

      case "time_picker":
        return options.length > 0 ? (
          optionSelect()
        ) : (
          <TimePicker
            value={value}
            onChange={onChange}
            placeholder={filter.placeholder ?? "Any time"}
          />
        );

      case "duration_picker":
      case "select":
      case "radio_group":
        return optionSelect();

      // location_picker, resource_picker, service_picker: source list not loaded
      // in the hero, so render the component as free text.
      default:
        return (
          <Input
            type="text"
            placeholder={filter.placeholder ?? filter.label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  }

  function optionSelect() {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={filter.placeholder ?? "Any"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label}
      {control()}
    </div>
  );
}

function Stepper({
  value,
  min,
  max,
  minLabel,
  onChange,
  placeholder,
}: {
  value: number;
  min: number;
  max: number;
  minLabel: number;
  onChange: (value: number) => void;
  placeholder?: string | null;
}) {
  return (
    <div className="flex h-11 items-center justify-between rounded-[var(--r-sm)] border border-line bg-surface px-2">
      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-muted disabled:opacity-40"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Ms name="remove" style={{ fontSize: 16 }} />
      </button>
      <span className="overflow-hidden text-[14px] tabular-nums">
        {value > 0 ? (
          <motion.span
            key={value}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 520, damping: 24 }}
            className="inline-block"
          >
            {value}
          </motion.span>
        ) : (
          <span className="text-muted">{placeholder ?? `${minLabel}+`}</span>
        )}
      </span>
      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-muted disabled:opacity-40"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, Math.max(minLabel, value + 1)))}
      >
        <Ms name="add" style={{ fontSize: 16 }} />
      </button>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 24 }}
      className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] backdrop-blur transition-colors"
      style={
        active
          ? { background: "#fff", borderColor: "#fff", color: "var(--ink)", fontWeight: 600 }
          : { background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.3)", color: "#fff" }
      }
    >
      {children}
    </motion.button>
  );
}

const COMPONENT_ICON: Record<string, string> = {
  location_picker: "location_on",
  date_picker: "calendar_today",
  date_range: "date_range",
  time_picker: "schedule",
  guest_picker: "group",
  duration_picker: "hourglass_empty",
  resource_picker: "badge",
  service_picker: "spa",
  select: "expand_more",
  radio_group: "radio_button_checked",
  price_range: "payments",
  slider: "tune",
};

function optionList(raw: unknown): ComboOption[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((o) =>
    typeof o === "string"
      ? { value: o, label: o }
      : { value: String((o as ComboOption).value), label: String((o as ComboOption).label) },
  );
}

function num(raw: unknown, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

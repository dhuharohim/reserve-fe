"use client";

import { Fragment, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Ms } from "@/components/icon";
import { controlClass } from "@/components/ui/form/field";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboOption {
  value: string;
  label: string;
  group?: string;
  icon?: string;
  description?: string;
}

const MAX_RENDER = 100;

/* ---- shared bits ---- */

function useGrouped(options: ComboOption[]) {
  return useMemo(() => {
    const groups = new Map<string, ComboOption[]>();
    for (const o of options) {
      const g = o.group ?? "";
      groups.set(g, [...(groups.get(g) ?? []), o]);
    }
    return Array.from(groups.entries());
  }, [options]);
}

/** Wrap the query match in the label so results read like a real search. */
function highlight(label: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return label;
  const i = label.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return label;
  return (
    <>
      {label.slice(0, i)}
      <mark className="bg-transparent font-semibold text-[var(--accent-deep)]">
        {label.slice(i, i + q.length)}
      </mark>
      {label.slice(i + q.length)}
    </>
  );
}

function OptionRow({
  option,
  query,
  selected,
  onSelect,
}: {
  option: ComboOption;
  query: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <CommandItem value={`${option.label} ${option.value}`} onSelect={onSelect}>
      {option.icon && (
        <Ms name={option.icon} style={{ fontSize: 18 }} className="text-muted" />
      )}
      <span className="flex-1 truncate">
        <span className="block truncate">{highlight(option.label, query)}</span>
        {option.description && (
          <span className="block truncate text-[11.5px] text-muted">{option.description}</span>
        )}
      </span>
      {selected && <Ms name="check" style={{ fontSize: 17, color: "var(--accent-deep)" }} />}
    </CommandItem>
  );
}

function Panel({
  query,
  setQuery,
  loading,
  async: isAsync,
  onSearch,
  searchPlaceholder,
  grouped,
  isSelected,
  onPick,
  truncated,
}: {
  query: string;
  setQuery: (q: string) => void;
  loading?: boolean;
  async?: boolean;
  onSearch?: (q: string) => void;
  searchPlaceholder?: string;
  grouped: [string, ComboOption[]][];
  isSelected: (value: string) => boolean;
  onPick: (value: string) => void;
  truncated: boolean;
}) {
  return (
    <Command shouldFilter={!isAsync}>
      <CommandInput
        value={query}
        onValueChange={(q) => {
          setQuery(q);
          if (isAsync) onSearch?.(q);
        }}
        placeholder={searchPlaceholder ?? "Search…"}
      />
      <CommandList>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-[13px] text-muted">
            <Ms name="progress_activity" className="animate-spin" style={{ fontSize: 18 }} />
            Searching…
          </div>
        ) : (
          <>
            <CommandEmpty>No matches.</CommandEmpty>
            {grouped.map(([group, items]) => (
              <Fragment key={group || "_"}>
                <CommandGroup
                  heading={
                    group ? (
                      <span className="rz-mono px-2 pb-1 pt-2 text-[9.5px] uppercase tracking-[0.14em] text-muted">
                        {group}
                      </span>
                    ) : undefined
                  }
                >
                  {items.slice(0, MAX_RENDER).map((option) => (
                    <OptionRow
                      key={option.value}
                      option={option}
                      query={query}
                      selected={isSelected(option.value)}
                      onSelect={() => onPick(option.value)}
                    />
                  ))}
                </CommandGroup>
              </Fragment>
            ))}
            {truncated && (
              <div className="px-3 py-2 text-center text-[11.5px] text-muted">
                Showing first {MAX_RENDER} — refine your search to see more.
              </div>
            )}
          </>
        )}
      </CommandList>
    </Command>
  );
}

/* ---- single searchable select ---- */

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder,
  loading,
  onSearch,
  error,
  className,
}: {
  options: ComboOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  onSearch?: (query: string) => void;
  error?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const grouped = useGrouped(options);
  const current = options.find((o) => o.value === value);
  const truncated = options.length > MAX_RENDER && !onSearch;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(controlClass({ error }), "cursor-pointer justify-between gap-2", className)}
        >
          <span className="flex min-w-0 items-center gap-2">
            {current?.icon && <Ms name={current.icon} style={{ fontSize: 18 }} className="text-muted" />}
            <span className={cn("truncate", current ? "text-ink" : "text-muted")}>
              {current?.label ?? placeholder}
            </span>
          </span>
          <Ms name="unfold_more" style={{ fontSize: 18 }} className="shrink-0 text-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] border-0 p-0">
        <Panel
          query={query}
          setQuery={setQuery}
          loading={loading}
          async={Boolean(onSearch)}
          onSearch={onSearch}
          searchPlaceholder={searchPlaceholder}
          grouped={grouped}
          isSelected={(v) => v === value}
          onPick={(v) => {
            onChange(v);
            setOpen(false);
          }}
          truncated={truncated}
        />
      </PopoverContent>
    </Popover>
  );
}

/* ---- multi select ---- */

export function MultiCombobox({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder,
  loading,
  onSearch,
  maxTags = 3,
  error,
  className,
}: {
  options: ComboOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  onSearch?: (query: string) => void;
  maxTags?: number;
  error?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const grouped = useGrouped(options);
  const selected = options.filter((o) => value.includes(o.value));
  const overflow = selected.length - maxTags;
  const truncated = options.length > MAX_RENDER && !onSearch;

  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(controlClass({ error }), "h-auto min-h-11 cursor-pointer justify-between gap-2 py-1.5", className)}
        >
          {selected.length === 0 ? (
            <span className="text-muted">{placeholder}</span>
          ) : (
            <span className="flex flex-wrap items-center gap-1.5">
              {selected.slice(0, maxTags).map((o) => (
                <span
                  key={o.value}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px]"
                  style={{ background: "var(--accent-tint)", color: "var(--accent-deep)" }}
                >
                  {o.label}
                  <span
                    role="button"
                    tabIndex={-1}
                    aria-label={`Remove ${o.label}`}
                    className="inline-flex cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(o.value);
                    }}
                  >
                    <Ms name="close" style={{ fontSize: 13 }} />
                  </span>
                </span>
              ))}
              {overflow > 0 && (
                <span className="rz-mono text-[11.5px] text-muted">+{overflow} more</span>
              )}
            </span>
          )}
          <span className="flex shrink-0 items-center gap-1.5">
            {selected.length > 0 && (
              <span className="rz-mono rounded-full bg-panel px-1.5 py-0.5 text-[10.5px] text-muted">
                {selected.length}
              </span>
            )}
            <Ms name="unfold_more" style={{ fontSize: 18 }} className="text-muted" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] border-0 p-0">
        <Panel
          query={query}
          setQuery={setQuery}
          loading={loading}
          async={Boolean(onSearch)}
          onSearch={onSearch}
          searchPlaceholder={searchPlaceholder}
          grouped={grouped}
          isSelected={(v) => value.includes(v)}
          onPick={toggle}
          truncated={truncated}
        />
      </PopoverContent>
    </Popover>
  );
}

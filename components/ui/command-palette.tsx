"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Ms } from "@/components/icon";
import type { Category } from "@/lib/types";
import { startViewTransition } from "@/lib/view-transition";

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <span className="rz-mono block px-2 pb-1 pt-2 text-[9.5px] uppercase tracking-[0.14em] text-muted">
      {children}
    </span>
  );
}

/** ⌘K command palette + its trigger pill. Self-contained; drop into the header. */
export function CommandPalette({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function go(href: string) {
    setOpen(false);
    startViewTransition(() => router.push(href));
  }

  const item = (icon: string | null, label: string, href: string) => (
    <CommandItem key={`${href}:${label}`} value={label} onSelect={() => go(href)}>
      {icon && <Ms name={icon} style={{ fontSize: 18 }} className="text-muted" />}
      <span className="flex-1">{label}</span>
      <Ms name="arrow_forward" style={{ fontSize: 15 }} className="text-muted" />
    </CommandItem>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
        className="hidden items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-3 pr-2 text-[12.5px] text-muted transition-colors hover:text-ink md:inline-flex"
      >
        <Ms name="search" style={{ fontSize: 16 }} />
        Search
        <kbd className="rz-mono rounded bg-panel px-1.5 py-0.5 text-[10px] text-muted">⌘K</kbd>
      </button>

      {open && (
        <div className="rz fixed inset-0 z-[120] flex items-start justify-center p-4 pt-[12vh]">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
          />
          <div
            data-state="open"
            className="rz-pop-anim relative w-full max-w-xl overflow-hidden rounded-[var(--r)] border border-line bg-surface shadow-[0_40px_80px_-40px_rgba(30,20,10,0.6)]"
          >
            <Command>
              <CommandInput placeholder="Search or jump to…" autoFocus />
              <CommandList className="max-h-[52vh]">
                <CommandEmpty>No results.</CommandEmpty>
                <CommandGroup heading={<Heading>Go to</Heading>}>
                  {item("home", "Home", "/")}
                  {item("menu_book", "Guides & Stories", "/guides")}
                  {item("person", "My profile", "/profile")}
                  {item("confirmation_number", "My reservations", "/profile")}
                </CommandGroup>
                {categories.length > 0 && (
                  <CommandGroup heading={<Heading>Categories</Heading>}>
                    {categories.map((c) => item(c.icon, c.label, `/c/${c.key}`))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}

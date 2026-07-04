"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCategories } from "@/lib/api";
import type { Category } from "@/lib/types";
import { Ms } from "@/components/icon";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/faq", label: "FAQ" },
  { href: "/terms", label: "Terms & Conditions" },
];

export function SiteFooter() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  return (
    <footer className="rz relative z-30 isolate w-full bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {/* brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-baseline gap-2.5">
              <span className="rz-serif text-2xl font-bold tracking-tight text-paper">Réserve</span>
              <span className="rz-mono text-[9.5px] uppercase tracking-[0.26em] text-paper/50">
                Concierge
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-paper/60">
              Everything worth reserving — stays, tables, treatments and tickets — in one elegant
              place.
            </p>
          </div>

          {/* explore */}
          <div>
            <div className="rz-mono mb-3 text-[10px] uppercase tracking-[0.16em] text-paper/45">
              Explore
            </div>
            <ul className="flex flex-col gap-2">
              {categories.map((category) => (
                <li key={category.key}>
                  <Link
                    href={`/c/${category.key}`}
                    className="text-[13.5px] text-paper/70 transition-colors hover:text-paper"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* company */}
          <div>
            <div className="rz-mono mb-3 text-[10px] uppercase tracking-[0.16em] text-paper/45">
              Company
            </div>
            <ul className="flex flex-col gap-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[13.5px] text-paper/70 transition-colors hover:text-paper"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* account */}
          <div>
            <div className="rz-mono mb-3 text-[10px] uppercase tracking-[0.16em] text-paper/45">
              Account
            </div>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/profile" className="text-[13.5px] text-paper/70 transition-colors hover:text-paper">
                  My reservations
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-[13.5px] text-paper/70 transition-colors hover:text-paper">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-paper/12 pt-5">
          <p className="rz-mono text-[11px] text-paper/45">
            © {new Date().getFullYear()} Réserve · Demo concierge · No real payments processed
          </p>
          <div className="flex items-center gap-2 text-paper/45">
            <Ms name="verified_user" style={{ fontSize: 16 }} />
            <span className="rz-mono text-[11px]">Secure checkout · All times UTC</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

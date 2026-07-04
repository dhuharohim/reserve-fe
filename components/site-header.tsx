"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCategories } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Category } from "@/lib/types";
import { Ms } from "@/components/icon";
import { CommandPalette } from "@/components/ui/command-palette";
import { Drawer } from "@/components/ui/drawer";
import { Hint } from "@/components/ui/tooltip";
import { CategoriesMenu } from "@/components/mega-menu";

function NavItem({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-[13.5px] transition-colors ${
        active ? "font-semibold text-white" : "text-muted hover:text-ink"
      }`}
      style={active ? { background: "var(--accent-deep)" } : undefined}
    >
      {label}
    </Link>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function SiteHeader() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="rz fixed inset-x-0 top-0 z-50">
      <div
        className={`flex items-center justify-between gap-4 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
          scrolled
            ? "mx-auto w-full max-w-none rounded-none border-b border-line bg-paper/85 px-4 py-3 sm:px-6"
            : "mx-auto mt-3.5 w-[min(94%,72rem)] rounded-full border border-line bg-paper/90 px-4 py-2 pl-5 shadow-[0_20px_46px_-24px_rgba(30,20,10,0.5)] sm:px-5"
        }`}
      >
        <Link href="/" className="flex items-baseline gap-2.5">
          <span className="rz-serif text-2xl font-bold tracking-tight text-ink">
            Réserve
          </span>
          <span className="rz-mono hidden text-[9.5px] uppercase tracking-[0.26em] text-muted sm:inline">
            Concierge
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          <NavItem href="/" label="Home" active={pathname === "/"} />
          <CategoriesMenu categories={categories} />
          <NavItem href="/guides" label="Guides" active={pathname === "/guides"} />
          <NavItem href="/faq" label="FAQ" active={pathname === "/faq"} />
          <NavItem href="/terms" label="Terms" active={pathname === "/terms"} />
        </nav>

        <div className="flex items-center gap-2">
          <CommandPalette categories={categories} />
          {!loading && user && (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full py-1 pl-3 pr-1 transition-colors hover:bg-panel"
              >
                <span className="rz-mono hidden text-[10px] uppercase tracking-widest text-accent-deep sm:inline">
                  {user.tier ?? "member"}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper">
                  {initials(user.name)}
                </span>
              </Link>
              <Hint label="Sign out">
                <button
                  type="button"
                  onClick={() => logout()}
                  className="hidden rounded-full p-2 text-muted transition-colors hover:text-danger sm:inline-flex"
                  aria-label="Sign out"
                >
                  <Ms name="logout" style={{ fontSize: 18 }} />
                </button>
              </Hint>
            </>
          )}

          {!loading && !user && (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-panel"
            >
              <Ms name="person" style={{ fontSize: 17 }} />
              Sign in
            </Link>
          )}

          {/* mobile menu */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-panel lg:hidden"
          >
            <Ms name="menu" style={{ fontSize: 22 }} />
          </button>
        </div>
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <nav aria-label="Primary" className="mb-3 flex flex-col gap-0.5 border-b border-line pb-3">
          {[
            { href: "/", label: "Home" },
            { href: "/guides", label: "Guides & Stories" },
            { href: "/faq", label: "FAQ" },
            { href: "/terms", label: "Terms & Conditions" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-[var(--r-sm)] px-3 py-2.5 text-[15px] font-medium text-ink transition-colors hover:bg-panel"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="rz-mono mb-1.5 px-3 text-[10px] uppercase tracking-[0.16em] text-muted">
          Categories
        </div>
        <nav aria-label="Categories" className="flex flex-col gap-1">
          {categories.map((category) => (
            <Link
              key={category.key}
              href={`/c/${category.key}`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-[var(--r-sm)] px-3 py-2.5 text-[15px] text-ink transition-colors hover:bg-panel"
            >
              {category.icon && (
                <Ms name={category.icon} style={{ fontSize: 20, color: "var(--accent-deep)" }} />
              )}
              {category.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 border-t border-line pt-4">
          {user ? (
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-[15px] text-ink"
            >
              <Ms name="person" style={{ fontSize: 20 }} /> My profile
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-[14px] font-medium"
            >
              <Ms name="person" style={{ fontSize: 18 }} /> Sign in
            </Link>
          )}
        </div>
      </Drawer>
    </header>
  );
}

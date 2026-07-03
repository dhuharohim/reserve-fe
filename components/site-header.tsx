"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { customerNavigation } from "@/lib/navigation";
import { useAuth } from "@/lib/auth";

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="border-b border-ink bg-paper">
      <div className="gold-foil h-[2px] w-full" />
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-x-8 gap-y-2 px-4 py-5 sm:px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight hover:text-accent"
        >
          RESERVEFLOW<span className="text-accent">.</span>
        </Link>

        <nav
          aria-label="Main"
          className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm"
        >
          {customerNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={
                isActive(pathname, item.href)
                  ? "font-semibold text-accent"
                  : "transition-colors hover:text-accent"
              }
            >
              {item.label}
            </Link>
          ))}

          {!loading && user && (
            <button
              type="button"
              onClick={() => logout()}
              className="cursor-pointer font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
            >
              Sign out
            </button>
          )}

          {!loading && !user && (
            <Link
              href="/login"
              className="border border-ink px-3 py-1 font-medium transition-colors hover:border-accent hover:text-accent"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

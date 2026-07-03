"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="h-10 w-1/2 animate-pulse bg-line/60" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <h1 className="mb-6 font-display text-4xl font-semibold tracking-tight">
          Sign in to see your profile.
        </h1>
        <Link
          href="/login?next=/profile"
          className="inline-block bg-ink px-6 py-3 font-semibold text-paper transition-colors hover:text-champagne"
        >
          Sign in →
        </Link>
      </div>
    );
  }

  return (
    <div className="rf-fade-up mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-display text-4xl font-semibold tracking-tight">
        Profile.
      </h1>

      <dl className="mb-10 border-y border-ink py-6">
        <div className="flex justify-between gap-4 py-2">
          <dt className="font-mono text-xs uppercase tracking-widest text-muted">
            Name
          </dt>
          <dd className="font-medium">{user.name}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-line py-2">
          <dt className="font-mono text-xs uppercase tracking-widest text-muted">
            Email
          </dt>
          <dd className="font-medium">{user.email}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={() => logout()}
        className="cursor-pointer border border-ink px-6 py-3 font-semibold transition-colors hover:border-danger hover:text-danger"
      >
        Sign out
      </button>
    </div>
  );
}

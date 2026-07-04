"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMembership, getReservations } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, formatMoney, statusLabels } from "@/lib/format";
import { isActiveStatus, type Membership, type Reservation } from "@/lib/types";
import { Ms } from "@/components/icon";
import { Skeleton } from "@/components/motion/skeleton";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    if (!user) return;
    getMembership().then(setMembership).catch(() => undefined);
    getReservations().then(setReservations).catch(() => undefined);
  }, [user]);

  if (loading) {
    return (
      <div className="rz mx-auto flex max-w-6xl flex-col gap-4 px-4 py-16 sm:px-6">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-8 w-1/2" />
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-44 rounded-[var(--r)]" />
          <Skeleton className="h-44 rounded-[var(--r)]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rz mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-4 py-24 sm:px-6">
        <h1 className="rz-serif mb-6 text-5xl font-semibold">
          Sign in to see your profile.
        </h1>
        <Link
          href="/login?next=/profile"
          className="inline-flex w-fit items-center gap-2 rounded-[var(--r-sm)] px-6 py-3 font-semibold text-white"
          style={{ background: "var(--accent-deep)" }}
        >
          Sign in <Ms name="arrow_forward" style={{ fontSize: 18 }} />
        </Link>
      </div>
    );
  }

  const filtered = reservations.filter((r) =>
    tab === "upcoming" ? isActiveStatus(r.status) : !isActiveStatus(r.status),
  );
  const upcomingCount = reservations.filter((r) => isActiveStatus(r.status)).length;

  return (
    <div className="rz mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      {/* identity */}
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-2xl font-semibold text-paper">
          {initials(user.name)}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="rz-serif text-3xl font-semibold sm:text-4xl">{user.name}</h1>
            {membership && (
              <span
                className="rz-mono inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest"
                style={{ background: "var(--accent-tint)", color: "var(--accent-deep)" }}
              >
                <Ms name="workspace_premium" fill style={{ fontSize: 15 }} />
                {membership.tier} member
              </span>
            )}
          </div>
          <div className="mt-1 text-[13.5px] text-muted">
            {user.email}
            {membership?.member_since ? ` · Member since ${membership.member_since}` : ""}
          </div>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2.5 text-[13px] text-muted transition-colors hover:text-danger"
        >
          <Ms name="logout" style={{ fontSize: 17 }} /> Sign out
        </button>
      </div>

      {membership && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1.4fr]">
          {/* tier card */}
          <div
            className="relative flex min-h-[188px] flex-col justify-end overflow-hidden rounded-[var(--r)] p-6 text-white"
            style={{
              background:
                "linear-gradient(145deg, var(--accent-deep), var(--accent))",
            }}
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="rz-mono text-[10px] uppercase tracking-widest text-white/80">
                Membership
              </span>
              <Ms name="workspace_premium" fill style={{ fontSize: 22 }} />
            </div>
            <div className="rz-serif text-4xl font-semibold leading-none">
              {membership.tier}
            </div>
            <div className="mb-5 mt-1 text-[13px] text-white/85">
              {membership.points.toLocaleString()} points
            </div>
            <div className="mb-2 h-[7px] overflow-hidden rounded-full bg-white/22">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${membership.progress_percent}%` }}
              />
            </div>
            <div className="text-xs text-white/90">
              {membership.next_tier
                ? `${membership.points_to_next.toLocaleString()} points to ${membership.next_tier}`
                : "Top tier reached"}
            </div>
          </div>

          {/* perks */}
          <div className="rounded-[var(--r)] border border-line bg-surface p-5">
            <div className="rz-mono mb-3.5 text-[10px] uppercase tracking-widest text-muted">
              Your {membership.tier} perks
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {membership.perks.map((perk) => (
                <div key={perk} className="flex items-start gap-2 text-[13.5px] leading-snug">
                  <Ms name="check_circle" style={{ fontSize: 18, color: "var(--accent-deep)" }} className="flex-none" />
                  {perk}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* vouchers */}
      {membership && membership.vouchers.length > 0 && (
        <div>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="rz-serif text-2xl font-semibold">Your vouchers</h2>
            <span className="text-[12.5px] text-muted">{membership.vouchers.length} active</span>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {membership.vouchers.map((voucher) => (
              <div
                key={voucher.code}
                className="relative overflow-hidden rounded-[var(--r)] border border-line p-4"
                style={{ background: "linear-gradient(150deg, var(--accent-tint), var(--surface))" }}
              >
                <div className="mb-3.5 flex items-start justify-between gap-2.5">
                  <Ms
                    name={voucher.icon ?? "redeem"}
                    style={{ fontSize: 24, color: voucher.color ?? "var(--accent-deep)" }}
                  />
                  <span
                    className="rz-mono rounded-full px-2.5 py-1 text-[10.5px] tracking-wider"
                    style={{ background: "var(--surface)", color: voucher.color ?? "var(--accent-deep)" }}
                  >
                    {voucher.code}
                  </span>
                </div>
                <div className="rz-serif text-xl font-semibold leading-tight">{voucher.label}</div>
                <div className="mb-3 mt-0.5 text-[12.5px] text-muted">{voucher.description}</div>
                <div className="flex items-center gap-1.5 text-[11.5px] text-muted">
                  <Ms name="schedule" style={{ fontSize: 15 }} />
                  Expires {voucher.expires_at}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* reservations */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="rz-serif text-2xl font-semibold">Your reservations</h2>
          <div className="flex gap-1.5">
            {(["upcoming", "past"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="rounded-full border px-3.5 py-1.5 text-[12.5px] capitalize transition-colors"
                style={
                  tab === t
                    ? {
                        borderColor: "var(--accent)",
                        background: "var(--accent-tint)",
                        color: "var(--accent-deep)",
                        fontWeight: 600,
                      }
                    : { borderColor: "var(--line)", color: "var(--muted)" }
                }
              >
                {t} {t === "upcoming" ? `(${upcomingCount})` : ""}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[var(--r)] border border-dashed border-line p-10 text-center text-muted">
            <Ms name="event_busy" style={{ fontSize: 34 }} />
            <div className="mt-2.5 text-sm">No {tab} reservations yet.</div>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1.5 rounded-[var(--r-sm)] px-4 py-2.5 text-[13.5px] font-semibold text-white"
              style={{ background: "var(--accent-deep)" }}
            >
              Browse Réserve
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((reservation) => {
              const item = reservation.items?.[0];
              return (
                <Link
                  key={reservation.uuid}
                  href={`/r/${reservation.uuid}`}
                  className="flex items-center gap-4 overflow-hidden rounded-[var(--r)] border border-line bg-surface transition-colors hover:border-accent"
                >
                  <div
                    className="h-24 w-28 flex-none"
                    style={{
                      backgroundImage: reservation.reservation_type?.hero_image_url
                        ? `url(${reservation.reservation_type.hero_image_url})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      background: reservation.reservation_type?.hero_image_url
                        ? undefined
                        : "var(--panel)",
                    }}
                  />
                  <div className="min-w-0 flex-1 py-3">
                    <div className="mb-0.5 flex items-center gap-2">
                      <span
                        className="rz-mono rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider"
                        style={{
                          background: isActiveStatus(reservation.status)
                            ? "var(--accent-tint)"
                            : "var(--panel)",
                          color: isActiveStatus(reservation.status)
                            ? "var(--accent-deep)"
                            : "var(--muted)",
                        }}
                      >
                        {statusLabels[reservation.status] ?? reservation.status}
                      </span>
                      <span className="rz-mono text-[10.5px] text-muted">
                        {reservation.reservation_number}
                      </span>
                    </div>
                    <div className="rz-serif truncate text-xl font-semibold leading-tight">
                      {item?.description ?? reservation.reservation_type?.name}
                    </div>
                    {item?.starts_at && (
                      <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-muted">
                        <Ms name="event" style={{ fontSize: 15 }} />
                        {formatDate(item.starts_at)}
                      </div>
                    )}
                  </div>
                  <div className="flex-none px-5 text-right">
                    <div className="rz-serif text-xl font-semibold">
                      {Number(reservation.grand_total) > 0
                        ? formatMoney(reservation.grand_total)
                        : "—"}
                    </div>
                    <div className="rz-mono mt-0.5 text-[9.5px] uppercase tracking-wider text-muted">
                      {reservation.reservation_type?.category?.label ??
                        reservation.reservation_type?.reservation_mode}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

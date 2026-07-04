"use client";

import Link from "next/link";
import {
  use,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ApiError,
  createReservation,
  getMembership,
  getReservationType,
  getSlots,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import type {
  CustomField,
  Membership,
  Reservation,
  ReservationType,
  Slot,
  Voucher,
} from "@/lib/types";
import { AnimatePresence, motion } from "motion/react";
import { accentVars, Ms, modeIcon } from "@/components/icon";
import { LineArt } from "@/components/line-art";
import { DURATION, EASE, stepSlide } from "@/lib/motion";
import { useToast } from "@/components/motion/toast";
import { Typewriter } from "@/components/motion/typewriter";
import { Empty } from "@/components/rz-empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiCombobox } from "@/components/ui/combobox";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type AnswerValue = string | string[] | boolean;
type StepKey = "details" | "schedule" | "payment";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export default function BookTypePage({ params }: PageProps) {
  const { slug } = use(params);
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();

  const [type, setType] = useState<ReservationType | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [quantity, setQuantity] = useState(1);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<Reservation | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [voucherCode, setVoucherCode] = useState<string>("");

  useEffect(() => {
    getReservationType(slug)
      .then(setType)
      .catch(() => setLoadError("This experience couldn't load."));
    getSlots({ reservation_type: slug, per_page: 200 })
      .then(setSlots)
      .catch(() => setSlots([]));
  }, [slug]);

  useEffect(() => {
    if (!user) return;
    getMembership().then(setMembership).catch(() => undefined);
  }, [user]);

  const fields = useMemo(() => type?.custom_fields ?? [], [type]);
  const single = type?.form_layout !== "wizard";
  const paysUpfront =
    type?.payment_mode === "full_prepayment" || type?.payment_mode === "deposit";

  const steps: StepKey[] = single
    ? ["details"]
    : ["details", "schedule", "payment"];
  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];

  const slotsByDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    (slots ?? []).forEach((slot) => {
      const key = dayKey(slot.starts_at);
      map.set(key, [...(map.get(key) ?? []), slot]);
    });
    for (const list of map.values()) {
      list.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    }
    return map;
  }, [slots]);

  const selectedSlot = useMemo(
    () => (slots ?? []).find((s) => s.id === selectedSlotId) ?? null,
    [slots, selectedSlotId],
  );

  const unitPrice = selectedSlot ? Number(selectedSlot.price) : 0;
  const subtotal = unitPrice * quantity;

  const activeVoucher: Voucher | undefined = membership?.vouchers.find(
    (v) => v.code === voucherCode,
  );

  const breakdown = useMemo(() => {
    const tierPercent = membership?.discount_percent ?? 0;
    const tierDiscount = round2((subtotal * tierPercent) / 100);
    let voucherDiscount = 0;
    if (activeVoucher) {
      voucherDiscount =
        activeVoucher.discount_type === "fixed"
          ? Number(activeVoucher.discount_value ?? 0)
          : round2((subtotal * Number(activeVoucher.discount_value ?? 0)) / 100);
    }
    const discount = Math.min(subtotal, round2(tierDiscount + voucherDiscount));
    const taxable = subtotal - discount;
    const tax = round2(taxable * (type?.tax_rate ?? 0));
    const service = round2(taxable * (type?.service_charge_rate ?? 0));
    const grand = round2(taxable + tax + service);
    return { tierPercent, tierDiscount, voucherDiscount, discount, tax, service, grand };
  }, [subtotal, membership, activeVoucher, type]);

  const total = breakdown.grand;
  const totalStr = selectedSlot
    ? subtotal > 0
      ? formatMoney(total)
      : "—"
    : (type?.price_display ?? "—");
  const totalLabel = type?.payment_mode === "deposit" ? "Deposit due" : "Total";

  function setAnswer(key: string, value: AnswerValue) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  const detailsValid = fields.every((field) => {
    if (!field.required) return true;
    const value = answers[field.key];
    return !(
      value === undefined ||
      value === "" ||
      value === false ||
      (Array.isArray(value) && value.length === 0)
    );
  });
  const scheduleValid = selectedSlotId !== null;

  function validateDetails(): boolean {
    const errors: Record<string, string[]> = {};
    fields.forEach((field) => {
      if (!field.required) return;
      const value = answers[field.key];
      const empty =
        value === undefined ||
        value === "" ||
        value === false ||
        (Array.isArray(value) && value.length === 0);
      if (empty) errors[`answers.${field.key}`] = [`${field.label} is required.`];
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function submit() {
    if (!user || !selectedSlot) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const { reservation, checkoutUrl } = await createReservation({
        items: [{ slot_id: selectedSlot.id, quantity }],
        answers,
        voucher_code: voucherCode || undefined,
      });
      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      }
      setConfirmed(reservation);
    } catch (error: unknown) {
      setSubmitting(false);
      if (error instanceof ApiError) {
        setFieldErrors(error.errors);
        if (error.status === 409) {
          toast.show({
            title: "That time just filled up",
            description: "Choose another slot to continue.",
            tone: "error",
          });
          setFormError("That time just filled up. Pick another.");
          if (!single) setStepIndex(1);
        } else {
          setFormError(error.message);
          if (Object.keys(error.errors).length > 0) setStepIndex(0);
        }
        return;
      }
      toast.show({ title: "Something went wrong", description: "Please try again.", tone: "error" });
      setFormError("Something went wrong. Try again.");
    }
  }

  function handleNext() {
    if (single) {
      if (validateDetails() && scheduleValid) void submit();
      return;
    }
    if (currentStep === "details") {
      if (!validateDetails()) return;
      setDirection(1);
      setStepIndex(1);
    } else if (currentStep === "schedule") {
      if (!scheduleValid) return;
      setDirection(1);
      setStepIndex(2);
    } else {
      void submit();
    }
  }

  const accent = accentVars(type?.color);

  // ---- pre-form states ----

  if (loadError) {
    return (
      <Shell style={accent}>
        <Card>
          <div className="px-8 py-16 text-center">
            <h1 className="rz-serif mb-4 text-4xl font-semibold">{loadError}</h1>
            <Link href="/" className="text-sm font-semibold" style={{ color: "var(--accent-deep)" }}>
              Back to home →
            </Link>
          </div>
        </Card>
      </Shell>
    );
  }

  if (!type || slots === null || authLoading) {
    return (
      <Shell style={accent}>
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_344px]">
            <div className="space-y-4 p-8">
              <div className="h-8 w-1/2 animate-pulse rounded bg-line" />
              <div className="h-40 w-full animate-pulse rounded bg-line" />
            </div>
            <div className="hidden bg-panel p-8 sm:block" />
          </div>
        </Card>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell style={accent}>
        <Card>
          <div className="px-8 py-16 text-center">
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: "var(--accent-tint)", color: "var(--accent-deep)" }}
            >
              <Ms name="lock" style={{ fontSize: 30 }} />
            </div>
            <h1 className="rz-serif mb-2 text-4xl font-semibold">Sign in to reserve</h1>
            <p className="mx-auto mb-7 max-w-sm text-sm text-muted">
              Continue booking {type.name}. Your seat holds for fifteen minutes.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href={`/login?next=/book/${slug}`}
                className="inline-flex items-center gap-2 rounded-[var(--r-sm)] px-6 py-3 text-sm font-semibold text-white"
                style={{ background: "var(--accent-deep)" }}
              >
                Sign in <Ms name="arrow_forward" style={{ fontSize: 18 }} />
              </Link>
              <Link
                href={`/register?next=/book/${slug}`}
                className="inline-flex items-center gap-2 rounded-[var(--r-sm)] border border-line px-6 py-3 text-sm font-semibold"
              >
                Create account
              </Link>
            </div>
          </div>
        </Card>
      </Shell>
    );
  }

  if (confirmed) {
    return (
      <Shell style={accent}>
        <Card>
          <div className="flex flex-col items-center px-6 py-14 text-center sm:px-12">
            <div
              className="rz-check-pop mb-5 flex h-[74px] w-[74px] items-center justify-center rounded-full"
              style={{ background: "var(--accent-tint)", color: "var(--accent-deep)" }}
            >
              <Ms name="check" style={{ fontSize: 42 }} />
            </div>
            <div className="rz-mono mb-3 text-[10.5px] uppercase tracking-[0.22em]" style={{ color: "var(--accent-deep)" }}>
              Reservation confirmed
            </div>
            <h1 className="rz-serif mb-3 text-4xl font-semibold sm:text-5xl">You&apos;re all set.</h1>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-muted">
              A confirmation is on its way, and this reservation is saved to your profile.
            </p>
            <div className="mb-7 flex items-center gap-3 rounded-[var(--r-sm)] border border-dashed border-line bg-surface px-5 py-3">
              <span className="rz-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Code</span>
              <Typewriter text={confirmed.reservation_number} className="rz-mono text-lg tracking-[0.1em]" />
            </div>
            <div className="mb-7 w-full max-w-md rounded-[var(--r)] border border-line bg-surface p-6 text-left">
              <ItemHeader type={type} slot={selectedSlot} />
              <Divider />
              <SummaryRows type={type} slot={selectedSlot} fields={fields} answers={answers} quantity={quantity} />
              <Divider />
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted">Total paid</span>
                <span className="rz-serif text-2xl font-semibold">
                  {formatMoney(Number(confirmed.grand_total))}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/profile" className="inline-flex items-center gap-2 rounded-[var(--r-sm)] border border-line px-5 py-3 text-sm font-medium">
                <Ms name="confirmation_number" style={{ fontSize: 18 }} /> My reservations
              </Link>
              <Link href="/" className="inline-flex items-center gap-2 rounded-[var(--r-sm)] px-5 py-3 text-sm font-semibold text-white" style={{ background: "var(--accent-deep)" }}>
                <Ms name="home" style={{ fontSize: 18 }} /> Back to home
              </Link>
            </div>
          </div>
        </Card>
      </Shell>
    );
  }

  // ---- the flow ----

  const maxQuantity = Math.max(
    1,
    Math.min(10, selectedSlot?.remaining_capacity ?? 10),
  );

  const detailsStep = (
    <div>
      <Eyebrow>{single ? "Reservation" : "Step 01 — Details"}</Eyebrow>
      <h2 className="rz-serif mb-5 text-3xl font-semibold">Your details</h2>
      {maxQuantity > 1 && (
        <FieldShell label={type.reservation_mode === "hotel" ? "Rooms" : "Guests"}>
          <Stepper value={quantity} min={1} max={maxQuantity} onChange={setQuantity} />
        </FieldShell>
      )}
      {fields.map((field) => (
        <Field
          key={field.key}
          field={field}
          value={answers[field.key]}
          error={fieldErrors[`answers.${field.key}`]?.[0]}
          onChange={(v) => setAnswer(field.key, v)}
        />
      ))}
    </div>
  );

  const scheduleStep = (
    <div>
      <Eyebrow>{single ? "When" : "Step 02 — Schedule"}</Eyebrow>
      <h2 className="rz-serif mb-5 text-3xl font-semibold">Choose a date &amp; time</h2>
      {slots.length === 0 ? (
        <Empty
          icon="event_busy"
          title="No open times right now"
          description="Every slot for this experience is currently booked. Check back soon — availability opens regularly."
        />
      ) : (
        <BookingCalendar
          slotsByDay={slotsByDay}
          monthOffset={monthOffset}
          onMonth={setMonthOffset}
          selectedDay={selectedDay}
          onPickDay={(d) => {
            setSelectedDay(d);
            setSelectedSlotId(null);
          }}
          selectedSlotId={selectedSlotId}
          onPickSlot={setSelectedSlotId}
        />
      )}
    </div>
  );

  const paymentStep = (
    <div>
      <Eyebrow>{single ? "Checkout" : "Step 03 — Payment"}</Eyebrow>
      <h2 className="rz-serif mb-5 text-3xl font-semibold">
        {paysUpfront ? "Secure checkout" : "Confirm your reservation"}
      </h2>
      <div className="flex items-start gap-3 rounded-[var(--r-sm)] border border-line bg-surface p-4">
        <Ms
          name={paysUpfront ? "shield_lock" : "verified"}
          style={{ fontSize: 22, color: "var(--accent-deep)" }}
        />
        <div className="text-[13px] leading-relaxed text-muted">
          {paysUpfront
            ? "Payment completes on Stripe's encrypted page — no card details are entered or stored here."
            : "No payment is taken today. Reserve now and settle on site."}
        </div>
      </div>

      {membership && membership.vouchers.length > 0 && subtotal > 0 && (
        <VoucherPicker
          vouchers={membership.vouchers}
          selected={voucherCode}
          onSelect={setVoucherCode}
        />
      )}
      {membership && breakdown.tierPercent > 0 && subtotal > 0 && (
        <div className="mt-3 flex items-center gap-2 text-[13px]" style={{ color: "var(--accent-deep)" }}>
          <Ms name="workspace_premium" fill style={{ fontSize: 18 }} />
          {membership.tier} member — {breakdown.tierPercent}% off applied automatically.
        </div>
      )}
    </div>
  );

  const onLast = single || currentStep === "payment";
  const nextLabel = onLast
    ? paysUpfront
      ? `Confirm & pay ${totalStr}`
      : "Confirm reservation"
    : "Continue";
  const canNext =
    currentStep === "details"
      ? detailsValid
      : currentStep === "schedule"
        ? scheduleValid
        : single
          ? detailsValid && scheduleValid
          : true;
  const hint =
    currentStep === "details" && !detailsValid
      ? "Complete the required details"
      : currentStep === "schedule" && !scheduleValid
        ? "Select a date and time"
        : "";

  return (
    <Shell style={accent}>
      <Card>
        {/* header */}
        <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
          <Link
            href={`/reservations/${type.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted"
          >
            <Ms name="arrow_back" style={{ fontSize: 18 }} />
            {type.name}
          </Link>
          {!single && <StepRail steps={steps} stepIndex={stepIndex} />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_344px]">
          {/* form column */}
          <div className="flex flex-col gap-8 overflow-hidden border-b border-line p-6 sm:border-b-0 sm:border-r sm:p-10">
            {single ? (
              <>
                {detailsStep}
                {scheduleStep}
                {paymentStep}
              </>
            ) : (
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={stepSlide(direction)}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {currentStep === "details" && detailsStep}
                  {currentStep === "schedule" && scheduleStep}
                  {currentStep === "payment" && paymentStep}
                </motion.div>
              </AnimatePresence>
            )}

            {formError && (
              <motion.p
                key={formError}
                initial={{ x: 0 }}
                animate={{ x: [0, -6, 6, -4, 4, 0] }}
                transition={{ duration: 0.4, ease: EASE.inOut }}
                className="border-l-2 pl-3 text-sm"
                style={{ borderColor: "var(--accent-deep)" }}
                role="alert"
              >
                {formError}
              </motion.p>
            )}
          </div>

          {/* summary rail */}
          <div className="bg-panel p-6 sm:p-8">
            <div className="sm:sticky sm:top-24">
              <ItemHeader type={type} slot={selectedSlot} />
              <Divider />
              <div className="rz-mono mb-3 text-[9.5px] uppercase tracking-[0.16em] text-muted">
                Your reservation
              </div>
              <SummaryRows type={type} slot={selectedSlot} fields={fields} answers={answers} quantity={quantity} />
              <Divider />
              {selectedSlot && subtotal > 0 ? (
                <div className="mb-3 flex flex-col gap-2">
                  <PriceLine label={`${type.name} × ${quantity}`} value={formatMoney(subtotal)} />
                  {breakdown.tierDiscount > 0 && (
                    <PriceLine
                      label={`Member discount · ${breakdown.tierPercent}%`}
                      value={`− ${formatMoney(breakdown.tierDiscount)}`}
                      accent
                    />
                  )}
                  {breakdown.voucherDiscount > 0 && activeVoucher && (
                    <PriceLine
                      label={`Voucher · ${activeVoucher.code}`}
                      value={`− ${formatMoney(breakdown.voucherDiscount)}`}
                      accent
                    />
                  )}
                  {breakdown.tax > 0 && <PriceLine label="Tax" value={formatMoney(breakdown.tax)} />}
                  {breakdown.service > 0 && (
                    <PriceLine label="Service charge" value={formatMoney(breakdown.service)} />
                  )}
                </div>
              ) : (
                <p className="mb-3 text-[11.5px] leading-relaxed text-muted">
                  {selectedSlot
                    ? "No payment is due at booking for this experience."
                    : "Select a time to see your total."}
                </p>
              )}
              <div className="flex items-baseline justify-between border-t border-line pt-3.5">
                <span className="text-sm text-muted">{totalLabel}</span>
                <span className="rz-serif text-3xl font-semibold">{totalStr}</span>
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between gap-4 border-t border-line px-6 py-4">
          {!single && stepIndex > 0 ? (
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setDirection(-1);
                setStepIndex((i) => Math.max(0, i - 1));
              }}
              className="inline-flex items-center gap-1.5 rounded-[var(--r-sm)] border border-line px-4 py-2.5 text-sm text-muted disabled:opacity-50"
            >
              <Ms name="arrow_back" style={{ fontSize: 18 }} /> Back
            </button>
          ) : (
            <span />
          )}
          <div className="ml-auto flex items-center gap-4">
            {hint && <span className="text-[12.5px] text-muted">{hint}</span>}
            <motion.button
              type="button"
              disabled={submitting || !canNext}
              onClick={handleNext}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: DURATION.fast, ease: EASE.out }}
              className="inline-flex items-center gap-2 rounded-[var(--r-sm)] px-6 py-3 text-sm font-semibold text-white transition-[background,opacity] disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "var(--accent-deep)" }}
            >
              <span>{submitting ? "Working…" : nextLabel}</span>
              <Ms name={submitting ? "hourglass_top" : onLast ? (paysUpfront ? "lock" : "check") : "arrow_forward"} style={{ fontSize: 18 }} />
            </motion.button>
          </div>
        </div>
      </Card>
    </Shell>
  );
}

/* ---------- calendar ---------- */

function BookingCalendar({
  slotsByDay,
  monthOffset,
  onMonth,
  selectedDay,
  onPickDay,
  selectedSlotId,
  onPickSlot,
}: {
  slotsByDay: Map<string, Slot[]>;
  monthOffset: number;
  onMonth: (n: number) => void;
  selectedDay: string | null;
  onPickDay: (day: string) => void;
  selectedSlotId: number | null;
  onPickSlot: (id: number) => void;
}) {
  const base = new Date();
  const view = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + monthOffset, 1));
  const year = view.getUTCFullYear();
  const month = view.getUTCMonth();
  const firstDow = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const todayKey = new Date().toISOString().slice(0, 10);

  const cells: Array<{ key: string; day: number } | null> = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = new Date(Date.UTC(year, month, d)).toISOString().slice(0, 10);
    cells.push({ key, day: d });
  }

  const daySlots = selectedDay ? (slotsByDay.get(selectedDay) ?? []) : [];

  return (
    <div>
      <div className="rounded-[var(--r)] border border-line bg-surface p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            disabled={monthOffset <= 0}
            onClick={() => onMonth(Math.max(0, monthOffset - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line disabled:opacity-40"
          >
            <Ms name="chevron_left" style={{ fontSize: 20 }} />
          </button>
          <span className="rz-serif text-xl font-semibold">
            {view.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}
          </span>
          <button
            type="button"
            disabled={monthOffset >= 11}
            onClick={() => onMonth(Math.min(11, monthOffset + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line disabled:opacity-40"
          >
            <Ms name="chevron_right" style={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((w) => (
            <span key={w} className="rz-mono text-center text-[9.5px] uppercase tracking-wide text-muted">
              {w}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((cell, i) => {
            if (!cell) return <span key={`b-${i}`} />;
            const has = slotsByDay.has(cell.key);
            const past = cell.key < todayKey;
            const available = has && !past;
            const selected = cell.key === selectedDay;
            return (
              <button
                key={cell.key}
                type="button"
                disabled={!available}
                onClick={() => onPickDay(cell.key)}
                className="relative flex aspect-square items-center justify-center rounded-[var(--r-sm)] text-sm tabular-nums transition-colors"
                style={
                  selected
                    ? { background: "var(--accent-deep)", color: "#fff" }
                    : available
                      ? { color: "var(--rz-ink)" }
                      : { color: "color-mix(in oklch, var(--rz-ink), transparent 62%)", cursor: "default" }
                }
              >
                {cell.day}
                {available && !selected && (
                  <span
                    className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay ? (
        <div className="mt-5">
          <div className="rz-mono mb-3 text-[10px] uppercase tracking-[0.16em] text-muted">
            Available times — {formatDate(selectedDay)}
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(78px,1fr))] gap-2">
            {daySlots.map((slot) => {
              const sel = slot.id === selectedSlotId;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onPickSlot(slot.id)}
                  className="rounded-[var(--r-sm)] border px-2 py-2.5 text-center text-[13.5px] tabular-nums transition-colors"
                  style={
                    sel
                      ? { background: "var(--accent-deep)", color: "#fff", borderColor: "var(--accent-deep)" }
                      : { borderColor: "var(--line)", color: "var(--rz-ink)" }
                  }
                >
                  {formatTime(slot.starts_at)}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-2 rounded-[var(--r-sm)] bg-panel px-4 py-4 text-[13px] text-muted">
          <Ms name="schedule" style={{ fontSize: 18 }} />
          Select an available date to see open times.
        </div>
      )}
    </div>
  );
}

/* ---------- primitives ---------- */

function Shell({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="rz" style={style}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative overflow-hidden rounded-[calc(var(--r)+6px)] border border-[var(--panel-border)] bg-surface"
      style={{ boxShadow: "0 34px 64px -46px rgba(60,45,30,.32)" }}
    >
      <LineArt opacity={0.45} />
      <div className="relative">{children}</div>
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="rz-mono mb-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--accent-deep)" }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="my-4 h-px bg-line" />;
}

function PriceLine({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[12.5px] text-muted">{label}</span>
      <span
        className="rz-mono text-[12.5px] tabular-nums"
        style={accent ? { color: "var(--accent-deep)" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

function VoucherPicker({
  vouchers,
  selected,
  onSelect,
}: {
  vouchers: Voucher[];
  selected: string;
  onSelect: (code: string) => void;
}) {
  return (
    <div className="mt-4">
      <div className="rz-mono mb-2 text-[10px] uppercase tracking-[0.16em] text-muted">
        Apply a voucher
      </div>
      <div className="flex flex-col gap-2">
        {vouchers.map((voucher) => {
          const on = voucher.code === selected;
          return (
            <button
              key={voucher.code}
              type="button"
              onClick={() => onSelect(on ? "" : voucher.code)}
              className="flex items-center gap-3 rounded-[var(--r-sm)] border p-3 text-left transition-colors"
              style={
                on
                  ? { borderColor: "var(--accent)", background: "var(--accent-tint)" }
                  : { borderColor: "var(--line)" }
              }
            >
              <Ms
                name={voucher.icon ?? "redeem"}
                style={{ fontSize: 22, color: voucher.color ?? "var(--accent-deep)" }}
              />
              <div className="flex-1">
                <div className="text-[13.5px] font-semibold">{voucher.label}</div>
                <div className="rz-mono text-[10.5px] tracking-wider text-muted">
                  {voucher.code}
                </div>
              </div>
              <Ms
                name={on ? "check_circle" : "radio_button_unchecked"}
                fill={on}
                style={{ fontSize: 20, color: on ? "var(--accent-deep)" : "var(--muted)" }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FieldShell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <label className="rz-mono mb-2 block text-[10px] uppercase tracking-[0.16em] text-muted">{label}</label>
      {children}
    </div>
  );
}

function StepRail({ steps, stepIndex }: { steps: StepKey[]; stepIndex: number }) {
  const labels: Record<StepKey, string> = { details: "Details", schedule: "Schedule", payment: "Payment" };
  return (
    <div className="hidden items-center gap-1.5 sm:flex">
      {steps.map((step, index) => {
        const done = index < stepIndex;
        const current = index === stepIndex;
        return (
          <div key={step} className="flex items-center gap-1.5">
            <span
              className="rz-mono flex h-[26px] w-[26px] items-center justify-center rounded-full text-[10.5px]"
              style={
                done
                  ? { background: "var(--accent-deep)", color: "#fff" }
                  : current
                    ? { background: "var(--accent-tint)", color: "var(--accent-deep)", border: "1.5px solid var(--accent)" }
                    : { color: "var(--muted)", border: "1px solid var(--line)" }
              }
            >
              {done ? <Ms name="check" style={{ fontSize: 15 }} /> : `0${index + 1}`}
            </span>
            <span
              className="text-xs"
              style={{ fontWeight: current ? 600 : 500, color: current ? "var(--rz-ink)" : "var(--muted)" }}
            >
              {labels[step]}
            </span>
            {index < steps.length - 1 && <span className="h-px w-5 bg-line" />}
          </div>
        );
      })}
    </div>
  );
}

function ItemHeader({ type, slot }: { type: ReservationType; slot: Slot | null }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-11 w-11 flex-none items-center justify-center rounded-[13px]"
        style={{ background: "var(--accent-tint)", color: "var(--accent-deep)" }}
      >
        <Ms name={modeIcon(type.reservation_mode)} style={{ fontSize: 24 }} />
      </span>
      <div>
        <div className="rz-serif text-xl font-semibold leading-tight">{type.name}</div>
        <div className="text-xs text-muted">{slot?.resource?.name ?? type.subtitle}</div>
      </div>
    </div>
  );
}

function SummaryRows({
  type,
  slot,
  fields,
  answers,
  quantity,
}: {
  type: ReservationType;
  slot: Slot | null;
  fields: CustomField[];
  answers: Record<string, AnswerValue>;
  quantity: number;
}) {
  const rows: { label: string; value: string }[] = [];
  fields.forEach((field) => {
    const value = answers[field.key];
    if (value === undefined || value === "" || value === false) return;
    if (Array.isArray(value) && value.length === 0) return;
    let display: string;
    if (Array.isArray(value)) {
      display = value.map((v) => field.options.find((o) => o.value === v)?.label ?? v).join(", ");
    } else if (value === true) {
      display = "Yes";
    } else {
      display = field.options.find((o) => o.value === value)?.label ?? String(value);
    }
    rows.push({ label: field.label, value: display });
  });
  if (slot) {
    rows.push({ label: "Date", value: formatDate(slot.starts_at) });
    rows.push({ label: "Time", value: `${formatTime(slot.starts_at)} UTC` });
  }
  if (quantity > 1) {
    rows.push({ label: type.reservation_mode === "hotel" ? "Rooms" : "Guests", value: String(quantity) });
  }

  if (rows.length === 0) {
    return <p className="mb-4 text-[12.5px] text-muted">Your choices will appear here.</p>;
  }

  return (
    <div className="mb-4 flex flex-col gap-2.5">
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-4">
          <span className="flex-none text-[12.5px] text-muted">{row.label}</span>
          <span className="text-right text-[13px] font-medium">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- form controls ---------- */

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const btn = "flex h-11 w-11 items-center justify-center text-muted disabled:opacity-40";
  return (
    <div className="inline-flex items-center overflow-hidden rounded-[var(--r-sm)] border border-line">
      <button type="button" className={btn} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
        <Ms name="remove" style={{ fontSize: 19 }} />
      </button>
      <span className="relative min-w-[54px] overflow-hidden text-center text-[15px] tabular-nums">
        <motion.span
          key={value}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 520, damping: 24 }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </span>
      <button type="button" className={btn} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
        <Ms name="add" style={{ fontSize: 19 }} />
      </button>
    </div>
  );
}

function Field({
  field,
  value,
  error,
  onChange,
}: {
  field: CustomField;
  value: AnswerValue | undefined;
  error?: string;
  onChange: (value: AnswerValue) => void;
}) {
  const inputClass =
    "w-full rounded-[var(--r-sm)] border border-line bg-surface px-3.5 text-[14.5px] text-ink outline-none focus:border-accent";

  const pillStyle = (on: boolean): CSSProperties =>
    on
      ? { borderColor: "var(--accent)", background: "var(--accent-tint)", color: "var(--accent-deep)", fontWeight: 600 }
      : { borderColor: "var(--line)", color: "var(--muted)" };

  const control = (() => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            id={field.key}
            rows={3}
            className={`${inputClass} resize-y py-3 leading-relaxed`}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case "select":
        return (
          <Select value={(value as string) ?? ""} onValueChange={(v) => onChange(v)}>
            <SelectTrigger id={field.key}>
              <SelectValue placeholder="Choose…" />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "multiselect": {
        const selected = Array.isArray(value) ? value : [];
        return (
          <MultiCombobox
            options={field.options}
            value={selected}
            onChange={(arr) => onChange(arr)}
            placeholder="Select all that apply…"
          />
        );
      }
      case "checkbox":
        return (
          <button
            type="button"
            onClick={() => onChange(value !== true)}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13.5px]"
            style={pillStyle(value === true)}
          >
            <Ms name={value === true ? "check_circle" : "radio_button_unchecked"} style={{ fontSize: 18 }} />
            {field.label}
          </button>
        );
      case "number":
        return (
          <Stepper
            value={typeof value === "string" && value !== "" ? Number(value) : 0}
            min={0}
            max={99}
            onChange={(n) => onChange(String(n))}
          />
        );
      default:
        return (
          <Input
            id={field.key}
            type={field.type === "date" ? "date" : "text"}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  })();

  return (
    <div className="mb-5">
      {field.type !== "checkbox" && (
        <label htmlFor={field.key} className="rz-mono mb-2 block text-[10px] uppercase tracking-[0.16em] text-muted">
          {field.label}
          {!field.required && <span className="tracking-normal text-muted"> — optional</span>}
        </label>
      )}
      {control}
      {error && (
        <p className="mt-1.5 text-sm" style={{ color: "var(--accent-deep)" }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

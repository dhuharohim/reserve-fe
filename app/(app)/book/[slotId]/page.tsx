"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { ApiError, createReservation, getSlot } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import { typeImage } from "@/lib/images";
import type { CustomField, Slot } from "@/lib/types";

interface PageProps {
  params: Promise<{ slotId: string }>;
}

type AnswerValue = string | string[] | boolean;

interface WizardStep {
  title: string;
  fields: CustomField[];
  isReview: boolean;
}

export default function BookSlotPage({ params }: PageProps) {
  const { slotId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [slot, setSlot] = useState<Slot | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    getSlot(slotId)
      .then(setSlot)
      .catch((error: unknown) =>
        setSlotError(
          error instanceof ApiError && error.status === 404
            ? "This slot is no longer on the board."
            : "The slot couldn't load. Try again.",
        ),
      );
  }, [slotId]);

  const type = slot?.reservation_type;
  const fields = useMemo(() => type?.custom_fields ?? [], [type]);
  const isWizard = type?.form_layout === "wizard";

  const steps = useMemo<WizardStep[]>(() => {
    if (!isWizard) return [];

    const numbers = [...new Set(fields.map((field) => field.step))].sort(
      (a, b) => a - b,
    );

    const fieldSteps = numbers.map((number, index) => ({
      title: numbers.length > 1 ? `Details ${index + 1}` : "Details",
      fields: fields.filter((field) => field.step === number),
      isReview: false,
    }));

    return [...fieldSteps, { title: "Review", fields: [], isReview: true }];
  }, [fields, isWizard]);

  function setAnswer(key: string, value: AnswerValue) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function validateFields(toCheck: CustomField[]): boolean {
    const errors: Record<string, string[]> = {};

    toCheck.forEach((field) => {
      if (!field.required) return;
      const value = answers[field.key];
      const empty =
        value === undefined ||
        value === "" ||
        value === false ||
        (Array.isArray(value) && value.length === 0);

      if (empty) {
        errors[`answers.${field.key}`] = [`The ${field.label} field is required.`];
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function submit() {
    if (!user || !slot) return;

    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const { checkoutUrl } = await createReservation({
        items: [{ slot_id: slot.id, quantity }],
        answers,
      });

      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      }

      router.push("/upcoming");
    } catch (error: unknown) {
      setSubmitting(false);

      if (error instanceof ApiError) {
        setFieldErrors(error.errors);
        setFormError(
          error.status === 409
            ? "That slot just filled up. Pick another time."
            : error.message,
        );

        // Jump back to the first step containing an invalid field.
        if (isWizard) {
          const badKeys = Object.keys(error.errors).map((key) =>
            key.replace(/^answers\./, ""),
          );
          const target = steps.findIndex((step) =>
            step.fields.some((field) => badKeys.includes(field.key)),
          );
          if (target >= 0) setStepIndex(target);
        }
        return;
      }

      setFormError("Something went wrong. Try again.");
    }
  }

  function handleNext() {
    const current = steps[stepIndex];
    if (!current) return;

    if (!current.isReview && !validateFields(current.fields)) return;

    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  }

  if (slotError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <h1 className="mb-6 font-display text-4xl font-semibold tracking-tight">
          {slotError}
        </h1>
        <Link href="/#calendar" className="font-medium text-accent">
          Back to the calendar →
        </Link>
      </div>
    );
  }

  if (!slot || authLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="mb-8 h-10 w-2/3 animate-pulse bg-line/60" />
        <div className="mb-8 h-44 w-full animate-pulse bg-line/60 sm:h-56" />
        <div className="h-24 w-full animate-pulse bg-line/60" />
      </div>
    );
  }

  const paysUpfront =
    type?.payment_mode === "full_prepayment" || type?.payment_mode === "deposit";
  const maxQuantity = Math.max(1, Math.min(10, slot.remaining_capacity));
  const submitLabel = submitting
    ? "Holding your seat…"
    : paysUpfront
      ? "Hold seat & pay →"
      : "Reserve →";

  return (
    <div className="rf-fade-up mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">
        Book — {type?.name}
      </p>
      <h1 className="mb-8 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Hold this seat.
      </h1>

      {type && (
        <div className="relative mb-8 h-44 overflow-hidden border border-ink sm:h-56">
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 z-10 h-[3px] w-full"
            style={{ background: type.color ?? "#a8873c" }}
          />
          <Image
            src={typeImage(type)}
            alt={type.name}
            fill
            sizes="(max-width: 768px) 100vw, 48rem"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mb-10 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-ink py-6 font-mono text-sm sm:grid-cols-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted">Date</div>
          <div className="text-lg tabular-nums">{formatDate(slot.starts_at)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted">Time (UTC)</div>
          <div className="text-lg tabular-nums">
            {formatTime(slot.starts_at)}–{formatTime(slot.ends_at)}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted">Seats left</div>
          <div className="text-lg tabular-nums">{slot.remaining_capacity}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted">Price</div>
          <div className="gold-foil-text font-display text-xl font-semibold tabular-nums">
            {Number(slot.price) > 0 ? formatMoney(slot.price) : "Pay on site"}
          </div>
        </div>
      </div>

      {!user && (
        <div className="relative border border-ink p-6">
          <div className="gold-foil absolute left-0 top-0 h-[2px] w-full" />
          <h2 className="mb-2 text-xl font-bold">Sign in to hold this seat</h2>
          <p className="mb-4 text-sm text-muted">
            Your seat holds for fifteen minutes once you start checkout.
          </p>
          <div className="flex gap-4">
            <Link
              href={`/login?next=/book/${slot.id}`}
              className="bg-ink px-6 py-3 font-semibold text-paper transition-colors hover:text-champagne"
            >
              Sign in →
            </Link>
            <Link
              href={`/register?next=/book/${slot.id}`}
              className="border border-ink px-6 py-3 font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              Create account
            </Link>
          </div>
        </div>
      )}

      {user && !isWizard && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (validateFields(fields)) void submit();
          }}
          noValidate
        >
          <div className="space-y-6">
            <QuantityInput
              maxQuantity={maxQuantity}
              quantity={quantity}
              onChange={setQuantity}
            />
            {fields.map((field) => (
              <FieldInput
                key={field.key}
                field={field}
                value={answers[field.key]}
                error={fieldErrors[`answers.${field.key}`]?.[0]}
                onChange={(value) => setAnswer(field.key, value)}
              />
            ))}
          </div>

          {formError && (
            <p className="mt-6 border-l-2 border-accent pl-4 text-sm" role="alert">
              {formError}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer bg-ink px-8 py-4 font-semibold uppercase tracking-wide text-paper transition-colors hover:text-champagne disabled:cursor-default disabled:opacity-50"
            >
              {submitLabel}
            </button>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {paysUpfront ? "Held 15 minutes, then released" : "No payment needed today"}
            </p>
          </div>
        </form>
      )}

      {user && isWizard && (
        <div>
          <ol className="mb-8 flex border border-ink" aria-label="Booking steps">
            {steps.map((step, index) => {
              const isDone = index < stepIndex;
              const isCurrent = index === stepIndex;

              return (
                <li
                  key={step.title}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`relative flex-1 border-r border-line px-3 py-2.5 last:border-r-0 ${
                    isCurrent ? "bg-ink text-paper" : isDone ? "text-ink" : "text-muted"
                  }`}
                >
                  {(isDone || isCurrent) && (
                    <span
                      aria-hidden="true"
                      className="gold-foil absolute left-0 top-0 h-[2px] w-full"
                    />
                  )}
                  <span className="block font-mono text-[11px] uppercase tracking-widest">
                    {String(index + 1).padStart(2, "0")}
                    {isDone ? " ✓" : ""}
                  </span>
                  <span className="block truncate text-sm font-semibold">
                    {step.title}
                  </span>
                </li>
              );
            })}
          </ol>

          {!steps[stepIndex].isReview && (
            <div className="space-y-6">
              {stepIndex === 0 && (
                <QuantityInput
                  maxQuantity={maxQuantity}
                  quantity={quantity}
                  onChange={setQuantity}
                />
              )}
              {steps[stepIndex].fields.map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={answers[field.key]}
                  error={fieldErrors[`answers.${field.key}`]?.[0]}
                  onChange={(value) => setAnswer(field.key, value)}
                />
              ))}
            </div>
          )}

          {steps[stepIndex].isReview && (
            <div className="border border-ink bg-surface">
              <h2 className="border-b border-line px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted">
                Review your reservation
              </h2>
              <dl className="divide-y divide-line px-5">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-sm text-muted">Experience</dt>
                  <dd className="text-sm font-semibold">{type?.name}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-sm text-muted">When</dt>
                  <dd className="font-mono text-sm tabular-nums">
                    {formatDate(slot.starts_at)}, {formatTime(slot.starts_at)}–
                    {formatTime(slot.ends_at)} UTC
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-sm text-muted">Seats</dt>
                  <dd className="font-mono text-sm tabular-nums">{quantity}</dd>
                </div>
                {fields.map((field) => {
                  const value = answers[field.key];
                  const display = Array.isArray(value)
                    ? value.join(", ")
                    : value === true
                      ? "Yes"
                      : ((value as string) ?? "");

                  return (
                    <div key={field.key} className="flex justify-between gap-4 py-3">
                      <dt className="text-sm text-muted">{field.label}</dt>
                      <dd className="max-w-[60%] truncate text-sm">
                        {display || "—"}
                      </dd>
                    </div>
                  );
                })}
                {Number(slot.price) > 0 && (
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-sm font-semibold">Estimated total</dt>
                    <dd className="gold-foil-text font-display text-lg font-semibold tabular-nums">
                      {formatMoney(Number(slot.price) * quantity)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {formError && (
            <p className="mt-6 border-l-2 border-accent pl-4 text-sm" role="alert">
              {formError}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {stepIndex > 0 && (
              <button
                type="button"
                disabled={submitting}
                onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
                className="cursor-pointer border border-ink px-6 py-4 font-semibold uppercase tracking-wide transition-colors hover:border-accent hover:text-accent disabled:cursor-default disabled:opacity-50"
              >
                ← Back
              </button>
            )}

            {!steps[stepIndex].isReview && (
              <button
                type="button"
                onClick={handleNext}
                className="cursor-pointer bg-ink px-8 py-4 font-semibold uppercase tracking-wide text-paper transition-colors hover:text-champagne"
              >
                Next →
              </button>
            )}

            {steps[stepIndex].isReview && (
              <button
                type="button"
                disabled={submitting}
                onClick={() => void submit()}
                className="cursor-pointer bg-ink px-8 py-4 font-semibold uppercase tracking-wide text-paper transition-colors hover:text-champagne disabled:cursor-default disabled:opacity-50"
              >
                {submitLabel}
              </button>
            )}

            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {paysUpfront ? "Held 15 minutes, then released" : "No payment needed today"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function QuantityInput({
  maxQuantity,
  quantity,
  onChange,
}: {
  maxQuantity: number;
  quantity: number;
  onChange: (value: number) => void;
}) {
  if (maxQuantity <= 1) return null;

  return (
    <div>
      <label htmlFor="quantity" className="mb-1 block text-sm font-medium">
        Seats
      </label>
      <select
        id="quantity"
        className="w-full border border-ink bg-surface px-3 py-2 rounded-none"
        value={quantity}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );
}

function FieldInput({
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
  const inputClasses = "w-full border border-ink bg-surface px-3 py-2 rounded-none";

  return (
    <div>
      {field.type !== "checkbox" && (
        <label htmlFor={field.key} className="mb-1 block text-sm font-medium">
          {field.label}
          {field.required && <span className="text-accent"> *</span>}
        </label>
      )}

      {field.type === "textarea" && (
        <textarea
          id={field.key}
          rows={4}
          className={inputClasses}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "select" && (
        <select
          id={field.key}
          className={inputClasses}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Choose…</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {field.type === "multiselect" && (
        <fieldset id={field.key} className="space-y-2 border border-line p-3">
          {field.options.map((option) => {
            const selected = Array.isArray(value) && value.includes(option.value);

            return (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-[#a8873c]"
                  checked={selected}
                  onChange={(e) => {
                    const current = Array.isArray(value) ? value : [];
                    onChange(
                      e.target.checked
                        ? [...current, option.value]
                        : current.filter((v) => v !== option.value),
                    );
                  }}
                />
                {option.label}
              </label>
            );
          })}
        </fieldset>
      )}

      {field.type === "checkbox" && (
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="accent-[#a8873c]"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
          />
          {field.label}
          {field.required && <span className="text-accent"> *</span>}
        </label>
      )}

      {(field.type === "text" || field.type === "number" || field.type === "date") && (
        <input
          id={field.key}
          type={field.type}
          inputMode={field.type === "number" ? "numeric" : undefined}
          className={inputClasses}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {error && (
        <p className="mt-1 text-sm text-accent" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

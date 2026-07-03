"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">
        Something went wrong
      </p>
      <h1 className="mb-3 font-display text-4xl font-semibold tracking-tight">
        This page couldn&apos;t load.
      </h1>
      <p className="mb-6 max-w-md text-muted">
        Your data is safe — nothing was booked or charged. Retry, or come back
        in a moment.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="cursor-pointer border border-ink px-6 py-3 font-semibold transition-colors hover:border-accent hover:text-accent"
      >
        Try again →
      </button>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const { login, register } = useAuth();

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      if (isRegister) {
        await register(values);
      } else {
        await login(values.email, values.password);
      }
      router.push(next);
    } catch (error: unknown) {
      setSubmitting(false);

      if (error instanceof ApiError) {
        setFieldErrors(error.errors);
        setFormError(Object.keys(error.errors).length ? null : error.message);
        return;
      }

      setFormError("Something went wrong. Try again.");
    }
  }

  const inputClasses = "w-full border border-ink bg-surface px-3 py-2 rounded-none";

  function fieldError(key: string) {
    const errors = fieldErrors[key];
    return errors ? (
      <p className="mt-1 text-sm text-accent" role="alert">
        {errors[0]}
      </p>
    ) : null;
  }

  return (
    <div className="rf-fade-up mx-auto max-w-md px-4 py-16 sm:px-0">
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">
        {isRegister ? "New account" : "Welcome back"}
      </p>
      <h1 className="mb-8 font-display text-4xl font-semibold tracking-tight">
        {isRegister ? "Create your account." : "Sign in."}
      </h1>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {isRegister && (
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Name <span className="text-accent">*</span>
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              className={inputClasses}
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            />
            {fieldError("name")}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email <span className="text-accent">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className={inputClasses}
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          />
          {fieldError("email")}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password <span className="text-accent">*</span>
          </label>
          <input
            id="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
            className={inputClasses}
            value={values.password}
            onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
          />
          {fieldError("password")}
        </div>

        {isRegister && (
          <div>
            <label
              htmlFor="password_confirmation"
              className="mb-1 block text-sm font-medium"
            >
              Confirm password <span className="text-accent">*</span>
            </label>
            <input
              id="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              className={inputClasses}
              value={values.password_confirmation}
              onChange={(e) =>
                setValues((v) => ({ ...v, password_confirmation: e.target.value }))
              }
            />
          </div>
        )}

        {formError && (
          <p className="border-l-2 border-accent pl-4 text-sm" role="alert">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full cursor-pointer bg-ink px-6 py-3 font-semibold uppercase tracking-wide text-paper transition-colors hover:text-champagne disabled:cursor-default disabled:opacity-50"
        >
          {submitting
            ? isRegister
              ? "Creating account…"
              : "Signing in…"
            : isRegister
              ? "Create account →"
              : "Sign in →"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {isRegister ? "Already registered? " : "No account yet? "}
        <Link
          href={`${isRegister ? "/login" : "/register"}?next=${encodeURIComponent(next)}`}
          className="font-medium text-accent"
        >
          {isRegister ? "Sign in" : "Create one"} →
        </Link>
      </p>
    </div>
  );
}

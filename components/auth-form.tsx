"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { LineArt } from "@/components/line-art";
import { Ms } from "@/components/icon";
import { EmailInput, PasswordInput, TextInput } from "@/components/ui/form/inputs";

interface AuthFormProps {
  mode: "login" | "register";
}

const AUTH_IMAGE =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&q=75&auto=format&fit=crop";

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


  return (
    <div className="rz mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="relative grid min-h-[560px] grid-cols-1 overflow-hidden rounded-[calc(var(--r)+6px)] border border-[var(--panel-border)] bg-surface shadow-[0_40px_80px_-46px_rgba(60,45,30,0.42)] lg:grid-cols-2">
        {/* form */}
        <div className="relative z-10 flex flex-col justify-center p-8 sm:p-12">
          <LineArt opacity={0.5} />
          <div className="rz-mono mb-3 text-[10.5px] uppercase tracking-[0.2em] text-accent-deep">
            {isRegister ? "Join Réserve" : "Welcome back"}
          </div>
          <h1 className="rz-serif mb-2 text-4xl font-semibold leading-tight">
            {isRegister ? "Create your account" : "Sign in to Réserve"}
          </h1>
          <p className="mb-7 text-[14.5px] text-muted">
            {isRegister
              ? "Save reservations, earn points and unlock member perks."
              : "Access your reservations, vouchers and member tier."}
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {isRegister && (
              <TextInput
                label="Full name"
                required
                autoComplete="name"
                value={values.name}
                error={fieldErrors.name?.[0]}
                onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              />
            )}
            <EmailInput
              label="Email"
              required
              value={values.email}
              error={fieldErrors.email?.[0]}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            />
            <PasswordInput
              label="Password"
              required
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={values.password}
              error={fieldErrors.password?.[0]}
              onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
            />
            {isRegister && (
              <PasswordInput
                label="Confirm password"
                required
                autoComplete="new-password"
                value={values.password_confirmation}
                onChange={(e) =>
                  setValues((v) => ({ ...v, password_confirmation: e.target.value }))
                }
              />
            )}

            {formError && (
              <p className="text-sm text-danger" role="alert">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-[var(--r-sm)] py-3.5 text-[15px] font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--accent-deep)" }}
            >
              {submitting
                ? "Working…"
                : isRegister
                  ? "Create account"
                  : "Sign in"}
              <Ms name="arrow_forward" style={{ fontSize: 18 }} />
            </button>
          </form>

          <p className="mt-5 text-[13.5px] text-muted">
            {isRegister ? "Already a member? " : "New to Réserve? "}
            <Link
              href={`${isRegister ? "/login" : "/register"}?next=${encodeURIComponent(next)}`}
              className="font-semibold underline"
              style={{ color: "var(--accent-deep)" }}
            >
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>

        {/* image panel */}
        <div className="relative hidden min-h-[300px] bg-panel lg:block">
          <Image src={AUTH_IMAGE} alt="" fill sizes="50vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
          <div className="absolute inset-x-8 bottom-9">
            <div className="rz-serif mb-2.5 text-2xl font-medium italic leading-snug text-white">
              &ldquo;The details are not the details. They make the
              reservation.&rdquo;
            </div>
            <div className="rz-mono text-[10px] uppercase tracking-[0.14em] text-white/85">
              Réserve members save 12% on average
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

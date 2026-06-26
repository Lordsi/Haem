"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { signIn, type LoginState } from "./actions";

const INITIAL: LoginState = { status: "idle" };

const FIELD =
  "text-body-md text-on-surface placeholder:text-on-surface-variant/50 w-full border-0 border-b border-outline-variant bg-transparent pb-2 pt-1 transition-colors focus:border-primary focus:outline-none focus:ring-0";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signIn, INITIAL);

  return (
    <form action={action} className="space-y-lg text-left">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div>
        <label
          htmlFor="email"
          className="text-body-sm text-on-surface-variant mb-xs block font-medium"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={FIELD}
          placeholder="you@hospital.org"
        />
      </div>

      <div>
        <div className="mb-xs flex items-baseline justify-between gap-md">
          <label
            htmlFor="password"
            className="text-body-sm text-on-surface-variant font-medium"
          >
            Password
          </label>
          <Link
            href="/contact"
            className="text-tertiary text-body-sm font-semibold hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={FIELD}
        />
      </div>

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="bg-error-container text-on-error-container text-body-sm rounded-lg px-md py-sm"
        >
          {state.message}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="mt-md w-full rounded-xl"
        disabled={pending}
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-body-sm text-on-surface-variant pt-sm text-center">
        Need access?{" "}
        <Link
          href="/contact"
          className="text-primary font-semibold hover:underline"
        >
          Contact the department
        </Link>
      </p>
    </form>
  );
}

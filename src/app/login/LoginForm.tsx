"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { signIn, type LoginState } from "./actions";

const INITIAL: LoginState = { status: "idle" };

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signIn, INITIAL);

  return (
    <form action={action} className="space-y-md text-left">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div>
        <label
          htmlFor="email"
          className="text-label-md text-on-surface-variant mb-xs block uppercase"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="border-outline-variant bg-surface-container-lowest text-body-md w-full rounded-lg border px-md py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="you@hospital.org"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-label-md text-on-surface-variant mb-xs block uppercase"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="border-outline-variant bg-surface-container-lowest text-body-md w-full rounded-lg border px-md py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
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

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-body-sm text-on-surface-variant text-center">
        <Link
          href="/"
          className="text-primary inline-flex items-center gap-xs font-semibold hover:underline"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          Back to home
        </Link>
      </p>
    </form>
  );
}

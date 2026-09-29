"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="dk-gate-form">
      <input type="hidden" name="next" value={next} />
      <label htmlFor="dk-password" className="dk-field-label">
        Password
      </label>
      <input
        id="dk-password"
        name="password"
        type="password"
        className="dk-input"
        autoComplete="current-password"
        required
        autoFocus
        aria-invalid={state.error ? true : undefined}
        aria-describedby={state.error ? "dk-login-error" : undefined}
      />
      {state.error && (
        <p id="dk-login-error" className="dk-alert" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className="dk-btn dk-btn-solid dk-btn-lg" disabled={pending}>
        {pending ? "Opening…" : "Open the desk"}
      </button>
    </form>
  );
}

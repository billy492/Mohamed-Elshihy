"use client";

import { useActionState, useId } from "react";
import { joinWaitlist, type WaitlistState } from "./actions";

export default function WaitlistForm({ program, name }: { program: string; name: string }) {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlist, {});
  const id = useId();
  if (state.ok) {
    return (
      <p className="wl-done" role="status">
        You&apos;re on the list for {name}. You&apos;ll hear first when it opens.
      </p>
    );
  }
  return (
    <form action={action} className="wl" noValidate>
      <label htmlFor={`${id}-email`} className="wl-label">
        Join the waitlist
      </label>
      <div className="wl-row">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@email.com"
          required
          aria-invalid={Boolean(state.error) || undefined}
          aria-describedby={state.error ? `${id}-err` : undefined}
        />
        <input type="hidden" name="program" value={program} />
        <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
        <button type="submit" className="btn btn-solid wl-btn" disabled={pending}>
          <span className="btn-icon" aria-hidden="true" />
          {pending ? "Joining…" : "Join"}
        </button>
      </div>
      {state.error ? (
        <p id={`${id}-err`} className="field-error" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

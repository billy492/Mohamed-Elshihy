"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { coachingSchema, mentorshipSchema, fieldErrors, type Track } from "@/lib/apply/schema";
import { submitApplication, type SubmitResult } from "@/app/(focus)/apply/actions";
import { stepsFor, type Field, type Step } from "./steps";
import { site } from "@/content/site";

type Answers = Record<string, unknown>;
type Done = Extract<SubmitResult, { ok: true }>;

const draftKey = (track: Track) => `shihy:apply:${track}`;

function readDraft(track: Track): Answers | null {
  try {
    const raw = window.localStorage.getItem(draftKey(track));
    return raw ? (JSON.parse(raw) as Answers) : null;
  } catch {
    return null;
  }
}
function writeDraft(track: Track, a: Answers) {
  try {
    window.localStorage.setItem(draftKey(track), JSON.stringify(a));
  } catch {}
}
function clearDraft(track: Track) {
  try {
    window.localStorage.removeItem(draftKey(track));
  } catch {}
}

function validateStep(track: Track, step: Step, answers: Answers): Record<string, string> {
  const schema = track === "coaching" ? coachingSchema : mentorshipSchema;
  const keys = Object.fromEntries(step.fields.map((f) => [f.name, true as const]));
  const result = (schema as typeof coachingSchema).pick(keys as never).safeParse(answers);
  return result.success ? {} : fieldErrors(result.error);
}

export default function ApplyFlow({
  initialTrack,
  initialPathway,
  plate,
}: {
  initialTrack: Track;
  initialPathway?: string;
  plate: React.ReactNode;
}) {
  const [track] = useState<Track>(initialTrack);
  const steps = useMemo(() => stepsFor(track), [track]);
  const [answers, setAnswers] = useState<Answers>(() =>
    initialPathway ? { track: initialTrack, pathway: initialPathway } : { track: initialTrack },
  );
  const [stepIndex, setStepIndex] = useState(initialTrack === "coaching" && initialPathway ? 1 : 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [pending, startTransition] = useTransition();
  const startedAt = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const isLast = stepIndex === steps.length - 1;

  // Restore a saved draft once, on arrival.
  useEffect(() => {
    startedAt.current = Date.now();
    const draft = readDraft(initialTrack);
    if (draft && Object.keys(draft).length > 2) {
      // localStorage only exists after hydration, so the draft can't be read
      // during render without a server/client mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswers((a) => ({ ...draft, ...a, track: initialTrack }));
      setRestored(true);
    }
  }, [initialTrack]);

  useEffect(() => {
    if (!done) writeDraft(track, answers);
  }, [answers, track, done]);

  // Move focus to the step's title so keyboard and screen-reader users land in the right place.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    titleRef.current?.focus({ preventScroll: true });
    const top = document.getElementById("apply-form")?.getBoundingClientRect().top ?? 0;
    if (top < 0) window.scrollTo({ top: window.scrollY + top - 24, behavior: "smooth" });
  }, [stepIndex, done]);

  // The plate gains an exposure with every completed step.
  useEffect(() => {
    const shots = sideRef.current?.querySelectorAll<SVGGElement>(".plate-shot");
    if (!shots?.length) return;
    const shown = done ? shots.length : Math.max(1, Math.round((stepIndex / steps.length) * shots.length));
    shots.forEach((s, i) => s.classList.toggle("is-hidden", i >= shown));
  }, [stepIndex, steps.length, done]);

  const set = useCallback((name: string, value: unknown) => {
    setAnswers((a) => ({ ...a, [name]: value }));
    setErrors((e) => {
      if (!e[name]) return e;
      const next = { ...e };
      delete next[name];
      return next;
    });
  }, []);

  const next = () => {
    const found = validateStep(track, step, answers);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = step.fields.find((f) => found[f.name]);
      if (first) document.getElementById(`f-${first.name}`)?.focus();
      return;
    }
    if (!isLast) {
      setStepIndex((i) => i + 1);
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result = await submitApplication(
        { ...answers, track },
        { startedAt: startedAt.current, company: honeypot.current?.value || undefined },
      );
      if (result.ok) {
        clearDraft(track);
        setDone(result);
        return;
      }
      if (result.errors) {
        setErrors(result.errors);
        const bad = steps.findIndex((s) => s.fields.some((f) => result.errors![f.name]));
        if (bad >= 0) setStepIndex(bad);
      }
      setMessage(result.message ?? "A few answers need another look.");
    });
  };

  const back = () => {
    setErrors({});
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const startOver = () => {
    clearDraft(track);
    setAnswers({ track });
    setRestored(false);
    setStepIndex(0);
    setErrors({});
  };

  return (
    <div className="apply">
      <aside ref={sideRef} className="apply-side" data-theme="plate">
        <div className="apply-side-top">
          <Link href="/" className="wordmark" aria-label={`${site.short}, home`}>
            <span className="wordmark-name">{site.short}</span>
            <span className="wordmark-dot" aria-hidden="true" />
          </Link>
          <Link href="/" className="apply-exit">
            Back to the site
          </Link>
        </div>

        <div className="apply-side-mid">
          <p className="apply-kicker">Apply</p>
          {/* Mentorship is coming soon: coaching is the only track for now. */}
          <ol className="apply-steps" aria-label="Steps">
            {steps.map((s, i) => (
              <li
                key={s.id}
                className="apply-step"
                data-state={done || i < stepIndex ? "done" : i === stepIndex ? "current" : "todo"}
                aria-current={!done && i === stepIndex ? "step" : undefined}
              >
                <span className="apply-step-n">{i + 1}</span>
                <span>{s.nav}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="apply-side-plate">{plate}</div>
        <p className="apply-side-note">
          Only Shihy reads applications. Nothing you write here is shared or published.
        </p>
      </aside>

      <section id="apply-form" className="apply-main" data-theme="print" aria-live="polite">
        {done ? (
          <div className="apply-done">
            <h1 ref={titleRef} tabIndex={-1} className="apply-title">
              Application received{done.firstName ? `, ${done.firstName}` : ""}.
            </h1>
            <p className="apply-lede">
              Shihy reads every application himself. If it&apos;s a fit, you&apos;ll hear back directly on WhatsApp
              or email.
            </p>
            <dl className="apply-ref">
              <dt>Your reference</dt>
              <dd>{done.ref}</dd>
            </dl>
            <div className="apply-done-actions">
              <Link href="/" className="btn btn-solid">
                <span className="btn-icon" aria-hidden="true" />
                Back to the site
              </Link>
              <a className="text-link" href={site.social.instagram.href} target="_blank" rel="noopener">
                Follow {site.social.instagram.handle} while you wait
              </a>
            </div>
          </div>
        ) : (
          <form
            className="apply-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              next();
            }}
          >
            <p className="apply-count">
              Step {stepIndex + 1} of {steps.length}
            </p>
            <div className="apply-progress" aria-hidden="true">
              <span style={{ transform: `scaleX(${(stepIndex + 1) / steps.length})` }} />
            </div>

            {restored && stepIndex === 0 && (
              <p className="apply-restored">
                Your answers from last time are still here.{" "}
                <button type="button" className="text-link as-link" onClick={startOver}>
                  Start over
                </button>
              </p>
            )}

            <div key={`${track}-${step.id}`} className="apply-step-body">
              <h1 ref={titleRef} tabIndex={-1} className="apply-title">
                {step.title}
              </h1>
              {step.intro && <p className="apply-lede">{step.intro}</p>}

              <div className="apply-fields">
                {step.fields.map((f) => (
                  <FieldView key={f.name} field={f} value={answers[f.name]} error={errors[f.name]} onChange={set} />
                ))}
              </div>
            </div>

            {/* Invisible to people, irresistible to bots. */}
            <div className="hp" aria-hidden="true">
              <label>
                Company
                <input ref={honeypot} type="text" name="company" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            {message && (
              <p className="apply-message" role="alert">
                {message}
              </p>
            )}

            <div className="apply-actions">
              {stepIndex > 0 ? (
                <button type="button" className="apply-back" onClick={back} disabled={pending}>
                  Back
                </button>
              ) : (
                <span />
              )}
              <button type="submit" className="btn btn-solid apply-next" disabled={pending}>
                <span className="btn-icon" aria-hidden="true" />
                {isLast ? (pending ? "Sending…" : "Send application") : "Continue"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function FieldView({
  field,
  value,
  error,
  onChange,
}: {
  field: Field;
  value: unknown;
  error?: string;
  onChange: (name: string, v: unknown) => void;
}) {
  const uid = useId();
  const id = `f-${field.name}`;
  const errId = `${uid}-err`;
  const hintId = `${uid}-hint`;
  const describedBy = [("hint" in field && field.hint) ? hintId : "", error ? errId : ""].filter(Boolean).join(" ") || undefined;
  const err = error ? (
    <p id={errId} className="field-error">
      {error}
    </p>
  ) : null;

  if (field.kind === "choice") {
    const selected = field.multiple ? ((value as string[] | undefined) ?? []) : (value as string | undefined);
    const toggle = (optionId: string) => {
      if (!field.multiple) return onChange(field.name, optionId);
      const list = selected as string[];
      if (list.includes(optionId)) onChange(field.name, list.filter((x) => x !== optionId));
      else if (!field.max || list.length < field.max) onChange(field.name, [...list, optionId]);
    };
    return (
      <fieldset className={`field choice choice-${field.layout ?? "chips"}`} aria-describedby={describedBy} data-invalid={Boolean(error) || undefined}>
        <legend className="field-label">{field.label}</legend>
        {field.hint && (
          <p id={hintId} className="field-hint">
            {field.hint}
          </p>
        )}
        <div className="choice-options">
          {field.options.map((o, i) => {
            const on = field.multiple ? (selected as string[]).includes(o.id) : selected === o.id;
            return (
              <label key={o.id} className="choice-option" data-on={on || undefined}>
                <input
                  id={i === 0 ? id : undefined}
                  type={field.multiple ? "checkbox" : "radio"}
                  name={field.name}
                  value={o.id}
                  checked={on}
                  onChange={() => toggle(o.id)}
                />
                <span className="choice-text">
                  <span className="choice-label">{o.label}</span>
                  {field.layout === "cards" && o.hint && <span className="choice-hint">{o.hint}</span>}
                </span>
              </label>
            );
          })}
        </div>
        {err}
      </fieldset>
    );
  }

  if (field.kind === "scale") {
    const v = typeof value === "number" ? value : undefined;
    return (
      <fieldset className="field scale-field" aria-describedby={describedBy} data-invalid={Boolean(error) || undefined}>
        <legend className="field-label">{field.label}</legend>
        <div className="scale-options">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <label key={n} className="scale-option" data-on={v === n || undefined} data-under={v !== undefined && n < v ? "" : undefined}>
              <input
                id={n === 1 ? id : undefined}
                type="radio"
                name={field.name}
                value={n}
                checked={v === n}
                onChange={() => onChange(field.name, n)}
              />
              <span>{n}</span>
            </label>
          ))}
        </div>
        <div className="scale-ends">
          <span>{field.low}</span>
          <span>{field.high}</span>
        </div>
        {err}
      </fieldset>
    );
  }

  if (field.kind === "consent") {
    return (
      <div className="field consent" data-invalid={Boolean(error) || undefined}>
        <label className="consent-label">
          <input
            id={id}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(field.name, e.target.checked ? true : undefined)}
            aria-describedby={describedBy}
          />
          <span>
            Shihy can keep my answers to review this application and contact me about it. See the{" "}
            <a href="/privacy" target="_blank" rel="noopener" className="text-link">
              privacy note
            </a>
            .
          </span>
        </label>
        {err}
      </div>
    );
  }

  const common = {
    id,
    name: field.name,
    value: typeof value === "string" || typeof value === "number" ? String(value) : "",
    "aria-invalid": Boolean(error) || undefined,
    "aria-describedby": describedBy,
  } as const;

  return (
    <div className={`field text-field${field.kind === "text" && field.width === "short" ? " is-short" : ""}`}>
      <label className="field-label" htmlFor={id}>
        {field.label}
        {field.optional && <span className="field-optional"> (optional)</span>}
      </label>
      {field.hint && (
        <p id={hintId} className="field-hint">
          {field.hint}
        </p>
      )}
      {field.kind === "textarea" ? (
        <textarea {...common} rows={field.rows ?? 4} onChange={(e) => onChange(field.name, e.target.value)} />
      ) : (
        <>
          <input
            {...common}
            type={field.type ?? "text"}
            inputMode={field.inputMode}
            autoComplete={field.autoComplete ?? "off"}
            placeholder={field.placeholder}
            list={field.suggestions ? `${id}-list` : undefined}
            onChange={(e) => onChange(field.name, e.target.value)}
          />
          {field.suggestions && (
            <datalist id={`${id}-list`}>
              {field.suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          )}
        </>
      )}
      {err}
    </div>
  );
}

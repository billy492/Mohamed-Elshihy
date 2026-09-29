"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useOptimistic,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { setStarred, setStatus } from "../actions";
import { STATUSES } from "@/lib/apply/options";
import type { Status } from "@/lib/apply/schema";
import { STATUS_KEYS } from "./shortcuts";

// Triage state for one application, shared by the controls scattered through
// the detail page (star, status buttons, mobile bar, keyboard). Changes show
// at once (optimistic) and the server action's revalidation then confirms
// them; if a save fails the UI falls back to the stored value and says so.

type Links = { prevHref: string | null; nextHref: string | null; listHref: string };

type TriageState = Links & {
  status: Status;
  starred: boolean;
  choose: (next: Status) => void;
  toggleStar: () => void;
  navigating: boolean;
};

const TriageContext = createContext<TriageState | null>(null);

function useTriage(): TriageState {
  const ctx = useContext(TriageContext);
  if (!ctx) throw new Error("Triage controls must be rendered inside <Triage>.");
  return ctx;
}

const STATUS_BY_KEY: Record<string, Status> = Object.fromEntries(
  Object.entries(STATUS_KEYS).map(([status, key]) => [String(key).toLowerCase(), status as Status]),
);

const FAILED = "That change didn't save. Check the connection and try again.";

export function Triage({
  id,
  status,
  starred,
  prevHref,
  nextHref,
  listHref,
  children,
}: Links & { id: string; status: Status; starred: boolean; children: ReactNode }) {
  const router = useRouter();
  const [shownStatus, showStatus] = useOptimistic(status);
  const [shownStar, showStar] = useOptimistic(starred);
  const [, startSaving] = useTransition();
  const [navigating, startNavigating] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function choose(next: Status) {
    if (next === shownStatus) return;
    setError(null);
    startSaving(async () => {
      showStatus(next);
      try {
        await setStatus(id, next);
      } catch {
        setError(FAILED);
      }
    });
  }

  function toggleStar() {
    const next = !shownStar;
    setError(null);
    startSaving(async () => {
      showStar(next);
      try {
        await setStarred(id, next);
      } catch {
        setError(FAILED);
      }
    });
  }

  // Desktop shortcuts. Ignored while typing in a field, and whenever a modifier
  // is held, so Cmd+R still reloads and Cmd+F still finds.
  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.isComposing) return;
    const target = e.target as HTMLElement | null;
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;

    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === "j" || key === "ArrowRight") {
      if (nextHref) {
        e.preventDefault();
        startNavigating(() => router.push(nextHref));
      }
    } else if (key === "k" || key === "ArrowLeft") {
      if (prevHref) {
        e.preventDefault();
        startNavigating(() => router.push(prevHref));
      }
    } else if (key === "f") {
      e.preventDefault();
      toggleStar();
    } else if (STATUS_BY_KEY[key]) {
      e.preventDefault();
      choose(STATUS_BY_KEY[key]);
    }
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKeyDown(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const value: TriageState = {
    status: shownStatus,
    starred: shownStar,
    choose,
    toggleStar,
    navigating,
    prevHref,
    nextHref,
    listHref,
  };

  return (
    <TriageContext value={value}>
      {children}
      {error && (
        <div className="dk-toast" role="alert">
          <span>{error}</span>
          <button type="button" className="dk-toast-close" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}
    </TriageContext>
  );
}

export function StarToggle() {
  const { starred, toggleStar } = useTriage();
  return (
    <button type="button" className="dk-starbtn" aria-pressed={starred} aria-keyshortcuts="F" onClick={toggleStar}>
      <span className="dk-starbtn-icon" aria-hidden="true">
        {starred ? "★" : "☆"}
      </span>
      Star
    </button>
  );
}

export function StatusControl() {
  const { status, choose } = useTriage();
  return (
    <div className="dk-status" role="group" aria-labelledby="dk-status-h">
      {STATUSES.map((s) => {
        const key = STATUS_KEYS[s.id];
        return (
          <button
            key={s.id}
            type="button"
            className="dk-status-btn"
            data-status={s.id}
            aria-pressed={status === s.id}
            aria-keyshortcuts={key}
            onClick={() => choose(s.id)}
          >
            {s.label}
            {key && (
              <kbd className="dk-hint" aria-hidden="true">
                {key}
              </kbd>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** "‹ Prev · 4 / 17 · Next ›" plus the way back to the (filtered) list. */
export function Pager({ position, total }: { position: number; total: number }) {
  const { prevHref, nextHref, listHref, navigating } = useTriage();
  return (
    <nav className="dk-pager" aria-label="Applications in this view">
      <Link href={listHref} className="dk-pager-link">
        <span aria-hidden="true">←</span> List
      </Link>
      <span className="dk-pager-pos" title={position ? undefined : "Not in this view any more"}>
        {navigating ? "Loading…" : `${position || "–"} / ${total}`}
      </span>
      <span className="dk-pager-steps">
        {prevHref ? (
          <Link href={prevHref} prefetch className="dk-pager-link" aria-keyshortcuts="K">
            <span aria-hidden="true">‹</span> Prev
          </Link>
        ) : (
          <span className="dk-pager-link" aria-disabled="true">
            <span aria-hidden="true">‹</span> Prev
          </span>
        )}
        {nextHref ? (
          <Link href={nextHref} prefetch className="dk-pager-link" aria-keyshortcuts="J">
            Next <span aria-hidden="true">›</span>
          </Link>
        ) : (
          <span className="dk-pager-link" aria-disabled="true">
            Next <span aria-hidden="true">›</span>
          </span>
        )}
      </span>
    </nav>
  );
}

/** Phone only: the three things done most, always under the thumb. */
export function MobileBar() {
  const { status, choose, nextHref, listHref } = useTriage();
  return (
    <div className="dk-mbar">
      <button
        type="button"
        className="dk-mbar-btn dk-mbar-shortlist"
        aria-pressed={status === "shortlisted"}
        onClick={() => choose("shortlisted")}
      >
        Shortlist
      </button>
      <button
        type="button"
        className="dk-mbar-btn dk-mbar-decline"
        aria-pressed={status === "declined"}
        onClick={() => choose("declined")}
      >
        Decline
      </button>
      {nextHref ? (
        <Link href={nextHref} prefetch className="dk-mbar-btn dk-mbar-next">
          Next <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <Link href={listHref} className="dk-mbar-btn dk-mbar-next">
          List <span aria-hidden="true">↩</span>
        </Link>
      )}
    </div>
  );
}

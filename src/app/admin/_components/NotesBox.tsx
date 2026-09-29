"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { saveNotes } from "../actions";

// Shihy's private notes on an application. Saves itself ~800ms after typing
// stops, straight away when the box loses focus, and on the way out when he
// jumps to another application; the browser warns before closing the tab
// while something is still unsaved.

const DELAY = 800;
const MAX = 4000;

type Save = { kind: "idle" } | { kind: "saving" } | { kind: "saved"; at: string } | { kind: "error" };

const clock = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function NotesBox({ id, initial }: { id: string; initial: string }) {
  const [value, setValue] = useState(initial);
  const [save, setSave] = useState<Save>({ kind: "idle" });
  // Mutable bookkeeping, only touched in handlers and effects.
  const box = useRef({ timer: 0, latest: initial, stored: initial, seq: 0, lastAt: "" });

  async function flush() {
    const b = box.current;
    window.clearTimeout(b.timer);
    const text = b.latest;
    if (text === b.stored) {
      setSave(b.lastAt ? { kind: "saved", at: b.lastAt } : { kind: "idle" });
      return;
    }
    const mine = ++b.seq;
    setSave({ kind: "saving" });
    try {
      const { savedAt } = await saveNotes(id, text);
      b.stored = text;
      b.lastAt = savedAt;
      if (mine === b.seq) setSave(b.latest === text ? { kind: "saved", at: savedAt } : { kind: "saving" });
    } catch {
      if (mine === b.seq) setSave({ kind: "error" });
    }
  }

  function onChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const b = box.current;
    const text = e.target.value;
    setValue(text);
    b.latest = text;
    setSave({ kind: "saving" });
    window.clearTimeout(b.timer);
    b.timer = window.setTimeout(() => void flush(), DELAY);
  }

  useEffect(() => {
    const b = box.current;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (b.latest === b.stored) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      // Leaving for another application mid-sentence: save what's there.
      window.clearTimeout(b.timer);
      if (b.latest !== b.stored) void saveNotes(id, b.latest).catch(() => {});
    };
  }, [id]);

  return (
    <div className="dk-notes">
      <label htmlFor={`dk-notes-${id}`} className="dk-h">
        Private notes
      </label>
      <textarea
        id={`dk-notes-${id}`}
        value={value}
        onChange={onChange}
        onBlur={() => void flush()}
        maxLength={MAX}
        rows={6}
        dir="auto"
        placeholder="Only you see these. What stood out, what to ask, the next step."
      />
      <p className="dk-save" data-state={save.kind} aria-live="polite">
        {save.kind === "saving" && "Saving…"}
        {save.kind === "saved" && `Saved ${clock(save.at)}`}
        {save.kind === "idle" && "Saves as you type"}
        {save.kind === "error" && (
          <>
            Not saved.{" "}
            <button type="button" className="dk-save-retry" onClick={() => void flush()}>
              Try again
            </button>
          </>
        )}
      </p>
    </div>
  );
}

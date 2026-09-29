"use client";

import { useEffect, useRef, useState } from "react";

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // navigator.clipboard only exists on secure origins; this also covers
    // opening the dev server from a phone on the LAN.
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

/** A small COPY button; `label` names what gets copied, for screen readers. */
export default function CopyButton({ value, label, text = "Copy" }: { value: string; label: string; text?: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  async function onClick() {
    const ok = await copyText(value);
    setState(ok ? "done" : "failed");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1600);
  }

  return (
    <>
      <button type="button" className="dk-copy" data-state={state} onClick={onClick} aria-label={`${text}: ${label}`}>
        {state === "done" ? "Copied" : state === "failed" ? "Failed" : text}
      </button>
      <span className="dk-sr" aria-live="polite">
        {state === "done" ? `${label} copied` : state === "failed" ? `Couldn't copy ${label}` : ""}
      </span>
    </>
  );
}

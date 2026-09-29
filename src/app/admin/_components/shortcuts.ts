import type { Status } from "@/lib/apply/schema";

// Keyboard shortcuts on the detail page. Kept out of the client module so the
// server-rendered legend can read them too.

/** Shortcut per status. New has none, so nothing goes back to New by accident. */
export const STATUS_KEYS: Partial<Record<Status, string>> = {
  reviewing: "R",
  shortlisted: "S",
  contacted: "C",
  accepted: "A",
  declined: "D",
  archived: "X",
};

export const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["J", "→"], label: "Next" },
  { keys: ["K", "←"], label: "Previous" },
  { keys: ["R"], label: "Reviewing" },
  { keys: ["S"], label: "Shortlisted" },
  { keys: ["C"], label: "Contacted" },
  { keys: ["A"], label: "Accepted" },
  { keys: ["D"], label: "Declined" },
  { keys: ["X"], label: "Archived" },
  { keys: ["F"], label: "Star" },
];

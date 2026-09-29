import type { Application, Status } from "@/lib/apply/schema";
import { LEVELS, PATHWAYS, STATUSES } from "@/lib/apply/options";

// The list's filters live in the URL, so a filtered view can be bookmarked,
// shared between the list, the detail page (prev / next) and the CSV export.
// Pure functions only: safe to import from server and client components.

export type TrackFilter = "all" | "coaching" | "mentorship";
export type StatusFilter = "open" | "all" | Status;
export type SortKey = "newest" | "oldest" | "commitment";
type PathwayId = (typeof PATHWAYS)[number]["id"];
type LevelId = (typeof LEVELS)[number]["id"];

export type Filters = {
  track: TrackFilter;
  status: StatusFilter;
  pathway: PathwayId | "";
  level: LevelId | "";
  q: string;
  starred: boolean;
  sort: SortKey;
};

export type RawParams = Record<string, string | string[] | undefined>;

export const DEFAULT_FILTERS: Filters = {
  track: "all",
  status: "open",
  pathway: "",
  level: "",
  q: "",
  starred: false,
  sort: "newest",
};

export const TRACK_FILTERS = ["all", "coaching", "mentorship"] as const;
export const SORTS: { id: SortKey; label: string }[] = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "commitment", label: "Most committed" },
];

/** Declined and archived are done with; "open" is everything else. */
const CLOSED: readonly Status[] = ["declined", "archived"];
export const isOpen = (s: Status) => !CLOSED.includes(s);

const STATUS_IDS = STATUSES.map((s) => s.id);
const PATHWAY_IDS = PATHWAYS.map((p) => p.id);
const LEVEL_IDS = LEVELS.map((l) => l.id);

function oneOf<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Reads filters from page searchParams or a URLSearchParams; anything unknown falls back to the default. */
export function parseFilters(raw: RawParams | URLSearchParams): Filters {
  const get = (key: string): string => {
    if (raw instanceof URLSearchParams) return raw.get(key) ?? "";
    const v = raw[key];
    return (Array.isArray(v) ? v[0] : v) ?? "";
  };
  return {
    track: oneOf(get("track"), TRACK_FILTERS, "all"),
    status: oneOf<StatusFilter>(get("status"), ["open", "all", ...STATUS_IDS], "open"),
    pathway: oneOf<PathwayId | "">(get("pathway"), ["", ...PATHWAY_IDS], ""),
    level: oneOf<LevelId | "">(get("level"), ["", ...LEVEL_IDS], ""),
    q: get("q").trim().slice(0, 100),
    starred: get("starred") === "1",
    sort: oneOf(get("sort"), ["newest", "oldest", "commitment"] as const, "newest"),
  };
}

/** "?track=coaching&q=omar" (defaults left out), or "" when nothing is filtered. */
export function toQuery(f: Filters, patch: Partial<Filters> = {}): string {
  const x = { ...f, ...patch };
  const p = new URLSearchParams();
  if (x.track !== "all") p.set("track", x.track);
  if (x.status !== "open") p.set("status", x.status);
  if (x.pathway) p.set("pathway", x.pathway);
  if (x.level) p.set("level", x.level);
  if (x.q) p.set("q", x.q);
  if (x.starred) p.set("starred", "1");
  if (x.sort !== "newest") p.set("sort", x.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const isFiltered = (f: Filters) => toQuery({ ...f, sort: "newest" }) !== "";

function matchesStatus(a: Application, s: StatusFilter): boolean {
  if (s === "all") return true;
  if (s === "open") return isOpen(a.status);
  return a.status === s;
}

function matchesQuery(a: Application, q: string): boolean {
  const hay = [a.name, a.email, a.phone, a.problem, a.ref].join("\n").toLowerCase();
  const phoneDigits = a.phone.replace(/\D/g, "");
  // Every word has to appear somewhere. Phone numbers also match on digits
  // alone, so "1001234567" finds "+20 100 123 4567".
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => {
      if (hay.includes(term)) return true;
      const digits = term.replace(/\D/g, "");
      return digits.length >= 4 && digits.length === term.replace(/[\s()+-]/g, "").length && phoneDigits.includes(digits);
    });
}

/** Every filter except status (status is what the count pills break down). */
function matchesFacets(a: Application, f: Filters): boolean {
  if (f.track !== "all" && a.track !== f.track) return false;
  if (f.pathway && (a.track !== "coaching" || a.pathway !== f.pathway)) return false;
  if (f.level && (a.track !== "coaching" || a.level !== f.level)) return false;
  if (f.starred && !a.starred) return false;
  if (f.q && !matchesQuery(a, f.q)) return false;
  return true;
}

export const matches = (a: Application, f: Filters) => matchesFacets(a, f) && matchesStatus(a, f.status);

/** A total order (ties broken by id) so prev / next never skip or repeat. */
export function compareBy(sort: SortKey) {
  return (a: Application, b: Application): number => {
    if (sort === "commitment") {
      const ca = a.track === "coaching" ? a.commitment : 0;
      const cb = b.track === "coaching" ? b.commitment : 0;
      if (ca !== cb) return cb - ca;
    }
    const t = Date.parse(a.createdAt) - Date.parse(b.createdAt);
    if (t !== 0) return sort === "oldest" ? t : -t;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  };
}

export type StatusCounts = Record<StatusFilter, number>;

export function view(all: Application[], f: Filters) {
  const facet = all.filter((a) => matchesFacets(a, f));
  const counts = { open: 0, all: facet.length } as StatusCounts;
  for (const s of STATUS_IDS) counts[s] = 0;
  for (const a of facet) {
    counts[a.status] += 1;
    if (isOpen(a.status)) counts.open += 1;
  }
  const rows = facet.filter((a) => matchesStatus(a, f.status)).sort(compareBy(f.sort));
  return { counts, rows };
}

/**
 * Where an application sits in the filtered list, and its neighbours. Works
 * even after the application has left the view (declined while the list shows
 * open ones): prev / next are found from where it *would* sit in the sort order.
 */
export function neighbours(all: Application[], f: Filters, id: string) {
  const sorted = all.slice().sort(compareBy(f.sort));
  const rows = sorted.filter((a) => matches(a, f));
  const at = sorted.findIndex((a) => a.id === id);
  let prev: Application | null = null;
  let next: Application | null = null;
  if (at >= 0) {
    for (let i = at - 1; i >= 0 && !prev; i--) if (matches(sorted[i], f)) prev = sorted[i];
    for (let i = at + 1; i < sorted.length && !next; i++) if (matches(sorted[i], f)) next = sorted[i];
  }
  return { prev, next, index: rows.findIndex((a) => a.id === id), total: rows.length };
}

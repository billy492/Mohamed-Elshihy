"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { LEVELS, PATHWAYS } from "@/lib/apply/options";
import { SORTS, parseFilters, toQuery, type Filters } from "./filters";

/**
 * Search plus the pathway / level / sort selects. A plain GET form, so the
 * Search button applies everything before JavaScript loads; once it has,
 * submitting (or changing a select) navigates client-side with a clean query
 * string. `children` is laid out in the same grid (the starred toggle).
 */
export default function FilterBar({ filters, children }: { filters: Filters; children?: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const mentorship = filters.track === "mentorship";

  function apply(form: HTMLFormElement) {
    const data = new FormData(form);
    const params = new URLSearchParams(toQuery(filters));
    for (const key of ["q", "pathway", "level", "sort"]) params.set(key, String(data.get(key) ?? ""));
    const next = parseFilters(params);
    // Picking a pathway or level only makes sense for coaching.
    if ((next.pathway || next.level) && next.track === "mentorship") next.track = "coaching";
    startTransition(() => router.push(`/admin${toQuery(next)}`));
  }

  return (
    <form
      action="/admin"
      method="get"
      role="search"
      className="dk-filters"
      data-pending={pending ? "" : undefined}
      onSubmit={(e) => {
        e.preventDefault();
        apply(e.currentTarget);
      }}
    >
      {/* Keep the other filters when the form submits without JavaScript. */}
      {filters.track !== "all" && <input type="hidden" name="track" value={filters.track} />}
      {filters.status !== "open" && <input type="hidden" name="status" value={filters.status} />}
      {filters.starred && <input type="hidden" name="starred" value="1" />}

      <div className="dk-search">
        <label htmlFor="dk-q" className="dk-sr">
          Search applications
        </label>
        <input
          id="dk-q"
          name="q"
          type="search"
          defaultValue={filters.q}
          placeholder="Name, email, phone, ref"
          title="Searches names, emails, phone numbers, refs and the problem text"
          autoComplete="off"
          enterKeyHint="search"
          maxLength={100}
        />
        <button type="submit" className="dk-btn dk-btn-solid">
          {pending ? "…" : "Search"}
        </button>
      </div>

      <label className="dk-field">
        <span className="dk-field-label">Pathway</span>
        <select
          name="pathway"
          className="dk-select"
          defaultValue={filters.pathway}
          disabled={mentorship}
          onChange={(e) => e.currentTarget.form && apply(e.currentTarget.form)}
        >
          <option value="">All pathways</option>
          {PATHWAYS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <label className="dk-field">
        <span className="dk-field-label">Level</span>
        <select
          name="level"
          className="dk-select"
          defaultValue={filters.level}
          disabled={mentorship}
          onChange={(e) => e.currentTarget.form && apply(e.currentTarget.form)}
        >
          <option value="">All levels</option>
          {LEVELS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </label>

      <label className="dk-field">
        <span className="dk-field-label">Sort</span>
        <select
          name="sort"
          className="dk-select"
          defaultValue={filters.sort}
          onChange={(e) => e.currentTarget.form && apply(e.currentTarget.form)}
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      {children}
    </form>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { storeReady } from "@/lib/store";
import { COACH_ROLES, EXPERIENCE, LEVELS, STATUSES, labelOf } from "@/lib/apply/options";
import type { Application } from "@/lib/apply/schema";
import DeskNav from "./_components/DeskNav";
import FilterBar from "./_components/FilterBar";
import { Meter, StatusPill, StoreMissing } from "./_components/bits";
import { loadApplications } from "./_components/data";
import {
  TRACK_FILTERS,
  isFiltered,
  isOpen,
  parseFilters,
  toQuery,
  view,
  type RawParams,
  type StatusFilter,
} from "./_components/filters";
import { PATHWAY_SHORT, ROLE_SHORT, ago, cairoDateTime, textProps } from "./_components/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Applications — Desk" } };

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "open", label: "Open" },
  ...STATUSES.map((s) => ({ id: s.id, label: s.label })),
  { id: "all", label: "All" },
];

const TRACK_LABEL = { all: "All", coaching: "Coaching", mentorship: "Mentorship" } as const;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  await requireAdmin();
  if (!storeReady()) {
    return (
      <>
        <DeskNav section="applications" />
        <StoreMissing />
      </>
    );
  }

  const f = parseFilters(await searchParams);
  const all = await loadApplications();
  const { counts, rows } = view(all, f);
  const q = toQuery(f);
  const openTotal = all.filter((a) => isOpen(a.status)).length;

  return (
    <>
      <DeskNav section="applications" />
      <main id="main" className="dk-page">
        <header className="dk-head">
          <div className="dk-head-top">
            <h1 className="dk-title">Applications</h1>
            {/* A plain link: the export is a file download, not a page. */}
            <a href={`/admin/export${q}`} className="dk-btn">
              Export CSV
            </a>
          </div>

          <nav className="dk-chips" aria-label="Filter by status">
            {STATUS_TABS.map((t) => (
              <Link
                key={t.id}
                href={`/admin${toQuery(f, { status: t.id })}`}
                className="dk-chip"
                data-hot={t.id === "new" && counts.new > 0 ? "" : undefined}
                aria-current={f.status === t.id ? "true" : undefined}
              >
                {t.label}
                <span className="dk-chip-n">{counts[t.id]}</span>
              </Link>
            ))}
          </nav>

          <div className="dk-controls">
            <nav className="dk-seg" aria-label="Filter by track">
              {TRACK_FILTERS.map((t) => (
                <Link
                  key={t}
                  // Pathway and level only exist on coaching applications.
                  href={`/admin${toQuery(f, t === "mentorship" ? { track: t, pathway: "", level: "" } : { track: t })}`}
                  aria-current={f.track === t ? "true" : undefined}
                >
                  {TRACK_LABEL[t]}
                </Link>
              ))}
            </nav>
            <FilterBar key={q} filters={f}>
              <Link
                href={`/admin${toQuery(f, { starred: !f.starred })}`}
                className="dk-toggle"
                aria-current={f.starred ? "true" : undefined}
              >
                <span aria-hidden="true">{f.starred ? "★" : "☆"}</span> Starred only
              </Link>
            </FilterBar>
          </div>
        </header>

        {all.length === 0 ? (
          <section className="dk-empty" aria-labelledby="dk-empty-h">
            <h2 id="dk-empty-h" className="dk-empty-title">
              No applications yet
            </h2>
            <p>
              The form is live at{" "}
              <a href="/apply" className="dk-link">
                /apply
              </a>
              . New applications land here first, marked New.
            </p>
          </section>
        ) : rows.length === 0 ? (
          <section className="dk-empty" aria-labelledby="dk-empty-h">
            <h2 id="dk-empty-h" className="dk-empty-title">
              Nothing matches
            </h2>
            <p>No application fits these filters.</p>
            {openTotal > 0 ? (
              <Link href="/admin" className="dk-btn">
                Clear filters
              </Link>
            ) : (
              <Link href="/admin?status=all" className="dk-btn">
                Show all {plural(all.length, "application")}
              </Link>
            )}
          </section>
        ) : (
          <>
            <p className="dk-summary">
              <span>
                {rows.length === all.length
                  ? plural(all.length, "application")
                  : `Showing ${rows.length} of ${all.length}`}
              </span>
              {isFiltered(f) && (
                <Link href="/admin" className="dk-link">
                  Clear filters
                </Link>
              )}
            </p>
            <div className="dk-rows-head" aria-hidden="true">
              <span />
              <span>Applicant</span>
              <span>Age / role</span>
              <span>Track</span>
              <span>Sport · level</span>
              <span>The problem</span>
              <span>Commitment</span>
              <span>Received</span>
              <span>Status</span>
            </div>
            <ol className="dk-rows">
              {rows.map((a) => (
                <Row key={a.id} a={a} href={`/admin/${a.id}${q}`} />
              ))}
            </ol>
          </>
        )}
      </main>
    </>
  );
}

function Row({ a, href }: { a: Application; href: string }) {
  const coaching = a.track === "coaching";
  return (
    <li>
      <Link href={href} className="dk-row" data-status={a.status}>
        <span className="dk-r-star">
          {a.starred && (
            <>
              <span aria-hidden="true">★</span>
              <span className="dk-sr">Starred. </span>
            </>
          )}
        </span>
        <span className="dk-r-who">
          <span className="dk-r-name" {...textProps(a.name)}>
            {a.name}
          </span>
          <span className="dk-r-loc" {...textProps(a.location)}>
            {a.location}
          </span>
        </span>
        <span className="dk-r-facts">
          <span className="dk-r-age">
            {coaching ? `Age ${a.age}` : (ROLE_SHORT[a.role] ?? labelOf(COACH_ROLES, a.role))}
          </span>
          <span className="dk-r-badge">
            <span className="dk-badge" data-track={a.track}>
              {coaching ? (PATHWAY_SHORT[a.pathway] ?? a.pathway) : "Mentorship"}
            </span>
          </span>
          <span className="dk-r-what">
            {coaching ? (
              <>
                <span {...textProps(a.sport)}>{a.sport}</span> · {labelOf(LEVELS, a.level)}
              </>
            ) : (
              `${labelOf(EXPERIENCE, a.experience)} coaching`
            )}
          </span>
        </span>
        <span className="dk-r-prob" {...textProps(a.problem)}>
          {a.problem}
        </span>
        <span className="dk-r-meter">{coaching && <Meter value={a.commitment} />}</span>
        <time className="dk-r-when" dateTime={a.createdAt} title={`${cairoDateTime(a.createdAt)}, Cairo`}>
          {ago(a.createdAt)}
        </time>
        <span className="dk-r-status">
          <StatusPill status={a.status} />
        </span>
      </Link>
    </li>
  );
}

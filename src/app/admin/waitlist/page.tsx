import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { storeReady } from "@/lib/store";
import type { WaitlistEntry } from "@/lib/apply/schema";
import { programs } from "@/content/programs";
import DeskNav from "../_components/DeskNav";
import CopyButton from "../_components/CopyButton";
import { StoreMissing } from "../_components/bits";
import { loadWaitlist } from "../_components/data";
import { cairoDateTime } from "../_components/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Waitlist — Desk" } };

type Person = { email: string; joined: string; times: number };
type Group = { slug: string; name: string; people: Person[] };

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * Sign-ups per program, in the order of the programs page. The same email
 * signing up twice counts once (with its first date); programs that sell
 * through a checkout link only appear if they somehow have sign-ups, and
 * entries for a program that no longer exists are kept under its slug.
 */
function group(entries: WaitlistEntry[]): Group[] {
  const bySlug = new Map<string, Map<string, Person>>();
  for (const e of entries.slice().reverse()) {
    const people = bySlug.get(e.program) ?? new Map<string, Person>();
    bySlug.set(e.program, people);
    const key = e.email.trim().toLowerCase();
    const known = people.get(key);
    if (known) known.times += 1;
    else people.set(key, { email: e.email.trim(), joined: e.createdAt, times: 1 });
  }
  const listed = programs
    .filter((p) => !p.checkout || bySlug.has(p.slug))
    .map((p) => ({ slug: p.slug, name: p.name }));
  const unlisted = [...bySlug.keys()]
    .filter((slug) => !programs.some((p) => p.slug === slug))
    .map((slug) => ({ slug, name: slug }));
  return [...listed, ...unlisted].map((g) => ({
    ...g,
    people: [...(bySlug.get(g.slug)?.values() ?? [])].reverse(),
  }));
}

export default async function WaitlistPage() {
  await requireAdmin();
  if (!storeReady()) {
    return (
      <>
        <DeskNav section="waitlist" />
        <StoreMissing />
      </>
    );
  }

  const entries = await loadWaitlist();
  const groups = group(entries);
  const people = groups.reduce((n, g) => n + g.people.length, 0);

  return (
    <>
      <DeskNav section="waitlist" />
      <main id="main" className="dk-page">
        <header className="dk-head">
          <div className="dk-head-top">
            <h1 className="dk-title">Waitlist</h1>
            {/* A file download from a route handler, not a page: <Link> would prefetch it. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/admin/export?kind=waitlist" className="dk-btn">
              Export CSV
            </a>
          </div>
          {entries.length > 0 && (
            <p className="dk-summary">
              <span>
                {plural(people, "sign-up")} across {plural(groups.filter((g) => g.people.length).length, "program")}
              </span>
            </p>
          )}
        </header>

        {entries.length === 0 ? (
          <section className="dk-empty" aria-labelledby="dk-empty-h">
            <h2 id="dk-empty-h" className="dk-empty-title">
              No sign-ups yet
            </h2>
            <p>
              Programs without a checkout link collect emails on{" "}
              <a href="/programs" className="dk-link">
                /programs
              </a>
              . They show up here, grouped by program.
            </p>
          </section>
        ) : (
          <div className="dk-wl">
            {groups.map((g) => (
              <section key={g.slug} className="dk-wl-group" aria-labelledby={`dk-wl-${g.slug}`}>
                <header className="dk-wl-head">
                  <h2 id={`dk-wl-${g.slug}`} className="dk-wl-name">
                    {g.name}
                  </h2>
                  <span className="dk-wl-n" aria-label={plural(g.people.length, "sign-up")}>
                    {g.people.length}
                  </span>
                </header>
                {g.people.length === 0 ? (
                  <p className="dk-wl-none">No sign-ups yet.</p>
                ) : (
                  <>
                    <ol className="dk-wl-list">
                      {g.people.map((p) => (
                        <li key={p.email.toLowerCase()}>
                          <a href={`mailto:${p.email}`} className="dk-wl-email">
                            {p.email}
                          </a>
                          <span className="dk-wl-when">
                            {p.times > 1 && <span className="dk-wl-times">{p.times}×</span>}
                            <time dateTime={p.joined}>{cairoDateTime(p.joined)}</time>
                          </span>
                        </li>
                      ))}
                    </ol>
                    <div className="dk-wl-foot">
                      <CopyButton
                        value={g.people.map((p) => p.email).join(", ")}
                        label={`${g.name} emails`}
                        text="Copy all emails"
                      />
                    </div>
                  </>
                )}
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

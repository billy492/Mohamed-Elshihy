import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { storeReady } from "@/lib/store";
import type { Application } from "@/lib/apply/schema";
import {
  COACH_ROLES,
  DAYS,
  EQUIPMENT,
  EXPERIENCE,
  FORMATS,
  GAPS,
  GOALS,
  INVESTMENT,
  LEVELS,
  PATHWAYS,
  SOURCES,
  START,
  TRAINING_YEARS,
  labelOf,
} from "@/lib/apply/options";
import DeskNav from "../_components/DeskNav";
import CopyButton from "../_components/CopyButton";
import NotesBox from "../_components/NotesBox";
import { Linkify, Meter, StoreMissing } from "../_components/bits";
import { loadApplications } from "../_components/data";
import { neighbours, parseFilters, toQuery, type RawParams } from "../_components/filters";
import { SHORTCUTS } from "../_components/shortcuts";
import { MobileBar, Pager, StarToggle, StatusControl, Triage } from "../_components/Triage";
import {
  cairoDateTime,
  countryName,
  instagram,
  mailHref,
  telHref,
  textProps,
  whatsappHref,
} from "../_components/format";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<RawParams> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    if (!(await isAdmin()) || !storeReady()) return {};
    const { id } = await params;
    const app = (await loadApplications()).find((a) => a.id === id);
    return app ? { title: { absolute: `${app.name} — Desk` } } : {};
  } catch {
    return {};
  }
}

type Spec = { label: string; value: ReactNode; text?: string };

const DASH = "—";

/** Every answer not already shown in the header, problem, tags or contact block, with its human label. */
function answers(a: Application): Spec[] {
  const t = (label: string, text: string): Spec => ({ label, value: text || DASH, text });
  if (a.track === "coaching") {
    return [
      t("Pathway", labelOf(PATHWAYS, a.pathway)),
      t("Age", String(a.age)),
      t("Sport", a.sport),
      t("Level", labelOf(LEVELS, a.level)),
      t("Position", a.position),
      t("Club", a.club),
      t("Training seriously for", labelOf(TRAINING_YEARS, a.trainingYears)),
      t("Days a week", labelOf(DAYS, a.trainingDays)),
      t("Equipment", labelOf(EQUIPMENT, a.equipment)),
      t("Wants to start", labelOf(START, a.start)),
      {
        label: "Commitment",
        value: (
          <span className="dk-spec-meter">
            <Meter value={a.commitment} />
            {a.commitment} / 10
          </span>
        ),
      },
      t("Ready to invest", labelOf(INVESTMENT, a.investment)),
      t("Heard about Shihy", labelOf(SOURCES, a.source)),
      t("Consent", a.consent ? "Given" : "Not given"),
    ];
  }
  return [
    t("Role", labelOf(COACH_ROLES, a.role)),
    t("Organization", a.organization),
    t("Coaching for", labelOf(EXPERIENCE, a.experience)),
    t("Format", labelOf(FORMATS, a.format)),
    t("Wants to start", labelOf(START, a.start)),
    t("Ready to invest", labelOf(INVESTMENT, a.investment)),
    t("Heard about Shihy", labelOf(SOURCES, a.source)),
    t("Consent", a.consent ? "Given" : "Not given"),
  ];
}

/** Longer free-text answers, shown only when the applicant wrote something. */
function writing(a: Application): { label: string; text: string }[] {
  const all =
    a.track === "coaching"
      ? [
          { label: "Injuries and pain", text: a.injuries },
          { label: "Anything else", text: a.extra },
        ]
      : [
          { label: "Credentials", text: a.credentials },
          { label: "Links", text: a.links },
        ];
  return all.filter((w) => w.text?.trim());
}

export default async function ApplicationPage({ params, searchParams }: Props) {
  await requireAdmin(`/admin/${(await params).id}`);
  if (!storeReady()) {
    return (
      <>
        <DeskNav section="applications" exact={false} />
        <StoreMissing />
      </>
    );
  }

  const [{ id }, raw] = await Promise.all([params, searchParams]);
  const all = await loadApplications();
  const app = all.find((a) => a.id === id);
  if (!app) notFound();

  const f = parseFilters(raw);
  const q = toQuery(f);
  const { prev, next, index, total } = neighbours(all, f, app.id);
  const hrefOf = (a: Application | null) => (a ? `/admin/${a.id}${q}` : null);
  const ig = instagram(app.instagram);
  const country = countryName(app.country);
  const tags =
    app.track === "coaching" ? app.goals.map((g) => labelOf(GOALS, g)) : app.gaps.map((g) => labelOf(GAPS, g));

  return (
    <>
      <DeskNav section="applications" exact={false} />
      <Triage
        key={app.id}
        id={app.id}
        status={app.status}
        starred={app.starred}
        prevHref={hrefOf(prev)}
        nextHref={hrefOf(next)}
        listHref={`/admin${q}`}
      >
        <main id="main" className="dk-page dk-detail">
          <Pager position={index + 1} total={total} />

          <header className="dk-dhead">
            <div className="dk-dhead-top">
              <p className="dk-kicker">
                <span className="dk-ref">{app.ref}</span>
                <time dateTime={app.createdAt}>{cairoDateTime(app.createdAt)} · Cairo</time>
              </p>
              <StarToggle />
            </div>
            <h1 className="dk-name" {...textProps(app.name)}>
              {app.name}
            </h1>
            <p className="dk-meta">
              <span className="dk-badge" data-track={app.track}>
                {app.track === "coaching" ? "Coaching" : "Mentorship"}
              </span>
              {app.track === "coaching" && <span className="dk-badge">{labelOf(PATHWAYS, app.pathway)}</span>}
              <span className="dk-meta-text" {...textProps(app.location)}>
                {app.location}
              </span>
              {country && (
                <span className="dk-meta-ip" title="Where the application was sent from, going by IP address">
                  Sent from {country}
                </span>
              )}
            </p>
          </header>

          <div className="dk-dgrid">
            <div className="dk-dmain">
              <section className="dk-sec dk-o-problem" aria-labelledby="dk-problem-h">
                <h2 id="dk-problem-h" className="dk-h">
                  The problem
                </h2>
                <p className="dk-problem" {...textProps(app.problem)}>
                  {app.problem}
                </p>
              </section>

              <section className="dk-sec dk-o-tags" aria-labelledby="dk-tags-h">
                <h2 id="dk-tags-h" className="dk-h">
                  {app.track === "coaching" ? "Goals" : "Wants to get better at"}
                </h2>
                <ul className="dk-tags">
                  {tags.map((tag, i) => (
                    <li key={`${i}-${tag}`} className="dk-tag">
                      {tag}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="dk-sec dk-o-specs" aria-labelledby="dk-specs-h">
                <h2 id="dk-specs-h" className="dk-h">
                  Answers
                </h2>
                <dl className="dk-specs">
                  {answers(app).map((s) => (
                    <div key={s.label} className="dk-spec" data-empty={s.value === DASH ? "" : undefined}>
                      <dt>{s.label}</dt>
                      <dd {...textProps(s.text)}>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {writing(app).map((w, i) => (
                <section key={w.label} className="dk-sec dk-o-writing" aria-labelledby={`dk-w-${i}`}>
                  <h2 id={`dk-w-${i}`} className="dk-h">
                    {w.label}
                  </h2>
                  <p className="dk-text" {...textProps(w.text)}>
                    <Linkify text={w.text} />
                  </p>
                </section>
              ))}
            </div>

            <div className="dk-dside">
              <section className="dk-sec dk-o-status" aria-labelledby="dk-status-h">
                <h2 id="dk-status-h" className="dk-h">
                  Status
                </h2>
                <StatusControl />
              </section>

              <section className="dk-sec dk-o-contact" aria-labelledby="dk-contact-h">
                <h2 id="dk-contact-h" className="dk-h">
                  Contact
                </h2>
                <div className="dk-contact-actions">
                  <a className="dk-btn dk-btn-solid" href={whatsappHref(app)} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                  <a className="dk-btn" href={mailHref(app.email, app.ref)}>
                    Email
                  </a>
                  <a className="dk-btn" href={telHref(app.phone)}>
                    Call
                  </a>
                </div>
                <ul className="dk-contact-lines">
                  <li>
                    <a className="dk-contact-value" href={mailHref(app.email, app.ref)}>
                      {app.email}
                    </a>
                    <CopyButton value={app.email} label="email address" />
                  </li>
                  <li>
                    <a className="dk-contact-value" href={telHref(app.phone)} dir="ltr">
                      {app.phone}
                    </a>
                    <CopyButton value={app.phone} label="phone number" />
                  </li>
                  {app.instagram && (
                    <li>
                      {ig ? (
                        <a className="dk-contact-value" href={ig.href} target="_blank" rel="noopener noreferrer">
                          {ig.handle}
                        </a>
                      ) : (
                        <span className="dk-contact-value">{app.instagram}</span>
                      )}
                      <span className="dk-contact-kind">Instagram</span>
                    </li>
                  )}
                </ul>
              </section>

              <section className="dk-sec dk-o-notes" aria-label="Private notes">
                <NotesBox key={app.id} id={app.id} initial={app.deskNotes ?? ""} />
              </section>

              <section className="dk-sec dk-keys" aria-labelledby="dk-keys-h">
                <h2 id="dk-keys-h" className="dk-h">
                  Keyboard
                </h2>
                <dl className="dk-keylist">
                  {SHORTCUTS.map((s) => (
                    <div key={s.label}>
                      <dt>
                        {s.keys.map((k) => (
                          <kbd key={k}>{k}</kbd>
                        ))}
                      </dt>
                      <dd>{s.label}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </div>

          <MobileBar />
        </main>
      </Triage>
    </>
  );
}

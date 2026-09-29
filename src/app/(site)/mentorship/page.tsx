import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/site/PageHero";
import Split from "@/components/site/Split";
import Plate from "@/components/plate/Plate";
import DrawOn from "@/components/home/DrawOn";
import Ticker from "@/components/site/Ticker";
import { films } from "@/content/media";
import { GAPS, FORMATS, COACH_ROLES } from "@/lib/apply/options";
import { words } from "@/content/record";

export const metadata: Metadata = {
  title: "Mentorship",
  description:
    "Mentorship for strength and conditioning coaches, club fitness staff, trainers and physios, from Mohamed El Shihy: six years and 18+ titles with Al Ahly SC.",
};

// CONFIRM with Shihy: formats, session cadence and what each covers.
const HOW = [
  { k: "Case reviews", v: "Bring your athletes. We assess them together, find the problem, and build the fix." },
  { k: "Program audits", v: "Your programs, taken apart and rebuilt, with the reasoning behind every change." },
  { k: "Live questions", v: "Direct access for the questions that come up on the floor, in the week they come up." },
];

export default function MentorshipPage() {
  return (
    <>
      <PageHero
        title="Mentorship"
        kicker="For coaches"
        lede="For coaches who want to think in problems, not programs."
        film={films.drill}
        cta={{ href: "/apply?track=mentorship", label: "Apply for mentorship" }}
      />
      <Ticker items={COACH_ROLES.filter((r) => r.id !== "other").map((r) => r.label)} className="ticker-red" />

      <section className="section" aria-labelledby="see-title">
        <div className="mnt-grid">
          <div className="mnt-copy">
            <Split as="h2" id="see-title" className="t-h1" text="Learn to see it" lines={["Learn to", "see it."]} />
            <p className="t-lede mnt-text">
              Every fix starts with seeing the problem. Mentorship trains the eye first: how to assess, what to
              measure, and how to tell the problem that matters from the noise.
            </p>
            <blockquote className="about-quote">
              <p>{words.teach}</p>
              <cite>Shihy</cite>
            </blockquote>
          </div>
          <figure className="mnt-plate">
            <DrawOn>
              <Plate kind="squat" title="A squat, down and up, with the trunk angle measured on the way up." />
            </DrawOn>
          </figure>
        </div>
      </section>

      <section className="section section-chalk" data-tone="chalk" aria-labelledby="cover-title">
        <header className="section-head">
          <Split as="h2" id="cover-title" className="t-h1" text="What we work on" lines={["What we", "work on"]} />
          <p className="t-lede section-lede">Pick up to three when you apply. We start with the one holding you back most.</p>
        </header>
        <ol className="prb-list">
          {GAPS.map((g, i) => (
            <li key={g.id} className="cover-row">
              <span className="prb-n">0{i + 1}</span>
              <span className="prb-name">{g.label}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="section" aria-labelledby="how-title">
        <header className="section-head">
          <Split as="h2" id="how-title" className="t-h1" text="How it works" />
          <p className="t-lede section-lede">
            Formats: {FORMATS.filter((f) => f.id !== "unsure").map((f) => f.label.toLowerCase()).join(" or ")}. The
            investment is discussed after your application.
          </p>
        </header>
        <dl className="spec">
          {HOW.map((h) => (
            <div key={h.k}>
              <dt>{h.k}</dt>
              <dd>{h.v}</dd>
              <span className="spec-where" />
            </div>
          ))}
        </dl>
        <div className="actions section-actions">
          <Link className="btn btn-solid btn-xl" href="/apply?track=mentorship" data-magnet data-cursor="Apply">
            <span className="btn-icon" aria-hidden="true" />
            Apply for mentorship
          </Link>
        </div>
      </section>
    </>
  );
}

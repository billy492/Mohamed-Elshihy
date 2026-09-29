import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import WaitlistForm from "./WaitlistForm";
import { films } from "@/content/media";
import { programs } from "@/content/programs";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Training programs by Mohamed El Shihy for the problems that come up most: speed, hamstrings, the off-season and building a strength base.",
};

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        title="Programs"
        kicker="Train on your own"
        lede="The programs I'd write for the most common problems. Join the waitlist and you'll be first in when each one opens."
        film={films.barbell}
      />
      <section className="section" aria-label="All programs">
        <div className="pgm-list">
          {programs.map((p, i) => (
            <article key={p.slug} id={p.slug} className="pgm" aria-labelledby={`pgm-${p.slug}`}>
              <div className="pgm-weeks" aria-hidden="true">
                <b>{String(p.weeks).padStart(2, "0")}</b>
                <span>Weeks</span>
              </div>
              <div className="pgm-copy">
                <span className="tag">
                  <b>0{i + 1}</b> {p.level}
                </span>
                <h2 id={`pgm-${p.slug}`} className="pgm-name">
                  {p.name}
                </h2>
                <p className="t-lede pgm-focus">{p.focus}</p>
                <dl className="prg-meta pgm-meta">
                  <div>
                    <dt>Length</dt>
                    <dd>{p.weeks} weeks</dd>
                  </div>
                  <div>
                    <dt>Sessions</dt>
                    <dd>{p.perWeek} a week</dd>
                  </div>
                  <div>
                    <dt>Equipment</dt>
                    <dd>{p.equipment}</dd>
                  </div>
                  <div>
                    <dt>For</dt>
                    <dd>{p.forWho}</dd>
                  </div>
                </dl>
              </div>
              <div className="pgm-action">
                {p.checkout ? (
                  <a className="btn btn-solid" href={p.checkout} target="_blank" rel="noopener">
                    <span className="btn-icon" aria-hidden="true" />
                    Get the program{p.price ? `, ${p.price}` : ""}
                  </a>
                ) : (
                  <WaitlistForm program={p.slug} name={p.name} />
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

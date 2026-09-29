import Link from "next/link";
import Split from "@/components/site/Split";
import { tiers } from "@/content/coaching";

// Every coaching program in full, side by side, exactly as Shihy's brochure lists it.
// "By priority" lists are numbered, because the order is the point.
export default function Levels() {
  return (
    <section id="levels" className="section section-chalk lvl" data-tone="chalk" aria-labelledby="lvl-title">
      <header className="section-head">
        <Split
          as="h2"
          id="lvl-title"
          className="t-h1"
          text="Choose your level of coaching"
          lines={["Choose your level", "of coaching"]}
        />
        <p className="t-lede section-lede">
          Five tiers of professional coaching, each built to match your goals and the level of support you need.
        </p>
      </header>
      <div className="lvl-grid">
        {tiers.map((t) => {
          const ranked = t.plus.includes("plus") && t.id !== "athlete";
          const List = ranked ? "ol" : "ul";
          return (
            <article key={t.id} id={`detail-${t.id}`} className="lvl-col" aria-labelledby={`lvl-${t.id}`}>
              <p className="lvl-program">{t.program}</p>
              <h3 id={`lvl-${t.id}`} className="lvl-name">
                {t.name}
              </h3>
              <span className="lvl-badge">{t.badge}</span>
              {t.tracks ? (
                <div className="lvl-tracks">
                  {t.tracks.map((tr) => (
                    <div key={tr.name}>
                      <p className="lvl-track">{tr.name}</p>
                      <p className="lvl-who">{tr.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="lvl-who">{t.who}</p>
              )}
              <p className="lvl-plus">
                {t.plus}
                {ranked ? " (by priority)" : ""}
              </p>
              <List className={`lvl-list${ranked ? " is-ranked" : ""}`}>
                {t.includes.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </List>
              {t.addOn ? (
                <p className="lvl-note">
                  <b>Optional add-on</b> {t.addOn.name}
                </p>
              ) : null}
              {t.extraSession ? (
                <p className="lvl-note">
                  Additional one-to-one sessions available.
                </p>
              ) : null}
              <Link className="btn btn-solid lvl-cta" href={t.apply} data-cursor="Apply">
                <span className="btn-icon" aria-hidden="true" />
                Apply
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

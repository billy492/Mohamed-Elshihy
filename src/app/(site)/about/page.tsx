import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import Split from "@/components/site/Split";
import Ticker from "@/components/site/Ticker";
import FinalCta from "@/components/home/FinalCta";
import { education, learning, philosophy, roles, values, words } from "@/content/record";
import { shots, work } from "@/content/media";
import { imgSrcSet } from "@/lib/img";
import { credentials } from "@/content/coaching";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mohamed El Shihy: high performance coach with 11 years of experience, fitness director at REVOLT, MSc Strength and Conditioning student at ALTIS and Gym Jones fully certified instructor.",
};


export default function AboutPage() {
  return (
    <>
      <PageHero
        title={site.name}
        lines={["Mohamed", "El Shihy"]}
        kicker="The coach"
        lede="Eleven years coaching athletes and high achievers. Coach, educator, mentor. Obsessed with finding the problem."
        image={work.portraitBall.src}
        cta={{ href: "/apply", label: "Apply for coaching" }}
      />
      <Ticker items={credentials} className="ticker-red" />

      <section className="section" aria-labelledby="record-title">
        <header className="section-head">
          <Split as="h2" id="record-title" className="t-h1" text="The record" />
          <p className="t-lede section-lede">
            Eleven years of coaching, from professional team sport to private clients. Now fitness director at
            REVOLT, coaching athletes and high-achieving professionals.
          </p>
        </header>
        <blockquote className="about-quote">
          <p>{words.formula}</p>
          <cite>Mohamed El Shihy</cite>
        </blockquote>
        <div className="about-photos">
          {[work.staffEmbrace, work.staffHug].map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.src}
              src={p.src}
              srcSet={imgSrcSet(p.src)}
              sizes="(max-width: 760px) 50vw, 40vw"
              alt={p.alt}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
        <dl className="spec">
          {roles.map((r) => (
            <div key={r.what + r.where}>
              <dt>{r.when}</dt>
              <dd>{r.what}</dd>
              <span className="spec-where">{r.where}</span>
            </div>
          ))}
        </dl>
      </section>

      <section className="section section-chalk" data-tone="chalk" aria-labelledby="edu-title">
        <header className="section-head">
          <Split as="h2" id="edu-title" className="t-h1" text="Certified" />
          <p className="t-lede section-lede">Qualifications, and where he keeps learning.</p>
        </header>
        <div className="about-photos">
          {[shots.redbull, shots.redbullWalk].map((s) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.src}
              src={s.src}
              srcSet={imgSrcSet(s.src)}
              sizes="(max-width: 760px) 100vw, 40vw"
              alt={s.alt}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
        <dl className="spec">
          {[...education, ...learning].map((r) => (
            <div key={r.what + r.where}>
              <dt>{r.when || "Learning"}</dt>
              <dd>{r.what}</dd>
              <span className="spec-where">{r.where}</span>
            </div>
          ))}
        </dl>
      </section>

      <section className="section" aria-labelledby="values-title">
        <header className="section-head">
          <Split as="h2" id="values-title" className="t-h1" text="Core values" lines={["Core", "values"]} />
          <p className="t-lede section-lede">The principles he coaches by.</p>
        </header>
        <ol className="principles">
          {values.map((p, i) => (
            <li key={p.k}>
              <span className="prb-n">0{i + 1}</span>
              <h3>{p.k}</h3>
              <p>{p.v}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section section-chalk" data-tone="chalk" aria-labelledby="phil-title">
        <header className="section-head">
          <Split
            as="h2"
            id="phil-title"
            className="t-h1"
            text="Find the problem. Fix the problem."
            lines={["Find the problem.", "Fix the problem."]}
          />
          <p className="t-lede section-lede">The philosophy, in his own words.</p>
        </header>
        <ol className="principles">
          {philosophy.map((p, i) => (
            <li key={p.k}>
              <span className="prb-n">0{i + 1}</span>
              <h3>{p.k}</h3>
              <p>{p.v}</p>
            </li>
          ))}
        </ol>
      </section>

      <FinalCta />
    </>
  );
}

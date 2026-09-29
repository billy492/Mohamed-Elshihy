import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import Split from "@/components/site/Split";
import Method from "@/components/home/Method";
import Pathways from "@/components/home/Pathways";
import FinalCta from "@/components/home/FinalCta";
import { films } from "@/content/media";
import { pricingNote } from "@/content/coaching";

export const metadata: Metadata = {
  title: "Coaching",
  description:
    "Online, hybrid and performance coaching with Mohamed El Shihy. One method: assess, find the problem, build the fix, train, re-test.",
};

// CONFIRM with Shihy: the answers below describe how the pathways are meant to
// work; adjust once the delivery details are final.
const FAQ = [
  { q: "How much does coaching cost?", a: pricingNote },
  {
    q: "Do I need to be a professional?",
    a: "No. Performance coaching is built for competitive athletes, but online and hybrid coaching are for anyone who trains seriously and wants their problem fixed properly.",
  },
  {
    q: "Where do in-person sessions happen?",
    a: "In Cairo. Hybrid and performance athletes train with Shihy in person; online athletes are coached fully remotely, wherever they are.",
  },
  {
    q: "What happens after I apply?",
    a: "Shihy reads every application himself. If it's a fit, you hear back directly on WhatsApp or email to set up a call, where the plan and the investment are discussed.",
  },
  {
    q: "Can I change pathway later?",
    a: "Yes. Athletes move between pathways as their season, location and goals change.",
  },
];

export default function CoachingPage() {
  return (
    <>
      <PageHero
        title="Coaching"
        kicker="Three pathways"
        lede="One method, three ways to work with me. Find the problem. Fix the problem."
        film={films.juggle}
        cta={{ href: "/apply", label: "Apply for coaching" }}
      />
      <Method />
      <Pathways />
      <section className="section section-chalk" data-tone="chalk" aria-labelledby="faq-title">
        <header className="section-head">
          <Split as="h2" id="faq-title" className="t-h1" text="Before you apply" lines={["Before", "you apply"]} />
        </header>
        <div className="prb-list">
          {FAQ.map((f, i) => (
            <details key={f.q} className="prb-item faq-item">
              <summary className="prb-sum" data-cursor="Open">
                <span className="prb-n">0{i + 1}</span>
                <span className="prb-name faq-q">{f.q}</span>
                <span className="prb-plus" aria-hidden="true" />
              </summary>
              <div className="faq-a">
                <p>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
      <FinalCta />
    </>
  );
}

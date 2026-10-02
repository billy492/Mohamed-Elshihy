import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import Split from "@/components/site/Split";
import FinalCta from "@/components/home/FinalCta";
import { work } from "@/content/media";
import { mentorshipLede, offerings } from "@/content/mentorship";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Mentorship",
  description: `Mentorship with Mohamed El Shihy: ${mentorshipLede}`,
};

export default function MentorshipPage() {
  return (
    <>
      <PageHero
        title="Mentorship"
        kicker="Coming soon"
        lede={mentorshipLede}
        image={work.sessionPlan.src}
      />

      <section className="section" aria-labelledby="offer-title">
        <header className="section-head">
          <Split as="h2" id="offer-title" className="t-h1" text="What's coming" lines={["What's", "coming"]} />
          <p className="t-lede section-lede">
            Launching soon. Follow{" "}
            <a href={site.social.instagram.href} className="text-link" target="_blank" rel="noopener noreferrer">
              {site.social.instagram.handle}
            </a>{" "}
            to hear first.
          </p>
        </header>
        <ol className="principles">
          {offerings.map((o) => (
            <li key={o.name}>
              <span className="prb-n">Coming soon</span>
              <h3>{o.name}</h3>
              <p>
                <strong>For {o.for.toLowerCase()}.</strong> {o.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <FinalCta />
    </>
  );
}

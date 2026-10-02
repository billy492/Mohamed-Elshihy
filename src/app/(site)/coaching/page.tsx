import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import Levels from "@/components/coaching/Levels";
import Process from "@/components/coaching/Process";
import Policies from "@/components/coaching/Policies";
import FinalCta from "@/components/home/FinalCta";
import { work } from "@/content/media";

export const metadata: Metadata = {
  title: "Coaching",
  description:
    "High performance coaching by Mohamed El Shihy: Online, Online for competitive athletes, Premium (hybrid) and Pro, with limited spots. Find the problem. Fix the problem.",
};

// Shihy's client brochure (Sep 2026), in full.
export default function CoachingPage() {
  return (
    <>
      <PageHero
        title="Coaching"
        kicker="Online & hybrid"
        lede="High performance coaching for athletes and high-achieving professionals, built around one thing: you."
        image={work.hurdleSession.src}
        cta={{ href: "/apply", label: "Apply for coaching" }}
      />
      <Levels />
      <Process />
      <Policies />
      <FinalCta />
    </>
  );
}

import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import { work } from "@/content/media";

export const metadata: Metadata = {
  title: "Mentorship",
  description: "Mentorship for coaches with Mohamed El Shihy. Coming soon.",
};

export default function MentorshipPage() {
  return (
    <PageHero
      title="Mentorship"
      kicker="Coming soon"
      lede="Mentorship for coaches is coming soon. In the meantime, see the coaching programs."
      image={work.sessionPlan.src}
      cta={{ href: "/coaching", label: "Coaching programs" }}
    />
  );
}

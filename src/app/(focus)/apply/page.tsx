import type { Metadata } from "next";
import ApplyFlow from "@/components/apply/ApplyFlow";
import Plate from "@/components/plate/Plate";
import { PATHWAYS } from "@/lib/apply/options";

export const metadata: Metadata = {
  title: "Apply",
  description:
    "Apply for online, hybrid or performance coaching, or for mentorship. Every application is read by Shihy himself.",
};

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string; pathway?: string }>;
}) {
  const sp = await searchParams;
  const track = sp.track === "mentorship" ? "mentorship" : "coaching";
  const pathway = PATHWAYS.some((p) => p.id === sp.pathway) ? sp.pathway : undefined;
  return (
    <main id="main">
      <ApplyFlow
        initialTrack={track}
        initialPathway={track === "coaching" ? pathway : undefined}
        plate={<Plate kind="accel" className="apply-mini-plate" title="" />}
      />
    </main>
  );
}

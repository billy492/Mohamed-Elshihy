import type { Metadata } from "next";
import FilmRoom from "@/components/home/FilmRoom";
import FinalCta from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "Film room",
  description:
    "Interviews, breakdowns and lectures from Mohamed El Shihy on load, recovery and speed, and the thinking behind them.",
};

export default function FilmRoomPage() {
  return (
    <>
      <div className="page-spacer" aria-hidden="true" />
      <FilmRoom page />
      <FinalCta />
    </>
  );
}

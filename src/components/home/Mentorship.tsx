import Link from "next/link";
import BgVideo from "@/components/site/BgVideo";
import Split from "@/components/site/Split";
import Plate from "@/components/plate/Plate";
import DrawOn from "@/components/home/DrawOn";
import { films } from "@/content/media";

export default function Mentorship() {
  return (
    <section className="mnt" aria-labelledby="mnt-title">
      <BgVideo film={films.drill} className="mnt-film" />
      <div className="mnt-shade" aria-hidden="true" />
      <div className="mnt-grid">
        <div className="mnt-copy">
          <span className="tag">
            <b>For coaches</b> Mentorship
          </span>
          <Split as="h2" id="mnt-title" className="t-h1" text="Coaches. Learn to see it." lines={["Coaches.", "Learn to", "see it."]} />
          <p className="t-lede mnt-text">
            Mentorship for S&amp;C coaches, club fitness staff, trainers and physios. How to assess. How to find
            the problem that matters. How to build the fix, and run it.
          </p>
          <div className="actions">
            <Link className="btn btn-solid" href="/apply?track=mentorship" data-magnet data-cursor="Apply">
              <span className="btn-icon" aria-hidden="true" />
              Apply for mentorship
            </Link>
            <Link className="btn btn-ghost" href="/mentorship">
              What it covers
            </Link>
          </div>
        </div>
        <figure className="mnt-plate">
          <DrawOn>
            <Plate
              kind="squat"
              title="A squat, photographed down and up. On the way up the hips rise first and the chest tips forward; the plate measures the trunk angle."
            />
          </DrawOn>
          <figcaption className="plate-cap">
            Seeing it is the first skill. On the way up the hips rise first and the chest tips forward by the
            angle in red.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

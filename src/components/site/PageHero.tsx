import Link from "next/link";
import BgVideo from "@/components/site/BgVideo";
import Split from "@/components/site/Split";
import type { Film } from "@/content/media";
import { imgSrcSet } from "@/lib/img";

// The opening of every inner page: film or photograph behind, the page name at
// billboard size in difference, one line of intent, one action.
export default function PageHero({
  title,
  lines,
  kicker,
  lede,
  film,
  image,
  cta,
}: {
  title: string;
  lines?: string[];
  kicker: string;
  lede: string;
  film?: Film;
  image?: string;
  cta?: { href: string; label: string };
}) {
  return (
    <section className="page-hero" aria-labelledby="page-title">
      {film ? <BgVideo film={film} eager /> : null}
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="page-hero-img"
          src={image}
          srcSet={image.startsWith("/") ? imgSrcSet(image) : undefined}
          sizes="100vw"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      ) : null}
      <div className="page-hero-shade" aria-hidden="true" />
      <span className="tag">
        <b>{kicker}</b> Shihy
      </span>
      <Split as="h1" id="page-title" className="t-mega page-hero-title" text={title} lines={lines} />
      <div className="page-hero-foot">
        <p className="t-lede page-hero-lede">{lede}</p>
        {cta ? (
          <Link className="btn btn-solid" href={cta.href} data-magnet data-cursor="Apply">
            <span className="btn-icon" aria-hidden="true" />
            {cta.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

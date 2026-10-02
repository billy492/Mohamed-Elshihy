import Split from "@/components/site/Split";
import { philosophyText, processText } from "@/content/coaching";
import { site } from "@/content/site";
import { armani } from "@/content/record";

// "Process & Philosophy", from Shihy's client brochure.
export default function Process() {
  return (
    <section className="section" aria-labelledby="how-title">
      <header className="section-head">
        <Split as="h2" id="how-title" className="t-h1" text="How it works" lines={["How it", "works"]} />
      </header>
      <div className="pol-how">
        <div>
          <p className="lvl-program">The process</p>
          <p className="t-lede">{processText}</p>
        </div>
        <div>
          <p className="lvl-program">The philosophy</p>
          <p className="pol-motto">{site.motto.join(" ")}</p>
          <p className="t-lede">{philosophyText}</p>
        </div>
      </div>
      <blockquote className="about-quote">
        <p>{armani.text}</p>
        <cite>{armani.by}</cite>
      </blockquote>
    </section>
  );
}

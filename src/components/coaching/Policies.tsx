import Split from "@/components/site/Split";
import { policies } from "@/content/coaching";

// "Coaching Policies", from Shihy's client brochure.
export default function Policies() {
  return (
    <section id="policies" className="section section-chalk" data-tone="chalk" aria-labelledby="pol-title">
      <header className="section-head">
        <Split as="h2" id="pol-title" className="t-h1" text="Good to know" lines={["Good to", "know"]} />
        <p className="t-lede section-lede">Clear terms, so every client knows exactly what to expect.</p>
      </header>
      <dl className="pol-list">
        {policies.map((p) => (
          <div key={p.name}>
            <dt>{p.name}</dt>
            <dd>{p.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

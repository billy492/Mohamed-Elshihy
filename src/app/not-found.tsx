import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="site nf">
      <p className="nf-code" aria-hidden="true">
        404
      </p>
      <h1 className="t-h1 nf-title">Off the track.</h1>
      <p className="t-lede nf-text">This page doesn&apos;t exist. The problem is the link, not you.</p>
      <div className="actions">
        <Link className="btn btn-solid" href="/">
          <span className="btn-icon" aria-hidden="true" />
          Back to the start
        </Link>
        <Link className="btn btn-ghost" href="/apply">
          Apply for coaching
        </Link>
      </div>
    </main>
  );
}

import Link from "next/link";

export default function DeskNotFound() {
  return (
    <main id="main" className="dk-gate">
      <div className="dk-gate-inner">
        <p className="dk-gate-kicker">Desk</p>
        <h1 className="dk-gate-title">Not here.</h1>
        <p>This application doesn&apos;t exist, or it was removed.</p>
        <Link href="/admin" className="dk-btn dk-btn-solid dk-btn-lg">
          Back to applications
        </Link>
      </div>
    </main>
  );
}

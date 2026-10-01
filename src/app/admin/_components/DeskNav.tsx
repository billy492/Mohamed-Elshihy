import Link from "next/link";
import { logout } from "../actions";
import { storeReady } from "@/lib/store";
import { loadApplications } from "./data";

type Section = "applications" | "waitlist" | "alerts";

/** The desk's own header: brand, sections (with the New count), the public site and log out. */
export default async function DeskNav({ section, exact = true }: { section?: Section; exact?: boolean }) {
  let fresh = 0;
  if (storeReady()) {
    try {
      fresh = (await loadApplications()).filter((a) => a.status === "new").length;
    } catch {
      // The page itself reports storage errors; the nav just leaves the count off.
    }
  }
  const current = (s: Section) => (section === s ? (exact ? "page" : "true") : undefined);

  return (
    <header className="dk-nav">
      <Link href="/admin" className="dk-brand">
        Shihy<span aria-hidden="true">/</span>Desk
      </Link>
      <nav className="dk-tabs" aria-label="Desk">
        <Link href="/admin" className="dk-tab" aria-current={current("applications")}>
          Applications
          {fresh > 0 && (
            <span className="dk-count">
              {fresh}
              <span className="dk-sr"> new</span>
            </span>
          )}
        </Link>
        <Link href="/admin/waitlist" className="dk-tab" aria-current={current("waitlist")}>
          Waitlist
        </Link>
        <Link href="/admin/alerts" className="dk-tab" aria-current={current("alerts")}>
          Alerts
        </Link>
        <Link href="/" className="dk-tab">
          View site
        </Link>
      </nav>
      <form action={logout} className="dk-out">
        <button type="submit" className="dk-tab">
          Log out
        </button>
      </form>
    </header>
  );
}

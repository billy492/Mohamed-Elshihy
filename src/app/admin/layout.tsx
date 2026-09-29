import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./admin.css";

// The review desk sits outside the (site) group: no public header or footer.
// Every desk style is scoped under .desk (see admin.css).

export const metadata: Metadata = {
  title: "Desk",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="desk">{children}</div>;
}

import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, Barlow_Semi_Condensed, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/site/SmoothScroll";
import PageTransition from "@/components/site/PageTransition";
import { site } from "@/content/site";

// One superfamily, three widths. Barlow comes from the DIN tradition — the
// German industrial standard behind road signs and certificates — which is
// where the "certified" feel comes from:
//   Barlow Condensed (heavy)   — every title, label, button, number: ALL CAPS
//   Barlow Semi Condensed      — short copy, set in caps
//   Barlow                     — long reading and anything people type
// Noto Kufi Arabic carries his Arabic name with the same weight.
// Only the weights the CSS actually uses. The display and text cuts are
// preloaded (they set the first screen); Barlow (forms, the desk) and the
// Arabic face (footer, film captions) load when something needs them.
const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});
const text = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-text",
  display: "swap",
});
const plain = Barlow({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plain",
  display: "swap",
  preload: false,
});
const arabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["700", "900"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Find the problem. Fix the problem.`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — Find the problem. Fix the problem.`,
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#070707",
  colorScheme: "dark",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: [site.short, site.arabic],
  jobTitle: "Performance coach",
  alumniOf: { "@type": "SportsOrganization", name: "Al Ahly SC" },
  sameAs: [site.social.instagram.href, site.social.youtube.href],
  url: site.url,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${text.variable} ${plain.variable} ${arabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Before first paint: lets CSS hold back what the opening will reveal,
            without hiding anything from visitors whose JavaScript never runs. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SmoothScroll />
        {children}
        <PageTransition />
      </body>
    </html>
  );
}

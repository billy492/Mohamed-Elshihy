// Everything about Shihy that appears in more than one place.
// Facts here were checked against his Instagram bio (@shihy.sc, Sep 2026) and
// Arabic press coverage of his move to Al Ahly football (Youm7, Nov 2023).
// Anything marked CONFIRM needs his sign-off before launch.

export const site = {
  name: "Mohamed El Shihy",
  short: "Shihy",
  arabic: "محمد الشيحى",
  motto: ["Find the problem.", "Fix the problem."] as const,
  // His own farewell post (Instagram, 9 Aug 2026): six years at Al Ahly SC and
  // "more than 18 championships", then "a new chapter". CONFIRM what he wants
  // to call the new chapter before launch.
  role: "Six years at Al Ahly SC · 18+ titles",
  roleShort: "Performance coach, six years at Al Ahly SC",
  alAhly: { years: 6, titles: "18+" },
  base: "Cairo, Egypt",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://shihy.coaching",
  description:
    "Mohamed El Shihy: performance coach, six years and 18+ titles with Al Ahly SC. Online and hybrid coaching: Online, Premium and Pro. Find the problem. Fix the problem.",
  social: {
    instagram: { label: "Instagram", handle: "@shihy.sc", href: "https://www.instagram.com/shihy.sc/" },
    youtube: { label: "YouTube", handle: "@shihy_sc", href: "https://www.youtube.com/@shihy_sc" },
  },
} as const;

export const nav = [
  { href: "/coaching", label: "Coaching" },
  { href: "/about", label: "About" },
  { href: "/film-room", label: "Film room" },
  { href: "/mentorship", label: "Mentorship" },
] as const;

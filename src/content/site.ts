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
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://shihy.coach",
  description:
    "Mohamed El Shihy: performance coach, six years and 18+ titles with Al Ahly SC. Online, hybrid and in-person coaching, mentorship for coaches, and training programs. Find the problem. Fix the problem.",
  social: {
    instagram: { label: "Instagram", handle: "@shihy.sc", href: "https://www.instagram.com/shihy.sc/" },
    // CONFIRM: his own YouTube channel URL. Until then, links go to the interview below.
    youtube: { label: "YouTube", handle: "", href: "" },
  },
} as const;

export const nav = [
  { href: "/coaching", label: "Coaching" },
  { href: "/mentorship", label: "Mentorship" },
  { href: "/programs", label: "Programs" },
  { href: "/film-room", label: "Film room" },
  { href: "/about", label: "About" },
] as const;

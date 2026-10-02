// Everything about Shihy that appears in more than one place.
// Positioning (Oct 2026 feedback): high performance coaching for athletes and
// high-achieving professionals. Al Ahly is career history (About page record),
// not a headline: he left the club in August 2026.

export const site = {
  name: "Mohamed El Shihy",
  short: "Shihy",
  arabic: "محمد الشيحى",
  motto: ["Find the problem.", "Fix the problem."] as const,
  role: "High performance coach · 11 years",
  roleShort: "High performance coach for athletes and high achievers",
  base: "Cairo, Egypt",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://shihysc.com",
  description:
    "Mohamed El Shihy: high performance coach for athletes and high-achieving professionals, with 11 years of coaching experience. Online and hybrid coaching: Online, Premium and Pro. Find the problem. Fix the problem.",
  social: {
    instagram: { label: "Instagram", handle: "@shihy.sc", href: "https://www.instagram.com/shihy.sc/" },
    youtube: { label: "YouTube", handle: "@shihy_sc", href: "https://www.youtube.com/@shihy_sc" },
  },
} as const;

export const nav = [
  { href: "/coaching", label: "Coaching" },
  { href: "/mentorship", label: "Mentorship" },
  { href: "/film-room", label: "Film room" },
  { href: "/about", label: "About" },
] as const;

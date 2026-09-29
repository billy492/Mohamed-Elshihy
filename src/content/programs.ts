// Template training programs. CONFIRM: names, lengths and contents are
// proposals for Shihy to replace with his real products. A program with a
// `checkout` URL (Gumroad, Lemon Squeezy, Stan…) shows a buy link; without one
// it collects a waitlist, which lands in the review desk.

export type Program = {
  slug: string;
  name: string;
  focus: string;
  weeks: number;
  perWeek: number;
  level: "Beginner" | "Intermediate" | "Advanced" | "All levels";
  equipment: string;
  forWho: string;
  checkout?: string;
  price?: string;
};

export const programs: Program[] = [
  {
    slug: "sprint-foundations",
    name: "Sprint foundations",
    focus: "Acceleration and top speed, with the strength behind them.",
    weeks: 8,
    perWeek: 3,
    level: "Intermediate",
    equipment: "Gym and a pitch or track",
    forWho: "Footballers and field-sport athletes",
  },
  {
    slug: "hamstring-resilience",
    name: "Hamstring resilience",
    focus: "Eccentric strength and top-speed exposure, built to sit on top of your training.",
    weeks: 6,
    perWeek: 2,
    level: "All levels",
    equipment: "Minimal: a bench and a partner",
    forWho: "Anyone who sprints for their sport",
  },
  {
    slug: "off-season-footballer",
    name: "The off-season footballer",
    focus: "Strength, power and aerobic base, so pre-season doesn't break you.",
    weeks: 10,
    perWeek: 4,
    level: "Intermediate",
    equipment: "Full gym and open space",
    forWho: "Footballers between seasons",
  },
  {
    slug: "strength-base",
    name: "Strength base",
    focus: "A full-gym strength program with progress you can measure every week.",
    weeks: 12,
    perWeek: 3,
    level: "Beginner",
    equipment: "Full gym",
    forWho: "Trainees building their first real base",
  },
];

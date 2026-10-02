// The coaching levels, word for word from Shihy's client brochure
// ("High Performance Coaching", content/IMG_4414.JPG, Sep 2026). Lists are in
// his order: where the brochure says "by priority", the first items matter most.
// Copy is stored in sentence case; the site sets it in capitals with CSS.

import { films, work, type Film, type Photo } from "./media";

// Prices are deliberately not in the code: the site never shows them (brief,
// confirmed by the client), and this repository is public.

export type TierId = "online" | "athlete" | "premium" | "pro";

export type Tier = {
  id: TierId;
  /** The brochure's program line, e.g. "Program 01, Foundation". */
  program: string;
  name: string;
  badge: string;
  who: string;
  /** Pro is two coaching tracks under one level. */
  tracks?: { name: string; text: string }[];
  /** Heading over the list: what the level adds to the one below it. */
  plus: string;
  includes: string[];
  addOn?: { name: string };
  /** Extra one-to-one sessions can be added. */
  extraSession?: boolean;
  /** One-to-one coaching sessions a month, as the brochure states them. */
  sessions: string;
  film: Film;
  photo: Photo;
  /** For the apply form: which options this level leads to. */
  apply: string;
};

const FACILITY = { name: "Facility access & training" };

export const tiers: Tier[] = [
  {
    id: "online",
    program: "Program 01, Foundation",
    name: "Online",
    badge: "Professionals & recreational",
    who: "For high-achieving professionals with demanding schedules, recreational athletes, and independent trainers. Minor injury rehab included where appropriate.",
    plus: "What's included",
    includes: [
      "Initial consultation & goal-setting session",
      "Individualized training program",
      "CoachRx app access (remote delivery)",
      "Exercise video library",
      "Monthly program updates",
      "Weekly feedback through the app",
      "Training load & recovery monitoring",
      "CoachRx app chat, primary communication",
      "WhatsApp support (2–3 business day response)",
      "Ongoing coaching & accountability",
    ],
    addOn: FACILITY,
    sessions: "Remote",
    film: films.barbell,
    photo: work.gymRotate,
    apply: "/apply?pathway=online",
  },
  {
    id: "athlete",
    program: "Program 02, Foundation+",
    name: "Online",
    badge: "Competitive / pro athlete",
    who: "For professional and competitive athletes training independently, built around your competition calendar.",
    plus: "Everything above, plus",
    includes: [
      "Competition-phase periodization",
      "Faster response time (24–48h)",
      "Bi-weekly program updates during competition periods",
      "Priority upgrade path to Premium or Pro",
    ],
    addOn: FACILITY,
    sessions: "Remote",
    film: films.sprintStart,
    photo: work.sprintDemo,
    apply: "/apply?pathway=athlete",
  },
  {
    id: "premium",
    program: "Program 03, Performance",
    name: "Premium",
    badge: "Hybrid · most popular",
    who: "Online programming combined with in-person facility support. A close coaching experience for athletes who want greater accountability and hands-on guidance.",
    plus: "Everything in Online, plus",
    includes: [
      "Up to 4 one-to-one coaching sessions per month",
      "Comprehensive performance assessment",
      "Facility usage included",
      "Weekly program adjustments",
      "2 lifestyle calls per month",
      "Priority communication",
    ],
    extraSession: true,
    sessions: "Up to 4 one-to-one sessions a month",
    film: films.pullups,
    photo: work.coachingPlayers,
    apply: "/apply?pathway=premium",
  },
  {
    id: "pro",
    program: "Program 04, Elite performance",
    name: "Pro",
    badge: "Limited spots · 5 clients",
    who: "By application. Spots are limited to five clients.",
    tracks: [
      {
        name: "Performance",
        text: "For elite athletes chasing the extra 10%, and clients who want the closest possible coaching relationship. By application; limited spots.",
      },
      {
        name: "Rehab & return-to-play",
        text: "For athletes recovering from major injury, working toward a full, structured return to play. By application; limited spots.",
      },
    ],
    plus: "Everything in Premium, plus",
    includes: [
      "Up to 8 one-to-one coaching sessions per month",
      "Advanced performance assessments (force plates, force frames, etc.)",
      "Pinpoint where power, speed, or strength is leaking, uncover asymmetries, and fix them",
      "Individualized competition and season planning",
      "Travel planning and program adjustments to maintain progress wherever you are",
      "Daily coordination with your team: S&C, physio, specialist referral network",
      "GPS data integration, where available, to benchmark against competition-level standards",
      "Highest priority communication and support",
      "Facility access included",
      "Performance management built on elite-sport systems & standards",
    ],
    extraSession: true,
    sessions: "Up to 8 one-to-one sessions a month",
    film: films.juggle,
    photo: work.squadWarmup,
    apply: "/apply?pathway=pro",
  },
];

export const pricingNote =
  "No prices here. Your coaching is built around your problem, so we talk investment after your application.";

// "Process & Philosophy" (brochure).
export const processText =
  "Every client begins with a comprehensive consultation covering goals, training history, injury history, lifestyle, and performance objectives. From there, a fully individualized plan is created and continuously refined using your feedback, training data, and progress.";
export const philosophyText =
  "Every decision is made with one objective: helping you move better, perform better, and achieve sustainable results through intelligent coaching, structured progression, and consistent support.";

// "Coaching Policies: clear terms, so every client knows exactly what to expect."
export const policies = [
  { name: "No freezing", text: "Packages cannot be frozen or paused, across any tier." },
  {
    name: "Cancellations & no-shows",
    text: "Sessions cancelled with less than 2 hours' notice, and missed sessions, are counted as used.",
  },
  {
    name: "Payment terms",
    text: "Payment is due before the start of each monthly cycle. Coaching is paused until payment is received.",
  },
  {
    name: "3-month commitment",
    text: "Paid in full upfront. Unused sessions do not roll over beyond the 3-month period.",
  },
  {
    name: "Non-refundable",
    text: "All packages, including the 3-Month Performance Commitment, are non-refundable once paid.",
  },
  {
    name: "Response times",
    text: "Online, general: 2–3 business days. Online, athlete: 24–48h. Premium & Pro: priority communication.",
  },
  {
    name: "Facility access",
    text: "Coordinated by our sales team, who will assist in setting up your Face ID for facility entry.",
  },
];

// A real sequence, so it is numbered.
export const method = [
  { name: "Assess", text: "Movement, strength, speed, history. Nothing gets prescribed before it gets measured." },
  {
    name: "Find the problem",
    text: "The data points to the limiter: the one thing costing you the most performance, or putting you most at risk.",
  },
  { name: "Build the fix", text: "A program written for that problem, your sport, your calendar and your equipment. Nothing generic." },
  { name: "Train", text: "You execute. I coach: check-ins, video review, or on the floor with you." },
  { name: "Re-test", text: "We measure again. Fixed? We hunt the next one. Not fixed? The plan changes." },
] as const;

// Problem archetypes: what Shihy looks for and how he fixes it. Deliberately
// not case studies with invented results; real case studies go in
// `caseStudies` below once athletes agree to be featured.
export const problems = [
  {
    name: "The hamstring that keeps going",
    find: "Eccentric hamstring strength, how much top-speed running you actually do, and how you run at top speed.",
    fix: "Progressive eccentric strength, regular top-speed exposure, and mechanics that stop you braking on every step.",
  },
  {
    name: "Fast in the gym, slow on the pitch",
    find: "Acceleration and top speed tested on the field, not just gym numbers, and how your force turns into speed.",
    fix: "Sprint work, jumps and strength that transfers, sequenced so you're fresh for the fast work.",
  },
  {
    name: "Gone by the 70th minute",
    find: "Your conditioning profile against the demands of your position, and your training load week to week.",
    fix: "Conditioning built for repeated high-intensity efforts, with a load you can actually recover from.",
  },
  {
    name: "Back from injury, but not back",
    find: "Strength and power differences between sides, and where you really are on the return-to-play path.",
    fix: "A staged return with clear criteria for every step, coordinated with your physio.",
  },
  {
    name: "Strong, but stuck",
    find: "Your training history, technique, recovery, and the program itself.",
    fix: "A clear progression, adjusted by what the numbers show rather than by feel.",
  },
  {
    name: "High output, no time",
    find: "Your schedule, travel, sleep and stress, and how much training you can realistically fit around them.",
    fix: "Efficient sessions that fit the calendar, with recovery built in, so training gives you energy instead of taking it.",
  },
  {
    name: "Always sore, always tired",
    find: "Sleep, spikes in workload, nutrition timing and how your sessions are structured.",
    fix: "Load you can recover from, and a plan that adapts week to week.",
  },
] as const;

export type CaseStudy = { athlete: string; problem: string; found: string; fixed: string; result: string };

// Add real case studies here (with the athlete's permission). Hidden while empty.
export const caseStudies: CaseStudy[] = [];

export type Testimonial = { quote: string; name: string; context: string };

// Add real testimonials here. Hidden while empty.
export const testimonials: Testimonial[] = [];

// The credentials ticker. Every line is sourced (see content/record.ts).
export const credentials = [
  "11 years coaching",
  "MSc Strength & Conditioning, ALTIS (in progress)",
  "Fitness director, REVOLT",
  "Gym Jones fully certified instructor",
  "EXOS Performance Specialist",
  "FRC Mobility Specialist",
  "CPPS",
  "Westside Barbell Special Strengths Coach",
  "OPEX CCP Coach",
  "CrossFit L1 & Weightlifting",
  "Red Bull Athlete Performance Center, 2026",
];

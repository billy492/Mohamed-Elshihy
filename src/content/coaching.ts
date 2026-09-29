// The three coaching pathways, the method, and the problems Shihy fixes.
// Prices are deliberately absent everywhere: they are discussed after the
// application, on a call (brief, section 1).
// Copy is stored in sentence case; the site sets it in capitals with CSS.
// CONFIRM: pathway details (delivery app, check-in cadence, what "in person"
// includes) with Shihy before launch.

import { films, type Film } from "./media";

export type PathwayId = "online" | "hybrid" | "performance";

export type Pathway = {
  id: PathwayId;
  name: string;
  short: string;
  punch: string;
  who: string;
  how: string;
  includes: string[];
  /** Share of the coaching that happens face to face, 0 to 1. */
  inPerson: number;
  inPersonLabel: string;
  film: Film;
};

export const pathways: Pathway[] = [
  {
    id: "online",
    name: "Online coaching",
    short: "Online",
    punch: "Elite programming. Anywhere.",
    who: "Athletes and serious trainees anywhere in the world.",
    how: "Remote assessment, a program written for your problem, weekly check-ins and video review of every key lift and sprint.",
    includes: ["Remote assessment", "Individual program in the app", "Weekly check-ins", "Video review"],
    inPerson: 0,
    inPersonLabel: "Fully remote",
    film: films.barbell,
  },
  {
    id: "hybrid",
    name: "Hybrid coaching",
    short: "Hybrid",
    punch: "Remote programming. In-person precision.",
    who: "Athletes in Cairo who train on their own but want hands-on testing and technique work.",
    how: "Everything in Online, plus in-person testing and technique sessions at the moments that matter most.",
    includes: ["Everything in Online", "In-person testing each block", "Technique sessions", "Re-testing in person"],
    inPerson: 0.45,
    inPersonLabel: "Scheduled sessions",
    film: films.pullups,
  },
  {
    id: "performance",
    name: "Performance coaching",
    short: "Performance",
    punch: "The full performance service.",
    who: "Professional and aspiring pro athletes preparing for a season, a trial or a comeback.",
    how: "Full in-person testing, a complete strength, speed and conditioning plan, load management, and direct work with your club or medical team.",
    includes: ["Full testing battery", "Strength, speed, conditioning", "Load management", "Return-to-play planning"],
    inPerson: 0.9,
    inPersonLabel: "Regular sessions",
    film: films.juggle,
  },
];

export const pricingNote =
  "No prices here. Your coaching is built around your problem, so we talk investment after your application.";

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
  "6 years at Al Ahly SC",
  "18+ championships",
  "MSc Strength & Conditioning, ALTIS (in progress)",
  "Gym Jones certified instructor",
  "Certified Functional Strength Coach",
  "Fitness director, Revolt Fitness",
  "Red Bull Athlete Performance Center, 2026",
];

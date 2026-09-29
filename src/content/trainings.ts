// Every way to train with Shihy, listed straight under the opening so a
// visitor knows within seconds that there is something to apply for.
// Each entry links to its own application (or, for programs, the waitlist).
// Copy is stored in sentence case; the site sets it in capitals with CSS.
// CONFIRM the one-line descriptions with Shihy along with the pathway details.

import { shots, type Shot } from "./media";

export type Training = {
  id: string;
  /** The word set big. */
  name: string;
  /** What kind of training it is. */
  kind: string;
  /** How it is delivered. */
  where: string;
  line: string;
  href: string;
  action: string;
  shot: Shot;
  /** Where the photo is cropped for the square-ish thumbnail. */
  focus: string;
};

export const trainings: Training[] = [
  {
    id: "online",
    name: "Online",
    kind: "Coaching",
    where: "Fully remote",
    line: "A program written for your problem, weekly check-ins and video review, wherever you train.",
    href: "/apply?pathway=online",
    action: "Apply",
    shot: shots.trainingRow,
    focus: "50% 40%",
  },
  {
    id: "hybrid",
    name: "Hybrid",
    kind: "Coaching",
    where: "Remote and in Cairo",
    line: "Remote programming, with in-person testing and technique sessions when they matter most.",
    href: "/apply?pathway=hybrid",
    action: "Apply",
    shot: shots.coachingAthletes,
    focus: "50% 38%",
  },
  {
    id: "performance",
    name: "Performance",
    kind: "Coaching",
    where: "In person",
    line: "The full service for pro and aspiring pro athletes: testing, strength, speed and load.",
    href: "/apply?pathway=performance",
    action: "Apply",
    shot: shots.pitch,
    focus: "50% 22%",
  },
  {
    id: "mentorship",
    name: "Mentorship",
    kind: "For coaches",
    where: "One to one or small group",
    line: "For S&C coaches, club fitness staff, trainers and physios who want to see the problem first.",
    href: "/apply?track=mentorship",
    action: "Apply",
    shot: shots.coachingTalk,
    focus: "50% 62%",
  },
  {
    id: "programs",
    name: "Programs",
    kind: "Train on your own",
    where: "Self-guided",
    line: "Ready-made plans for the most common problems, for when one-to-one isn't the fit yet.",
    href: "/programs",
    action: "Join the waitlist",
    shot: shots.trainingFloor,
    focus: "50% 55%",
  },
];

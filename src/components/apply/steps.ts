import {
  COACH_ROLES,
  DAYS,
  EQUIPMENT,
  EXPERIENCE,
  FORMATS,
  GAPS,
  GOALS,
  INVESTMENT,
  LEVELS,
  PATHWAYS,
  SOURCES,
  START,
  TRAINING_YEARS,
  type Option,
} from "@/lib/apply/options";
import type { Track } from "@/lib/apply/schema";

// The application as data: which questions, in which order, grouped into steps.
// Validation lives in lib/apply/schema.ts; each step is checked against the
// same schema, restricted to its own fields.

export type Field =
  | {
      kind: "choice";
      name: string;
      label: string;
      options: readonly Option[];
      multiple?: boolean;
      max?: number;
      layout?: "cards" | "chips";
      hint?: string;
    }
  | {
      kind: "text";
      name: string;
      label: string;
      type?: "text" | "email" | "tel";
      inputMode?: "text" | "email" | "tel" | "numeric" | "url";
      autoComplete?: string;
      placeholder?: string;
      optional?: boolean;
      hint?: string;
      suggestions?: readonly string[];
      width?: "short" | "full";
    }
  | { kind: "textarea"; name: string; label: string; optional?: boolean; hint?: string; rows?: number }
  | { kind: "scale"; name: string; label: string; low: string; high: string }
  | { kind: "consent"; name: string };

export type Step = { id: string; nav: string; title: string; intro?: string; fields: Field[] };

const contact: Field[] = [
  { kind: "text", name: "name", label: "Full name", autoComplete: "name" },
  { kind: "text", name: "email", label: "Email", type: "email", inputMode: "email", autoComplete: "email" },
  {
    kind: "text",
    name: "phone",
    label: "WhatsApp number",
    type: "tel",
    inputMode: "tel",
    autoComplete: "tel",
    placeholder: "+20 100 000 0000",
    hint: "With the country code. This is usually how Shihy replies.",
  },
];
const place: Field = {
  kind: "text",
  name: "location",
  label: "City and country",
  autoComplete: "address-level2",
  placeholder: "Cairo, Egypt",
};
const instagram: Field = {
  kind: "text",
  name: "instagram",
  label: "Instagram",
  optional: true,
  placeholder: "@yourhandle",
  width: "short",
};
const lastThing = (investmentLabel: string): Step => ({
  id: "last",
  nav: "Last thing",
  title: "Last thing",
  fields: [
    { kind: "choice", name: "investment", label: investmentLabel, options: INVESTMENT, layout: "chips" },
    { kind: "choice", name: "source", label: "Where did you hear about Shihy?", options: SOURCES, layout: "chips" },
    { kind: "textarea", name: "extra", label: "Anything else Shihy should know?", optional: true, rows: 3 },
    { kind: "consent", name: "consent" },
  ],
});

export const COACHING_STEPS: Step[] = [
  {
    id: "pathway",
    nav: "Coaching",
    title: "Which coaching do you want?",
    intro: "Not sure is a fine answer. Shihy will recommend one after reading your application. Pro is by application and invitation only.",
    fields: [{ kind: "choice", name: "pathway", label: "Coaching", options: PATHWAYS, layout: "cards" }],
  },
  {
    id: "you",
    nav: "About you",
    title: "About you",
    intro: "So Shihy can reply. Your details are only used for this application.",
    fields: [
      ...contact,
      { kind: "text", name: "age", label: "Age", inputMode: "numeric", width: "short" },
      place,
      instagram,
    ],
  },
  {
    id: "sport",
    nav: "Your sport",
    title: "Your sport and level",
    fields: [
      {
        kind: "text",
        name: "sport",
        label: "Main sport",
        placeholder: "Football",
        suggestions: ["Football", "Basketball", "Handball", "Volleyball", "Tennis", "Squash", "Athletics", "Combat sports", "General training"],
      },
      { kind: "choice", name: "level", label: "Level", options: LEVELS, layout: "chips" },
      { kind: "text", name: "position", label: "Position", optional: true, width: "short" },
      { kind: "text", name: "club", label: "Club or team", optional: true },
      { kind: "choice", name: "trainingYears", label: "How long have you trained seriously?", options: TRAINING_YEARS, layout: "chips" },
    ],
  },
  {
    id: "problem",
    nav: "The problem",
    title: "What's the problem?",
    intro:
      "The most important part of the application. Be specific: what's holding you back, when it started, and what you've already tried.",
    fields: [
      { kind: "choice", name: "goals", label: "What do you want?", options: GOALS, multiple: true, max: 3, layout: "chips", hint: "Choose up to three." },
      { kind: "textarea", name: "problem", label: "The problem, in your own words", rows: 6 },
      {
        kind: "textarea",
        name: "injuries",
        label: "Injuries in the last two years",
        optional: true,
        rows: 3,
        hint: "What happened, when, and whether it still bothers you.",
      },
    ],
  },
  {
    id: "training",
    nav: "Your training",
    title: "Your training right now",
    fields: [
      { kind: "choice", name: "trainingDays", label: "Days a week you can train", options: DAYS, layout: "chips" },
      { kind: "choice", name: "equipment", label: "What you have access to", options: EQUIPMENT, layout: "chips" },
      { kind: "choice", name: "start", label: "When you'd like to start", options: START, layout: "chips" },
      { kind: "scale", name: "commitment", label: "How committed are you to fixing it?", low: "Curious", high: "All in" },
    ],
  },
  lastThing("One-to-one coaching is an investment. If you're a fit, are you ready to make it?"),
];

export const MENTORSHIP_STEPS: Step[] = [
  {
    id: "you",
    nav: "About you",
    title: "About you",
    intro: "So Shihy can reply. Your details are only used for this application.",
    fields: [...contact, place, instagram],
  },
  {
    id: "coaching",
    nav: "Your coaching",
    title: "Your coaching so far",
    fields: [
      { kind: "choice", name: "role", label: "Your role", options: COACH_ROLES, layout: "chips" },
      { kind: "text", name: "organization", label: "Club, gym or organisation", optional: true },
      { kind: "choice", name: "experience", label: "How long you've been coaching", options: EXPERIENCE, layout: "chips" },
      { kind: "textarea", name: "credentials", label: "Education and certifications", optional: true, rows: 3 },
    ],
  },
  {
    id: "gap",
    nav: "The gap",
    title: "What do you want to get better at?",
    intro: "Be specific: where you get stuck with athletes, and what you'd like to be able to do.",
    fields: [
      { kind: "choice", name: "gaps", label: "Areas", options: GAPS, multiple: true, max: 3, layout: "chips", hint: "Choose up to three." },
      { kind: "textarea", name: "problem", label: "In your own words", rows: 6 },
    ],
  },
  {
    id: "format",
    nav: "Format",
    title: "How you'd like to learn",
    fields: [
      { kind: "choice", name: "format", label: "Format", options: FORMATS, layout: "chips" },
      { kind: "choice", name: "start", label: "When you'd like to start", options: START, layout: "chips" },
      { kind: "text", name: "links", label: "Links to your work", optional: true, placeholder: "Instagram, LinkedIn, a website" },
    ],
  },
  lastThing("Mentorship is an investment. If you're a fit, are you ready to make it?"),
];

export const stepsFor = (track: Track) => (track === "coaching" ? COACHING_STEPS : MENTORSHIP_STEPS);

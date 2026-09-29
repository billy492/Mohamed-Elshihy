import { z } from "zod";
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
  STATUSES,
  TRAINING_YEARS,
  ids,
} from "./options";

// One schema, used twice: by the form to check each step before moving on, and
// by the server, which never trusts the browser. Messages say what to do.

const text = (min: number, max: number, error: string) =>
  z.string({ error }).trim().min(min, { error }).max(max, { error: `Keep this under ${max} characters.` });
const optionalText = (max: number) =>
  z.string().trim().max(max, { error: `Keep this under ${max} characters.` }).default("");
const pick = <T extends readonly [string, ...string[]]>(values: T, error: string) =>
  z.enum(values, { error });

export const contactFields = {
  name: text(2, 80, "Enter your full name."),
  email: z.email({ error: "Enter an email address you can be reached at." }).max(120),
  phone: z
    .string({ error: "Enter your WhatsApp number with the country code." })
    .trim()
    .regex(/^\+?[\d\s()-]{7,20}$/, { error: "Enter your WhatsApp number with the country code, like +20 100 000 0000." }),
  location: text(2, 80, "Enter the city and country you live in."),
  instagram: optionalText(60),
};

export const closingFields = {
  source: pick(ids(SOURCES), "Choose where you heard about Shihy."),
  consent: z.literal(true, { error: "Tick the box to send your application." }),
};

export const coachingSchema = z.object({
  track: z.literal("coaching"),
  pathway: pick(ids(PATHWAYS), "Choose a pathway, or pick “I'm not sure yet”."),
  ...contactFields,
  age: z.coerce
    .number({ error: "Enter your age in years." })
    .int({ error: "Enter your age in years." })
    .min(12, { error: "Applicants need to be at least 12." })
    .max(90, { error: "Enter your age in years." }),
  sport: text(2, 60, "Tell me your main sport, or write “general training”."),
  level: pick(ids(LEVELS), "Choose the level you play or train at."),
  position: optionalText(60),
  club: optionalText(80),
  trainingYears: pick(ids(TRAINING_YEARS), "Choose how long you've trained seriously."),
  goals: z
    .array(pick(ids(GOALS), "Choose from the list."))
    .min(1, { error: "Choose at least one." })
    .max(3, { error: "Choose up to three." }),
  problem: text(30, 2000, "Describe the problem in a couple of sentences, at least 30 characters."),
  injuries: optionalText(1200),
  trainingDays: pick(ids(DAYS), "Choose how many days a week you can train."),
  equipment: pick(ids(EQUIPMENT), "Choose what you have access to."),
  start: pick(ids(START), "Choose when you'd like to start."),
  commitment: z.coerce
    .number({ error: "Choose a number from 1 to 10." })
    .int()
    .min(1, { error: "Choose a number from 1 to 10." })
    .max(10, { error: "Choose a number from 1 to 10." }),
  investment: pick(ids(INVESTMENT), "Choose one."),
  extra: optionalText(1200),
  ...closingFields,
});

export const mentorshipSchema = z.object({
  track: z.literal("mentorship"),
  ...contactFields,
  role: pick(ids(COACH_ROLES), "Choose the role closest to yours."),
  organization: optionalText(80),
  experience: pick(ids(EXPERIENCE), "Choose how long you've been coaching."),
  credentials: optionalText(600),
  gaps: z
    .array(pick(ids(GAPS), "Choose from the list."))
    .min(1, { error: "Choose at least one." })
    .max(3, { error: "Choose up to three." }),
  problem: text(30, 2000, "Describe what you want to get better at, at least 30 characters."),
  format: pick(ids(FORMATS), "Choose a format."),
  start: pick(ids(START), "Choose when you'd like to start."),
  investment: pick(ids(INVESTMENT), "Choose one."),
  links: optionalText(300),
  ...closingFields,
});

export const applicationSchema = z.discriminatedUnion("track", [coachingSchema, mentorshipSchema]);

export type CoachingInput = z.infer<typeof coachingSchema>;
export type MentorshipInput = z.infer<typeof mentorshipSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type Track = ApplicationInput["track"];
export type Status = (typeof STATUSES)[number]["id"];

/** What the review desk stores: the answers plus Shihy's own triage. */
export type Application = ApplicationInput & {
  id: string;
  ref: string;
  createdAt: string;
  updatedAt: string;
  status: Status;
  starred: boolean;
  deskNotes: string;
  country?: string;
};

export const waitlistSchema = z.object({
  email: z.email({ error: "Enter an email address." }).max(120),
  program: z.string().trim().min(1).max(80),
});

export type WaitlistEntry = z.infer<typeof waitlistSchema> & { id: string; createdAt: string };

/** Flatten zod issues into { field: first message } for the form. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

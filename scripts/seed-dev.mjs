#!/usr/bin/env node
// Seeds the local file store (.data/store.json) with TEST applications and
// waitlist sign-ups, so the review desk has something to show in development.
//
//   node scripts/seed-dev.mjs          adds 10 applications and 6 sign-ups
//   node scripts/seed-dev.mjs --again  adds another batch even if test data exists
//
// Every seeded name ends in " (test)" and every email is @example.com, so none
// of it can be mistaken for a real applicant. Existing entries are kept. The
// script refuses to run anywhere that looks like production.

import { randomBytes, randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

if (process.env.NODE_ENV === "production" || process.env.VERCEL || process.env.DEPLOY_TARGET) {
  console.error("seed-dev: refusing to run with NODE_ENV=production or on Vercel. This script is for local development only.");
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, ".data");
const file = path.join(dir, "store.json");

/* ------------------------------ read the store ----------------------------- */

let data = { applications: [], waitlist: [] };
try {
  data = JSON.parse(await fs.readFile(file, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") {
    console.error(`seed-dev: ${file} exists but couldn't be read as JSON, so nothing was changed.\n${error.message}`);
    process.exit(1);
  }
}
if (!Array.isArray(data.applications)) data.applications = [];
if (!Array.isArray(data.waitlist)) data.waitlist = [];

if (!process.argv.includes("--again") && data.applications.some((a) => String(a.name).endsWith(" (test)"))) {
  console.log("seed-dev: test applications are already in .data/store.json. Run with --again to add another batch.");
  process.exit(0);
}

/* --------------------------------- helpers --------------------------------- */

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const refs = new Set(data.applications.map((a) => a.ref));
function newRef() {
  let ref;
  do {
    ref = "SH-" + [...randomBytes(5)].map((b) => ALPHABET[b % ALPHABET.length]).join("");
  } while (refs.has(ref));
  refs.add(ref);
  return ref;
}

const now = Date.now();
const HOUR = 3_600_000;
const at = (hoursAgo) => new Date(now - hoursAgo * HOUR).toISOString();

/** The desk's own fields on top of the answers. */
function application(hoursAgo, desk, answers) {
  const createdAt = at(hoursAgo);
  const touched = desk.status !== "new" || desk.starred || desk.deskNotes;
  return {
    ...answers,
    consent: true,
    id: randomUUID(),
    ref: newRef(),
    createdAt,
    // Triaged ones were last touched a while after they arrived.
    updatedAt: touched ? at(Math.max(0.2, hoursAgo * 0.6)) : createdAt,
    status: desk.status,
    starred: Boolean(desk.starred),
    deskNotes: desk.deskNotes ?? "",
    ...(desk.country ? { country: desk.country } : {}),
  };
}

/* ------------------------------ applications ------------------------------- */
// Phone numbers are fictional: UK numbers are from Ofcom's drama range and the
// North American one is a 555-01xx number; the others are zero-padded.

const applications = [
  application(2, { status: "new", country: "EG" }, {
    track: "coaching",
    pathway: "hybrid",
    name: "Omar Hassan (test)",
    email: "omar.hassan.test@example.com",
    phone: "+20 100 000 0001",
    location: "Cairo, Egypt",
    instagram: "@test.omar.winger",
    age: 19,
    sport: "Football",
    level: "academy",
    position: "Winger",
    club: "Test FC U19",
    trainingYears: "3-5",
    goals: ["speed", "injury-risk"],
    problem:
      "I'm quick over the first 10 metres but I fade badly after 30. I've pulled my right hamstring twice this year, both times in the last 15 minutes of a match.\n\nMy academy coach says it's conditioning, but the gym work they give us is the same for everyone.",
    injuries: "Right hamstring strain (grade 1) in February and again in June. Physio cleared me both times after about three weeks.",
    trainingDays: "4",
    equipment: "basic-gym",
    start: "now",
    commitment: 9,
    investment: "ready",
    extra: "",
    source: "instagram",
  }),
  application(9, { status: "new", country: "EG" }, {
    track: "coaching",
    pathway: "performance",
    name: "يوسف عبد الرحمن (test)",
    email: "youssef.abdelrahman.test@example.com",
    // Typed the local way, without +20: the desk's WhatsApp link adds it.
    phone: "0100 000 0002",
    location: "الإسكندرية، مصر",
    instagram: "",
    age: 24,
    sport: "Football",
    level: "semi-pro",
    position: "Centre-back",
    club: "Test SC (Second Division)",
    trainingYears: "5+",
    goals: ["power", "strength", "season"],
    problem:
      "أخسر معظم الالتحامات الهوائية أمام المهاجمين الأطول مني، وقفزتي لم تتحسن منذ سنتين رغم أنني أتمرن في الجيم ثلاث مرات أسبوعيًا. أريد برنامجًا واضحًا قبل بداية الموسم.",
    injuries: "",
    trainingDays: "5",
    equipment: "full-gym",
    start: "month",
    commitment: 8,
    investment: "discuss",
    extra: "أفضّل التواصل على واتساب بعد الساعة ٨ مساءً.",
    source: "referral",
  }),
  application(20, { status: "new", country: "SA" }, {
    track: "mentorship",
    name: "Nour El-Din Samir (test)",
    email: "nour.samir.test@example.com",
    phone: "+966 50 000 0009",
    location: "Riyadh, Saudi Arabia",
    instagram: "",
    role: "pt",
    organization: "Test Fitness Studio",
    experience: "0-2",
    credentials: "",
    gaps: ["business", "programming"],
    problem:
      "I have 14 personal training clients but I want to move online and work with footballers. I don't know how to structure programs for athletes in-season, or how to price online coaching.",
    format: "group",
    start: "later",
    investment: "discuss",
    links: "instagram.com/test.coach.nour",
    source: "instagram",
  }),
  application(28, {
    status: "shortlisted",
    starred: true,
    country: "EG",
    deskNotes:
      "Strong fit. Ask about her tournament calendar for Oct–Dec before proposing a block.\nParent should be on the first call (she's 16).",
  }, {
    track: "coaching",
    pathway: "hybrid",
    name: "Sara Mahmoud (test)",
    email: "sara.mahmoud.test@example.com",
    phone: "+20 111 000 0003",
    location: "Giza, Egypt",
    instagram: "test_sara_squash",
    age: 16,
    sport: "Squash",
    level: "national",
    position: "",
    club: "Test Sporting Club",
    trainingYears: "5+",
    goals: ["speed", "conditioning"],
    problem:
      "I win the first two games and then lose the match. By the fourth game my legs are gone and I stop getting to the front corners. My on-court coach wants me fitter but I don't know what that means for my gym work.",
    injuries: "",
    trainingDays: "6+",
    equipment: "full-gym",
    start: "now",
    commitment: 10,
    investment: "ready",
    extra: "Junior nationals are in December.",
    source: "club",
  }),
  application(33, { status: "shortlisted", starred: true, country: "EG" }, {
    track: "mentorship",
    name: "Ahmed Fathy (test)",
    email: "ahmed.fathy.test@example.com",
    phone: "+20 101 000 0008",
    location: "Cairo, Egypt",
    instagram: "",
    role: "club-fitness",
    organization: "Test Youth Football Academy",
    experience: "2-5",
    credentials: "BSc Physical Education (Helwan University).\nNSCA-CSCS candidate, exam in March.",
    gaps: ["load", "rtp", "pro-sport"],
    problem:
      "I run the physical side for three age groups (U15 to U19) with no GPS and no budget. I don't know how to monitor load properly or plan return to play after injuries, so I end up guessing.",
    format: "1to1",
    start: "month",
    investment: "ready",
    links: "https://example.com/ahmed-fathy-cv",
    source: "instagram",
  }),
  application(54, { status: "reviewing", country: "GB" }, {
    track: "coaching",
    pathway: "online",
    name: "Daniel Okafor (test)",
    email: "daniel.okafor.test@example.com",
    phone: "+44 7700 900123",
    location: "London, United Kingdom",
    instagram: "",
    age: 29,
    sport: "Sunday league football",
    level: "amateur",
    position: "Striker",
    club: "",
    trainingYears: "1-3",
    goals: ["body", "strength", "pain"],
    problem:
      "My lower back gets tight after every match and I can't deadlift without pain the day after. I want to get stronger and lose about 6 kg, but I keep stopping and starting because of the back.",
    injuries: "No diagnosis. A physio once said \"weak glutes\".",
    trainingDays: "3",
    equipment: "full-gym",
    start: "month",
    commitment: 6,
    investment: "discuss",
    extra: "",
    source: "youtube",
  }),
  application(92, {
    status: "contacted",
    country: "AE",
    deskNotes: "Sent a WhatsApp on Thursday. Waiting for his surgeon's discharge notes before we start.",
  }, {
    track: "coaching",
    pathway: "online",
    name: "Karim Nabil (test)",
    email: "karim.nabil.test@example.com",
    phone: "+971 50 000 0005",
    location: "Dubai, UAE",
    instagram: "",
    age: 34,
    sport: "Padel",
    level: "recreational",
    position: "",
    club: "",
    trainingYears: "0-1",
    goals: ["injury-return"],
    problem:
      "I tore my ACL playing padel nine months ago (reconstruction in January). I'm cleared to play, but I don't trust the knee when I change direction, and I've stopped going to the court.",
    injuries: "Left ACL reconstruction (hamstring graft), January 2026. Finished physio in May.",
    trainingDays: "3",
    equipment: "home",
    start: "now",
    commitment: 7,
    investment: "ready",
    extra: "",
    source: "instagram",
  }),
  application(123, { status: "accepted", starred: true, country: "EG" }, {
    track: "coaching",
    pathway: "performance",
    name: "Mariam Adel (test)",
    email: "mariam.adel.test@example.com",
    phone: "+20 122 000 0006",
    location: "Mansoura, Egypt",
    instagram: "",
    age: 21,
    sport: "Handball",
    level: "pro",
    position: "Left back",
    club: "Test Handball Club",
    trainingYears: "5+",
    goals: ["power", "injury-risk", "season"],
    problem:
      "Shoulder pain when I shoot at full power, mostly in the second half. Our team physio says it's overuse. Pre-season starts in five weeks and I want to arrive stronger without making it worse.",
    injuries: "Right shoulder impingement (2025), managed with physio.",
    trainingDays: "6+",
    equipment: "full-gym",
    start: "now",
    commitment: 9,
    investment: "ready",
    extra: "Match footage: https://example.com/test-mariam-highlights",
    source: "referral",
  }),
  application(178, {
    status: "declined",
    country: "CA",
    deskNotes: "Not a fit right now: under 18 and no parent in touch yet. Pointed him to Sprint foundations.",
  }, {
    track: "coaching",
    pathway: "unsure",
    name: "Liam Carter (test)",
    email: "liam.carter.test@example.com",
    phone: "+1 416 555 0107",
    location: "Toronto, Canada",
    instagram: "",
    age: 17,
    sport: "Basketball",
    level: "academy",
    position: "Point guard",
    club: "Test Prep Academy",
    trainingYears: "1-3",
    goals: ["power", "speed"],
    problem:
      "I want to dunk before next season. My vertical is around 24 inches and it hasn't moved in a year, even though I do jump workouts from YouTube.",
    injuries: "",
    trainingDays: "5",
    equipment: "basic-gym",
    start: "later",
    commitment: 5,
    investment: "discuss",
    extra: "",
    source: "youtube",
  }),
  application(231, { status: "archived", country: "DE" }, {
    track: "mentorship",
    name: "Hana Ibrahim (test)",
    email: "hana.ibrahim.test@example.com",
    phone: "+49 151 0000 0010",
    location: "Berlin, Germany",
    instagram: "",
    role: "rehab",
    organization: "Test Physio Praxis",
    experience: "5-10",
    credentials: "MSc Sports Physiotherapy. Worked with a Regionalliga football club, 2021 to 2024.",
    gaps: ["speed", "rtp"],
    problem:
      "My patients leave rehab strong in the gym, but they get re-injured in their first weeks back on the pitch. I want a better bridge between late rehab and full team training, especially sprint exposure.",
    format: "unsure",
    start: "month",
    investment: "ready",
    links: "https://example.com/hana-ibrahim",
    source: "search",
  }),
];

/* -------------------------------- waitlist --------------------------------- */

const waitlist = [
  ["sprint-foundations", "test.winger@example.com", 5],
  ["sprint-foundations", "test.fullback@example.com", 31],
  ["hamstring-resilience", "test.sprinter@example.com", 48],
  ["hamstring-resilience", "test.coach.mo@example.com", 77],
  ["off-season-footballer", "test.midfielder@example.com", 101],
  ["strength-base", "test.beginner@example.com", 150],
].map(([program, email, hoursAgo]) => ({ email, program, id: randomUUID(), createdAt: at(hoursAgo) }));

/* ------------------------------- write it out ------------------------------ */

data.applications.push(...applications);
data.waitlist.push(...waitlist);

// Same as the app's file store: write a temp file, then rename, so the dev
// server never reads a half-written file.
await fs.mkdir(dir, { recursive: true });
const tmp = `${file}.${process.pid}.seed.tmp`;
await fs.writeFile(tmp, JSON.stringify(data, null, 2));
await fs.rename(tmp, file);

console.log(
  `seed-dev: added ${applications.length} test applications and ${waitlist.length} waitlist sign-ups to .data/store.json ` +
    `(now ${data.applications.length} applications, ${data.waitlist.length} sign-ups).`,
);

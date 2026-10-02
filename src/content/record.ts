// Shihy's record. Sources: his own experience and certification list (Oct
// 2026), his Instagram bio and highlights (Sep 2026), and Youm7 (3 Nov 2023) on
// his move from Al Ahly basketball to the football first team.

export type RecordItem = { when: string; what: string; where: string; note?: string };

// Career history. Al Ahly stays here, as roles, and nowhere in the headlines.
export const roles: RecordItem[] = [
  {
    when: "Now",
    what: "Fitness director",
    where: "REVOLT, Cairo",
  },
  {
    when: "11 years",
    what: "Coaching experience",
    where: "Athletes and private clients",
  },
  {
    when: "2023 to 2026",
    what: "Physical coach, football first team",
    where: "Al Ahly SC",
  },
  {
    when: "Until 2023",
    what: "Strength and conditioning coach, basketball",
    where: "Al Ahly SC",
  },
];

// His certification list (Oct 2026). CFSC (2022) is from his Instagram and
// wasn't on the list he sent: CONFIRM he wants it shown.
export const education: RecordItem[] = [
  { when: "In progress", what: "MSc Strength, Conditioning and Coaching", where: "ALTIS" },
  { when: "Certified", what: "Fully certified instructor", where: "Gym Jones" },
  { when: "Certified", what: "Performance Specialist", where: "EXOS" },
  { when: "Certified", what: "Functional Range Conditioning Mobility Specialist", where: "FRC" },
  { when: "Certified", what: "Certified Physical Preparation Specialist", where: "CPPS" },
  { when: "Certified", what: "Special Strengths Coach", where: "Westside Barbell" },
  { when: "Certified", what: "CCP Coach", where: "OPEX" },
  { when: "Certified", what: "Level 1 Trainer", where: "CrossFit" },
  { when: "Certified", what: "Weightlifting", where: "CrossFit" },
  { when: "2022", what: "Certified Functional Strength Coach", where: "CFSC" },
];

// CONFIRM: what each of these was (course, placement, visit) so it can be named.
export const learning: RecordItem[] = [
  { when: "2026", what: "A week at the Red Bull Athlete Performance Center", where: "Los Angeles" },
  { when: "", what: "Sportsmith", where: "Los Angeles" },
];

// His own words, from his Instagram captions (Aug–Sep 2026).
export const words = {
  person:
    "Sets, reps, exercises, loading schemes and programming variables are the easy part. The real challenge is understanding the person in front of you.",
  simple: "The goal is to understand complexity well enough to make it simple.",
  teach: "Learn deeply. Think critically. Simplify. Teach.",
  system: "The program isn't the system. The system is the ability to keep making better decisions.",
  formula: "Expectations + encouragement + confidence in ability = transcendent physical ability.",
} as const;

// A line he lives by, in someone else's words.
export const armani = {
  text: "To create something exceptional, your mindset must be relentlessly focused on the smallest details.",
  by: "Giorgio Armani",
} as const;

// "Principles and core values", from his own list (Oct 2026).
export const values = [
  { k: "Bring energy, every day", v: "Positive energy, every session. The athletes feed off you." },
  { k: "Coaching is relationships", v: "Successful coaching is about building relationships with your athletes." },
  { k: "Never stop learning", v: "There is always room for improvement." },
  { k: "Keep the bar raised", v: "High standards, every day." },
  { k: "Humble. Hungry. Committed.", v: "Committed to excellence." },
] as const;

export const philosophy = [
  { k: "Start with a question", v: "What does this athlete actually need?" },
  {
    k: "The exercise is a means to an end",
    v: "Strength, power, speed, capacity: not because they're good exercises, but because they solve a problem.",
  },
  { k: "Build around the athlete", v: "The sport, the position, the calendar, the constraints, the injury history, and what they can actually tolerate." },
  { k: "Then watch the response", v: "Performance, fatigue, pain, readiness, adaptation. That feedback changes the next decision." },
  { k: "Assess. Prescribe. Observe. Reassess. Adapt.", v: "The program isn't the system. The system is the ability to keep making better decisions." },
] as const;

export const media = [
  {
    id: "-12LZz-9qOs",
    outlet: "AlNahar Ryada",
    titleAr: "خبير الأحمال محمد الشيحي يكشف السر الحقيقي لاستشفاء لاعبي منتخب مصر قبل مباراة الأرجنتين",
    title: "Load expert Mohamed El Shihy on how Egypt's players recover before facing Argentina",
    kind: "TV interview",
  },
] as const;

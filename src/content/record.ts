// Shihy's record. Sources: his Instagram bio and highlights (Sep 2026), Youm7
// (3 Nov 2023) on his move from Al Ahly basketball to the football first team.
// CONFIRM: years for Revolt Fitness, ALTIS and Gym Jones; whether to list his
// degrees (a directory listing mentions the German University in Cairo and
// Swansea University, which we could not verify).

export type RecordItem = { when: string; what: string; where: string; note?: string };

// Al Ahly: six years and "more than 18 championships" in his own words
// (farewell post, 9 Aug 2026); the move from basketball to the football first
// team is from Youm7 (3 Nov 2023).
export const roles: RecordItem[] = [
  {
    when: "Now",
    what: "Fitness director",
    where: "Revolt Fitness, Cairo",
  },
  {
    when: "2023 to 2026",
    what: "Physical coach, football first team",
    where: "Al Ahly SC",
    note: "Joined the football staff in November 2023, preparing players for matches and bringing them back from injury.",
  },
  {
    when: "Until 2023",
    what: "Strength and conditioning coach, basketball",
    where: "Al Ahly SC",
  },
  {
    when: "6 years",
    what: "More than 18 championships",
    where: "Al Ahly SC",
  },
];

export const education: RecordItem[] = [
  { when: "In progress", what: "MSc Strength and Conditioning", where: "ALTIS" },
  { when: "Certified", what: "Fully certified instructor", where: "Gym Jones" },
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
  alAhly: "Al Ahly taught me there's no ceiling to ambition, and that the small details are what make the difference.",
} as const;

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

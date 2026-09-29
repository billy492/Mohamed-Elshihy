// Answer options for the application, shared by the form, the server-side
// validation and the review desk. Labels are what applicants read; ids are what
// gets stored, so labels can be reworded later without breaking old records.

export type Option<T extends string = string> = { id: T; label: string; hint?: string };

const opts = <const T extends readonly Option[]>(o: T) => o;
export const ids = <T extends readonly Option[]>(o: T) =>
  o.map((x) => x.id) as unknown as [T[number]["id"], ...T[number]["id"][]];
export const labelOf = (o: readonly Option[], id: string | undefined) =>
  o.find((x) => x.id === id)?.label ?? id ?? "";

export const TRACKS = opts([
  { id: "coaching", label: "Coaching", hint: "For athletes and people who train" },
  { id: "mentorship", label: "Mentorship", hint: "For coaches" },
] as const);

export const PATHWAYS = opts([
  { id: "online", label: "Online: general & recreational", hint: "For general population, recreational athletes and independent trainers" },
  { id: "athlete", label: "Online: competitive / pro athlete", hint: "For athletes training independently, built around your competition calendar" },
  { id: "premium", label: "Premium (hybrid)", hint: "Online programming with in-person facility support" },
  { id: "pro", label: "Pro: performance", hint: "Invite only. For elite athletes chasing the extra 10%" },
  { id: "rehab", label: "Pro: rehab & return to play", hint: "Invite only. For athletes recovering from major injury" },
  { id: "unsure", label: "I'm not sure yet", hint: "Shihy will recommend one" },
] as const);

export const LEVELS = opts([
  { id: "recreational", label: "Recreational" },
  { id: "amateur", label: "Amateur or club" },
  { id: "academy", label: "Academy or youth" },
  { id: "semi-pro", label: "Semi-professional" },
  { id: "pro", label: "Professional" },
  { id: "national", label: "National team" },
] as const);

export const TRAINING_YEARS = opts([
  { id: "0-1", label: "Less than a year" },
  { id: "1-3", label: "1 to 3 years" },
  { id: "3-5", label: "3 to 5 years" },
  { id: "5+", label: "More than 5 years" },
] as const);

export const GOALS = opts([
  { id: "speed", label: "Get faster" },
  { id: "strength", label: "Get stronger" },
  { id: "power", label: "Jump higher, hit harder" },
  { id: "conditioning", label: "Last the whole match" },
  { id: "injury-return", label: "Come back from an injury" },
  { id: "injury-risk", label: "Stop getting injured" },
  { id: "season", label: "Prepare for a season or trial" },
  { id: "body", label: "Change my body composition" },
  { id: "pain", label: "Train without pain" },
] as const);

export const DAYS = opts([
  { id: "2", label: "2 days" },
  { id: "3", label: "3 days" },
  { id: "4", label: "4 days" },
  { id: "5", label: "5 days" },
  { id: "6+", label: "6 or more" },
] as const);

export const EQUIPMENT = opts([
  { id: "full-gym", label: "A full gym" },
  { id: "basic-gym", label: "A basic gym" },
  { id: "home", label: "Some equipment at home" },
  { id: "none", label: "Nothing yet" },
] as const);

export const START = opts([
  { id: "now", label: "As soon as possible" },
  { id: "month", label: "Within a month" },
  { id: "later", label: "In 1 to 3 months" },
] as const);

export const INVESTMENT = opts([
  { id: "ready", label: "Yes, if we're a fit" },
  { id: "discuss", label: "I'd like to talk about it first" },
] as const);

export const SOURCES = opts([
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "referral", label: "A friend or teammate" },
  { id: "club", label: "My club or coach" },
  { id: "search", label: "Google" },
  { id: "other", label: "Somewhere else" },
] as const);

// Mentorship
export const COACH_ROLES = opts([
  { id: "sc", label: "Strength and conditioning coach" },
  { id: "club-fitness", label: "Fitness coach at a club" },
  { id: "pt", label: "Personal trainer" },
  { id: "rehab", label: "Physio or rehab" },
  { id: "student", label: "Student" },
  { id: "other", label: "Something else" },
] as const);

export const EXPERIENCE = opts([
  { id: "0-2", label: "Under 2 years" },
  { id: "2-5", label: "2 to 5 years" },
  { id: "5-10", label: "5 to 10 years" },
  { id: "10+", label: "Over 10 years" },
] as const);

export const GAPS = opts([
  { id: "assessment", label: "Assessment and testing" },
  { id: "programming", label: "Program design" },
  { id: "load", label: "Load monitoring" },
  { id: "rtp", label: "Return to play" },
  { id: "speed", label: "Speed development" },
  { id: "pro-sport", label: "Working in professional sport" },
  { id: "business", label: "Building an online coaching business" },
] as const);

export const FORMATS = opts([
  { id: "1to1", label: "One to one" },
  { id: "group", label: "A small group" },
  { id: "unsure", label: "Not sure yet" },
] as const);

export const STATUSES = opts([
  { id: "new", label: "New" },
  { id: "reviewing", label: "Reviewing" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "contacted", label: "Contacted" },
  { id: "accepted", label: "Accepted" },
  { id: "declined", label: "Declined" },
  { id: "archived", label: "Archived" },
] as const);

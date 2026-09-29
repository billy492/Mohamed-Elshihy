import type { Application, WaitlistEntry } from "@/lib/apply/schema";
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
  labelOf,
} from "@/lib/apply/options";
import { programs } from "@/content/programs";
import { cairoStamp } from "./format";

// Spreadsheet export. Every cell is quoted; a cell that starts with = + - @
// (or a tab / carriage return) gets a leading apostrophe so Excel and Sheets
// show it as text instead of running it as a formula (CSV injection). The BOM
// makes Excel read the file as UTF-8, so Arabic names come through intact.

const BOM = "﻿";

export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(rows: unknown[][]): string {
  return BOM + rows.map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

const APPLICATION_COLUMNS = [
  "Ref",
  "Received (Cairo)",
  "Status",
  "Starred",
  "Track",
  "Pathway",
  "Name",
  "Email",
  "Phone",
  "Location",
  "IP country",
  "Instagram",
  "Age",
  "Sport",
  "Level",
  "Position",
  "Club",
  "Training seriously",
  "Goals",
  "Role",
  "Organization",
  "Coaching for",
  "Credentials",
  "Wants to get better at",
  "The problem",
  "Injuries",
  "Days a week",
  "Equipment",
  "Format",
  "Wants to start",
  "Commitment (1-10)",
  "Ready to invest",
  "Anything else",
  "Links",
  "Heard via",
  "Desk notes",
  "Updated (Cairo)",
  "ID",
];

function applicationRow(a: Application): unknown[] {
  const c = a.track === "coaching" ? a : null;
  const m = a.track === "mentorship" ? a : null;
  return [
    a.ref,
    cairoStamp(a.createdAt),
    labelOf(STATUSES, a.status),
    a.starred ? "Yes" : "",
    a.track === "coaching" ? "Coaching" : "Mentorship",
    c ? labelOf(PATHWAYS, c.pathway) : "",
    a.name,
    a.email,
    a.phone,
    a.location,
    a.country ?? "",
    a.instagram,
    c?.age ?? "",
    c?.sport ?? "",
    c ? labelOf(LEVELS, c.level) : "",
    c?.position ?? "",
    c?.club ?? "",
    c ? labelOf(TRAINING_YEARS, c.trainingYears) : "",
    c ? c.goals.map((g) => labelOf(GOALS, g)).join("; ") : "",
    m ? labelOf(COACH_ROLES, m.role) : "",
    m?.organization ?? "",
    m ? labelOf(EXPERIENCE, m.experience) : "",
    m?.credentials ?? "",
    m ? m.gaps.map((g) => labelOf(GAPS, g)).join("; ") : "",
    a.problem,
    c?.injuries ?? "",
    c ? labelOf(DAYS, c.trainingDays) : "",
    c ? labelOf(EQUIPMENT, c.equipment) : "",
    m ? labelOf(FORMATS, m.format) : "",
    labelOf(START, a.start),
    c?.commitment ?? "",
    labelOf(INVESTMENT, a.investment),
    c?.extra ?? "",
    m?.links ?? "",
    labelOf(SOURCES, a.source),
    a.deskNotes ?? "",
    cairoStamp(a.updatedAt),
    a.id,
  ];
}

export const applicationsCsv = (apps: Application[]) => toCsv([APPLICATION_COLUMNS, ...apps.map(applicationRow)]);

export function waitlistCsv(entries: WaitlistEntry[]): string {
  const name = (slug: string) => programs.find((p) => p.slug === slug)?.name ?? slug;
  return toCsv([
    ["Program", "Program slug", "Email", "Joined (Cairo)", "ID"],
    ...entries.map((e) => [name(e.program), e.program, e.email, cairoStamp(e.createdAt), e.id]),
  ]);
}

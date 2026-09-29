import { randomBytes, randomUUID } from "node:crypto";

// Reference numbers applicants can quote ("SH-7KQ2M"): no 0/O or 1/I to misread.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function newRef(): string {
  const bytes = randomBytes(5);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `SH-${out}`;
}

export const newId = () => randomUUID();

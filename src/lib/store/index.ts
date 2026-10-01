import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Application, WaitlistEntry } from "@/lib/apply/schema";

// Where applications live.
//
// Production: Upstash Redis over its REST API (plain fetch, no SDK). Adding the
// Upstash integration on Vercel injects KV_REST_API_URL / KV_REST_API_TOKEN;
// the UPSTASH_REDIS_REST_* names work too.
//
// Local development: a JSON file in .data/ (git-ignored), so the whole flow —
// apply, review, triage — works with zero setup. On Vercel the filesystem is
// read-only and wiped between requests, so the file store refuses to run there
// rather than silently losing applications.

export type DeskPatch = Partial<Pick<Application, "status" | "starred" | "deskNotes">>;

export interface Store {
  kind: "upstash" | "file";
  createApplication(a: Application): Promise<void>;
  listApplications(): Promise<Application[]>;
  getApplication(id: string): Promise<Application | null>;
  updateApplication(id: string, patch: DeskPatch): Promise<Application | null>;
  addWaitlist(e: WaitlistEntry): Promise<void>;
  listWaitlist(): Promise<WaitlistEntry[]>;
  /** Increment a counter that expires after `windowSec`; returns the new count. */
  hit(key: string, windowSec: number): Promise<number>;
}

export class StoreNotConfigured extends Error {
  constructor() {
    super(
      "No application store is configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_URL / KV_REST_API_TOKEN) as secrets on the host.",
    );
  }
}

const byNewest = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);

/* ---------------------------------- Upstash --------------------------------- */

// Shallow-merge a JSON patch into a stored JSON document, atomically.
// (cjson turns an empty array into {}; application arrays are never empty.)
const MERGE_SCRIPT = `
local raw = redis.call('GET', KEYS[1])
if not raw then return nil end
local doc = cjson.decode(raw)
for k, v in pairs(cjson.decode(ARGV[1])) do doc[k] = v end
local out = cjson.encode(doc)
redis.call('SET', KEYS[1], out)
return out`;

function upstash(url: string, token: string): Store {
  const P = "shihy:";
  const call = async (body: unknown, suffix = "") => {
    const res = await fetch(url.replace(/\/$/, "") + suffix, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json) throw new Error(`Upstash request failed (${res.status})`);
    return json;
  };
  const cmd = async <T>(...args: (string | number)[]): Promise<T> => {
    const json = await call(args);
    if (json.error) throw new Error(`Upstash: ${json.error}`);
    return json.result as T;
  };
  const pipeline = async (cmds: (string | number)[][]) => {
    const json = (await call(cmds, "/pipeline")) as { result?: unknown; error?: string }[];
    const failed = json.find((r) => r.error);
    if (failed) throw new Error(`Upstash: ${failed.error}`);
    return json.map((r) => r.result);
  };
  const getMany = async <T>(keys: string[]): Promise<T[]> => {
    const out: T[] = [];
    for (let i = 0; i < keys.length; i += 200) {
      const chunk = await cmd<(string | null)[]>("MGET", ...keys.slice(i, i + 200));
      for (const raw of chunk) if (raw) out.push(JSON.parse(raw) as T);
    }
    return out;
  };

  const getApplication = async (id: string) => {
    const raw = await cmd<string | null>("GET", `${P}app:${id}`);
    return raw ? (JSON.parse(raw) as Application) : null;
  };

  return {
    kind: "upstash",
    async createApplication(a) {
      await pipeline([
        ["SET", `${P}app:${a.id}`, JSON.stringify(a)],
        ["ZADD", `${P}apps`, Date.parse(a.createdAt), a.id],
      ]);
    },
    async listApplications() {
      const ids = await cmd<string[]>("ZRANGE", `${P}apps`, 0, -1, "REV");
      if (!ids.length) return [];
      return (await getMany<Application>(ids.map((id) => `${P}app:${id}`))).sort(byNewest);
    },
    getApplication,
    // Merged inside Redis in one atomic script, so two devices triaging at once
    // can't overwrite each other's changes with a stale copy.
    async updateApplication(id, patch) {
      const raw = await cmd<string | null>(
        "EVAL",
        MERGE_SCRIPT,
        1,
        `${P}app:${id}`,
        JSON.stringify({ ...patch, updatedAt: new Date().toISOString() }),
      );
      return raw ? (JSON.parse(raw) as Application) : null;
    },
    async addWaitlist(e) {
      await pipeline([
        ["SET", `${P}wait:${e.id}`, JSON.stringify(e)],
        ["ZADD", `${P}waits`, Date.parse(e.createdAt), e.id],
      ]);
    },
    async listWaitlist() {
      const ids = await cmd<string[]>("ZRANGE", `${P}waits`, 0, -1, "REV");
      if (!ids.length) return [];
      return (await getMany<WaitlistEntry>(ids.map((id) => `${P}wait:${id}`))).sort(byNewest);
    },
    async hit(key, windowSec) {
      const [count] = await pipeline([
        ["INCR", `${P}${key}`],
        ["EXPIRE", `${P}${key}`, windowSec, "NX"],
      ]);
      return Number(count);
    },
  };
}

/* ----------------------------------- File ----------------------------------- */

type FileData = { applications: Application[]; waitlist: WaitlistEntry[] };

function fileStore(): Store {
  const dir = path.join(process.cwd(), ".data");
  const file = path.join(dir, "store.json");
  const counters = new Map<string, { n: number; expires: number }>();
  let queue: Promise<unknown> = Promise.resolve();

  // Only a missing file means "no data yet". Anything else (a half-written or
  // unreadable file) must stop the write, or the next save would replace every
  // application with an empty list.
  const read = async (): Promise<FileData> => {
    let raw: string;
    try {
      raw = await fs.readFile(file, "utf8");
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return { applications: [], waitlist: [] };
      throw e;
    }
    return JSON.parse(raw) as FileData;
  };
  // Writes are serialised and atomic (temp file + rename) so two submissions
  // arriving together can't interleave and corrupt the file.
  const mutate = <T>(fn: (d: FileData) => T): Promise<T> => {
    const run = queue.then(async () => {
      const data = await read();
      const result = fn(data);
      await fs.mkdir(dir, { recursive: true });
      const tmp = `${file}.${process.pid}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(data, null, 2));
      await fs.rename(tmp, file);
      return result;
    });
    queue = run.catch(() => undefined);
    return run;
  };

  return {
    kind: "file",
    createApplication: (a) => mutate((d) => void d.applications.push(a)),
    listApplications: async () => (await read()).applications.slice().sort(byNewest),
    getApplication: async (id) => (await read()).applications.find((a) => a.id === id) ?? null,
    updateApplication: (id, patch) =>
      mutate((d) => {
        const i = d.applications.findIndex((a) => a.id === id);
        if (i < 0) return null;
        d.applications[i] = { ...d.applications[i], ...patch, updatedAt: new Date().toISOString() } as Application;
        return d.applications[i];
      }),
    addWaitlist: (e) => mutate((d) => void d.waitlist.push(e)),
    listWaitlist: async () => (await read()).waitlist.slice().sort(byNewest),
    async hit(key, windowSec) {
      const now = Date.now();
      const c = counters.get(key);
      if (!c || c.expires < now) {
        counters.set(key, { n: 1, expires: now + windowSec * 1000 });
        return 1;
      }
      c.n += 1;
      return c.n;
    },
  };
}

/* --------------------------------- Selection -------------------------------- */

let cached: Store | null = null;

export function getStore(): Store {
  if (cached) return cached;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) cached = upstash(url, token);
  // Hosted (Vercel, or Cloudflare via DEPLOY_TARGET in wrangler.jsonc): never fall
  // back to the file store, which has no persistent disk there.
  else if (process.env.VERCEL || process.env.DEPLOY_TARGET) throw new StoreNotConfigured();
  else cached = fileStore();
  return cached;
}

export function storeReady(): boolean {
  try {
    getStore();
    return true;
  } catch {
    return false;
  }
}

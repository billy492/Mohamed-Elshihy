import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getStore, storeReady } from "@/lib/store";
import { applicationsCsv, waitlistCsv } from "../_components/csv";
import { parseFilters, view } from "../_components/filters";
import { cairoToday } from "../_components/format";

// CSV download of the applications list (same filters as /admin, passed in the
// query string) or, with ?kind=waitlist, of the waitlist.

export const dynamic = "force-dynamic";

function csv(body: string, filename: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  await requireAdmin();
  if (!storeReady()) {
    return new Response("No application store is configured. Add the Upstash Redis secrets (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN) to the Worker.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const params = request.nextUrl.searchParams;
  const day = cairoToday();

  if (params.get("kind") === "waitlist") {
    return csv(waitlistCsv(await getStore().listWaitlist()), `shihy-waitlist-${day}.csv`);
  }

  const { rows } = view(await getStore().listApplications(), parseFilters(params));
  return csv(applicationsCsv(rows), `shihy-applications-${day}.csv`);
}

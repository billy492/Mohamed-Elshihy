import "server-only";
import { cache } from "react";
import { getStore } from "@/lib/store";

// One store read per request, shared by the page, its metadata and the nav's
// New count. (On Upstash a full list is a ZRANGE plus MGETs, so it adds up.)

export const loadApplications = cache(() => getStore().listApplications());
export const loadWaitlist = cache(() => getStore().listWaitlist());

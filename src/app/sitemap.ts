import type { MetadataRoute } from "next";
import { site } from "@/content/site";

const ROUTES = ["", "/coaching", "/mentorship", "/film-room", "/about", "/apply", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  return ROUTES.map((r) => ({
    url: `${base}${r}`,
    changeFrequency: r === "" ? "weekly" : "monthly",
    priority: r === "" ? 1 : r === "/apply" ? 0.9 : 0.7,
  }));
}

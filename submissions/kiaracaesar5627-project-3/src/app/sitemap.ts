import type { MetadataRoute } from "next";
import { PARTICIPANTS } from "@/lib/participants";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const staticRoutes = [
    "",
    "/people",
    "/work",
    "/partners",
    "/partners/intro",
    "/partners/readme",
    "/rsvp",
    "/profile",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const profiles = PARTICIPANTS.filter((p) => p.publicProfile).map((p) => ({
    url: `${base}/people/${p.handle}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...profiles];
}

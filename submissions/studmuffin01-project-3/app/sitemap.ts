import type { MetadataRoute } from "next";
import { allHandles } from "@/lib/people";
import { PROJECTS } from "@/lib/projects";
import { siteUrl } from "@/lib/links";

const STATIC_PATHS = [
  "/",
  "/home",
  "/developers",
  "/projects",
  "/partners",
  "/testimonials",
  "/live",
  "/rsvp",
  "/signin",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: siteUrl(path),
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : path === "/home" || path === "/signin" ? 0.3 : 0.8,
  }));

  const developerEntries: MetadataRoute.Sitemap = allHandles().map(
    (handle) => ({
      url: siteUrl(`/developers/${handle}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  const projectEntries: MetadataRoute.Sitemap = PROJECTS.map((project) => ({
    url: siteUrl(`/projects/${project.id}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...developerEntries, ...projectEntries];
}

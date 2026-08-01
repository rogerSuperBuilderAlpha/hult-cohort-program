import type { ShowcaseMedia } from "@/lib/types";

export const MEDIA_KIND_LABEL: Record<ShowcaseMedia["kind"], string> = {
  screenshot: "Screenshot",
  video: "Video",
  architecture: "Architecture",
  prototype: "Prototype",
};

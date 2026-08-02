"use server";

import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const EXT_TO_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/pjpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type UploadActionResult =
  | { ok: true; publicUrl: string; path: string }
  | { ok: false; error: string };

function resolveMime(file: File): { mime: string; ext: string } | null {
  const fromName = file.name.split(".").pop()?.toLowerCase() ?? "";
  const rawType = (file.type || "").toLowerCase().trim();

  if (rawType && MIME_TO_EXT[rawType]) {
    return {
      mime: rawType === "image/jpg" || rawType === "image/pjpeg" ? "image/jpeg" : rawType,
      ext: MIME_TO_EXT[rawType],
    };
  }

  // Some OS/browsers send an empty MIME type — trust a known extension.
  if (fromName && EXT_TO_MIME[fromName]) {
    return {
      mime: EXT_TO_MIME[fromName],
      ext: fromName === "jpeg" ? "jpg" : fromName,
    };
  }

  return null;
}

export async function uploadImageAction(
  formData: FormData,
): Promise<UploadActionResult> {
  const { user } = await requireUser();

  const bucketRaw = String(formData.get("bucket") || "");
  if (bucketRaw !== "avatars" && bucketRaw !== "project-media") {
    return { ok: false, error: "Invalid upload bucket." };
  }
  const bucket = bucketRaw;

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No image file received." };
  }

  const maxBytes = bucket === "avatars" ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return { ok: false, error: `Image must be under ${mb} MB.` };
  }

  const resolved = resolveMime(file);
  if (!resolved) {
    return {
      ok: false,
      error:
        "Use a PNG, JPEG, WebP, or GIF image. (HEIC/iPhone Live photos aren’t supported — export as JPEG first.)",
    };
  }

  const folder = String(formData.get("folder") || "").trim();
  const filenameStem =
    String(formData.get("filenameStem") || "image").trim() || "image";
  const stamp = Date.now();
  const segments = [
    user.id,
    folder || null,
    `${filenameStem}-${stamp}.${resolved.ext}`,
  ].filter((s): s is string => Boolean(s));
  const path = segments.join("/");

  const supabase = await createClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    upsert: false,
    contentType: resolved.mime,
    cacheControl: "3600",
  });

  if (error) {
    const msg = error.message || "Upload failed.";
    if (/bucket/i.test(msg) && /not found|exist/i.test(msg)) {
      return {
        ok: false,
        error:
          "Storage bucket missing. Run supabase/migrations/002_storage.sql in the Supabase SQL Editor.",
      };
    }
    if (/row-level security|rls|policy|unauthorized|permission|not allowed/i.test(msg)) {
      return {
        ok: false,
        error:
          "Upload blocked by storage permissions. Re-run 002_storage.sql (policies) in the SQL Editor, then try again.",
      };
    }
    if (/mime|type|not supported/i.test(msg)) {
      return {
        ok: false,
        error: `File type rejected by Storage (${resolved.mime}). Re-run 002_storage.sql so allowed MIME types include PNG/JPEG/WebP/GIF.`,
      };
    }
    return { ok: false, error: msg };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { ok: true, publicUrl: data.publicUrl, path };
}

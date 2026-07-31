/**
 * Client-side upload helper kept for optional reuse.
 * Avatar / project image fields now upload via uploadImageAction (server).
 */
import { createClient } from "@/lib/supabase/client";

const IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/webp",
  "image/gif",
]);

export type UploadResult =
  | { ok: true; publicUrl: string; path: string }
  | { ok: false; error: string };

function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ["png", "jpg", "jpeg", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

export async function uploadUserImage(options: {
  bucket: "avatars" | "project-media";
  userId: string;
  file: File;
  folder?: string;
  filenameStem?: string;
  maxBytes?: number;
}): Promise<UploadResult> {
  const {
    bucket,
    userId,
    file,
    folder,
    filenameStem = "image",
    maxBytes = bucket === "avatars" ? 5 * 1024 * 1024 : 10 * 1024 * 1024,
  } = options;

  const type = (file.type || "").toLowerCase();
  const extName = file.name.split(".").pop()?.toLowerCase() ?? "";
  const typeOk =
    IMAGE_TYPES.has(type) ||
    ["png", "jpg", "jpeg", "webp", "gif"].includes(extName);

  if (!typeOk) {
    return { ok: false, error: "Use a PNG, JPEG, WebP, or GIF image." };
  }
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return { ok: false, error: `Image must be under ${mb} MB.` };
  }

  const ext = extensionFor(file);
  const stamp = Date.now();
  const segments = [userId, folder, `${filenameStem}-${stamp}.${ext}`].filter(
    Boolean,
  ) as string[];
  const path = segments.join("/");

  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    contentType: type.startsWith("image/") ? type : `image/${ext === "jpg" ? "jpeg" : ext}`,
    cacheControl: "3600",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { ok: true, publicUrl: data.publicUrl, path };
}

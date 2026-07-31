import type { Attachment, AttachmentKind } from "@/lib/types";
import { newId } from "@/lib/id";

/** Keep modest — attachments are stored as data URLs in localStorage. */
export const MAX_ATTACHMENT_BYTES = 1.5 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_MESSAGE = 5;

export const ATTACHMENT_ACCEPT =
  "image/*,.pdf,.doc,.docx,.txt,.md,.csv,.xls,.xlsx,.ppt,.pptx,.zip,.json,.rtf,audio/*,video/*,.drawio";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isSvgFile(mimeType: string, fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return mimeType === "image/svg+xml" || lower.endsWith(".svg");
}

export function classifyAttachment(
  mimeType: string,
  fileName: string
): AttachmentKind {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".drawio")) {
    return "drawing";
  }
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("video/")) return "video";
  if (
    mimeType.includes("document") ||
    mimeType.includes("sheet") ||
    mimeType.includes("presentation") ||
    mimeType.includes("msword") ||
    mimeType.includes("text/") ||
    /\.(docx?|xlsx?|pptx?|txt|md|csv|rtf|json)$/i.test(lower)
  ) {
    return "document";
  }
  return "file";
}

export function kindLabel(kind: AttachmentKind): string {
  switch (kind) {
    case "image":
      return "Picture";
    case "drawing":
      return "Drawing";
    case "document":
      return "Document";
    case "pdf":
      return "PDF";
    case "audio":
      return "Audio";
    case "video":
      return "Video";
    default:
      return "File";
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read file"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

export type AttachmentReadResult =
  | { ok: true; attachment: Attachment }
  | { ok: false; error: string };

export async function fileToAttachment(
  file: File
): Promise<AttachmentReadResult> {
  if (isSvgFile(file.type, file.name)) {
    return {
      ok: false,
      error: `${file.name} — SVG uploads are blocked for security. Use PNG/JPG or a .drawio file.`,
    };
  }

  if (file.size > MAX_ATTACHMENT_BYTES) {
    return {
      ok: false,
      error: `${file.name} is too large (max ${formatFileSize(MAX_ATTACHMENT_BYTES)}).`,
    };
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    const mimeType = file.type || "application/octet-stream";
    return {
      ok: true,
      attachment: {
        id: newId("att"),
        name: file.name,
        mimeType,
        size: file.size,
        kind: classifyAttachment(mimeType, file.name),
        dataUrl,
      },
    };
  } catch {
    return { ok: false, error: `Could not read ${file.name}.` };
  }
}

export async function filesToAttachments(
  files: FileList | File[],
  existingCount: number
): Promise<{ attachments: Attachment[]; errors: string[] }> {
  const list = Array.from(files);
  const attachments: Attachment[] = [];
  const errors: string[] = [];
  const room = MAX_ATTACHMENTS_PER_MESSAGE - existingCount;

  if (room <= 0) {
    return {
      attachments: [],
      errors: [
        `You can attach up to ${MAX_ATTACHMENTS_PER_MESSAGE} files per message.`,
      ],
    };
  }

  if (list.length > room) {
    errors.push(
      `Only ${room} more file${room === 1 ? "" : "s"} can be added to this message.`
    );
  }

  for (const file of list.slice(0, room)) {
    const result = await fileToAttachment(file);
    if (result.ok) attachments.push(result.attachment);
    else errors.push(result.error);
  }

  return { attachments, errors };
}

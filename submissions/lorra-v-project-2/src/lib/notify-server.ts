import "server-only";

import { createServiceClient } from "@/lib/supabase/admin";
import type { AppNotificationType } from "@/lib/notifications";

/** Inserts via service role (RLS blocks authenticated inserts). */
export async function createNotifications(
  rows: {
    userId: string;
    type: AppNotificationType;
    actorId: string | null;
    entityRef: string;
  }[],
) {
  const unique = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    if (!row.userId) continue;
    unique.set(`${row.userId}:${row.type}:${row.entityRef}`, row);
  }
  const payload = Array.from(unique.values()).map((r) => ({
    user_id: r.userId,
    type: r.type,
    actor_id: r.actorId,
    entity_ref: r.entityRef,
    is_read: false,
  }));
  if (!payload.length) return;

  try {
    const admin = createServiceClient();
    const { error } = await admin.from("notifications").insert(payload);
    if (error) console.warn("createNotifications failed", error.message);
  } catch (e) {
    console.warn(
      "createNotifications failed",
      e instanceof Error ? e.message : e,
    );
  }
}

import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getDefaultCohortId } from "@/lib/cohort";
import type { AnalyticsEventType } from "@/lib/types/analytics";

/**
 * Fire-and-forget analytics write via service role.
 * Never throws to callers — safe to void without awaiting on page render.
 */
export async function logAnalyticsEvent(input: {
  eventType: AnalyticsEventType;
  projectId?: string | null;
  campaignId?: string | null;
  source?: string | null;
  referrer?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const cohortId = await getDefaultCohortId();
    const admin = createAdminClient();
    const { error } = await admin.from("analytics_events").insert({
      cohort_id: cohortId,
      project_id: input.projectId ?? null,
      campaign_id: input.campaignId ?? null,
      event_type: input.eventType,
      source: input.source ?? "web",
      referrer: input.referrer ?? null,
      metadata: input.metadata ?? {},
    });
    if (error) {
      console.error("[analytics]", error.message);
    }
  } catch (err) {
    console.error("[analytics]", err);
  }
}

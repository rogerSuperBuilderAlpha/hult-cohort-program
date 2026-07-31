import "server-only";

import { COHORT_SLUG } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getDefaultCohortId(): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cohorts")
    .select("id")
    .eq("slug", COHORT_SLUG)
    .maybeSingle();

  if (error) throw error;
  if (data?.id) return data.id as string;

  // Fallback via service role if RLS somehow blocks (should be public-readable).
  const admin = createAdminClient();
  const { data: seeded, error: seedError } = await admin
    .from("cohorts")
    .select("id")
    .eq("slug", COHORT_SLUG)
    .single();

  if (seedError || !seeded) {
    throw new Error(
      `Cohort "${COHORT_SLUG}" not found. Re-run 001_schema.sql seed insert.`,
    );
  }
  return seeded.id as string;
}

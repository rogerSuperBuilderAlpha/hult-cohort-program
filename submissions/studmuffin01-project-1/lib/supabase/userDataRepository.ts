import type { SupabaseClient } from "@supabase/supabase-js";

export const USER_DATA_KEYS = {
  cohortSubmissions: "cohort_submissions",
  initiativeTasks: "initiative_tasks",
} as const;

export type UserDataKey = (typeof USER_DATA_KEYS)[keyof typeof USER_DATA_KEYS];

function normalizeJsonPayload(raw: unknown): unknown {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return raw;
    }
  }

  return raw;
}

export async function fetchUserAppData<T>(
  supabase: SupabaseClient,
  userId: string,
  dataKey: UserDataKey,
  parse: (raw: unknown) => T
): Promise<T | null> {
  const record = await fetchUserAppDataRecord(supabase, userId, dataKey, parse);
  return record?.parsed ?? null;
}

/** Returns parsed payload plus whether a DB row exists (even if payload is empty). */
export async function fetchUserAppDataRecord<T>(
  supabase: SupabaseClient,
  userId: string,
  dataKey: UserDataKey,
  parse: (raw: unknown) => T
): Promise<{ parsed: T; raw: unknown; hasRow: true } | null> {
  const { data, error } = await supabase
    .from("user_app_data")
    .select("payload")
    .eq("user_id", userId)
    .eq("data_key", dataKey)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const raw = normalizeJsonPayload(data.payload);

  return { parsed: parse(raw), raw, hasRow: true };
}

export async function upsertUserAppData<T>(
  supabase: SupabaseClient,
  userId: string,
  dataKey: UserDataKey,
  payload: T
): Promise<void> {
  const { error } = await supabase.from("user_app_data").upsert(
    {
      user_id: userId,
      data_key: dataKey,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,data_key" }
  );

  if (error) {
    throw error;
  }
}

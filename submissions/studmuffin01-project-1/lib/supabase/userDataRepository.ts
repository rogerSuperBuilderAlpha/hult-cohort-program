import type { SupabaseClient } from "@supabase/supabase-js";

export const USER_DATA_KEYS = {
  cohortSubmissions: "cohort_submissions",
  initiativeTasks: "initiative_tasks",
} as const;

export type UserDataKey = (typeof USER_DATA_KEYS)[keyof typeof USER_DATA_KEYS];

export async function fetchUserAppData<T>(
  supabase: SupabaseClient,
  userId: string,
  dataKey: UserDataKey,
  parse: (raw: unknown) => T
): Promise<T | null> {
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

  return parse(data.payload);
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

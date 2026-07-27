function trimEnv(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function getSupabaseUrl(): string {
  return trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey(): string {
  return trimEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export { getConfiguredSiteUrl as getSiteUrl } from "@/lib/supabase/siteUrl";

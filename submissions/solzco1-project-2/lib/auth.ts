import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getSessionProfile() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.user.id)
    .maybeSingle();

  return profile ? { user: auth.user, profile } : { user: auth.user, profile: null };
}

export async function requireProfile() {
  const session = await getSessionProfile();
  if (!session?.user) redirect("/login");
  return session;
}

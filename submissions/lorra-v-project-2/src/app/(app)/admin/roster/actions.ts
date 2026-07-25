"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

function parseRosterCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const rows: { display_name: string; email: string }[] = [];
  const start = /name\s*,\s*email/i.test(lines[0]) ? 1 : 0;

  for (let i = start; i < lines.length; i += 1) {
    const parts = lines[i].split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
    if (parts.length < 2) continue;
    const display_name = parts[0];
    const email = parts[1].toLowerCase();
    if (!display_name || !email.includes("@")) continue;
    rows.push({ display_name, email });
  }
  return rows;
}

export async function uploadRosterCsv(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/cohort?error=forbidden");
  }

  const file = formData.get("roster");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/cohort?error=missing_file");
  }

  const text = await file.text();
  const rows = parseRosterCsv(text);
  if (rows.length === 0) {
    redirect("/cohort?error=empty_csv");
  }

  const admin = createServiceClient();
  const { error } = await admin.from("roster_allowlist").upsert(rows, {
    onConflict: "email",
  });
  if (error) {
    redirect(`/cohort?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/cohort");
  redirect(`/cohort?ok=${rows.length}`);
}

import { createClient } from "@/lib/supabase/client";

const SESSION_RETRY_MS = [50, 100, 200, 400, 800];

/** Wait until the browser Supabase client has a session (needed before RLS reads). */
export async function waitForSupabaseSession(): Promise<boolean> {
  const supabase = createClient();

  for (const delayMs of SESSION_RETRY_MS) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return Boolean(session);
}

export async function getSupabaseClientWhenReady() {
  await waitForSupabaseSession();
  return createClient();
}

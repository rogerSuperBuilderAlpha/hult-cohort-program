import { createClient } from "@/lib/supabase/server";
import { SiteHeaderClient } from "@/components/layout/SiteHeaderClient";

async function getOptionalUser() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function SiteHeader() {
  const user = await getOptionalUser();
  return <SiteHeaderClient signedIn={Boolean(user)} />;
}

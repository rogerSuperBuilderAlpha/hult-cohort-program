import { redirect } from "next/navigation";

/** Legacy Supabase scaffold route — main dashboard lives at `/`. */
export default function LegacyDashboardRedirect() {
  redirect("/");
}

import { redirect } from "next/navigation";

/** Legacy admin roster URL → Cohort member directory. */
export default function LegacyRosterRedirect() {
  redirect("/cohort");
}

import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSessionProfile();
  if (session?.user) redirect("/channels/general");
  redirect("/login");
}

import { redirect } from "next/navigation";

/** Legacy path — public showcase now lives at `/`. */
export default function HomeAliasPage() {
  redirect("/");
}

import { redirect } from "next/navigation";

/** Alias — root `/` is the sign-in entry. */
export default function SignInAliasPage() {
  redirect("/");
}

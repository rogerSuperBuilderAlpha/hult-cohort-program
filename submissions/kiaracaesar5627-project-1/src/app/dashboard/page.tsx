import { redirect } from "next/navigation";

// Legacy entrypoint — FlexiFlow is organized around workspaces.
export default function DashboardRedirect() {
  redirect("/workspaces");
}

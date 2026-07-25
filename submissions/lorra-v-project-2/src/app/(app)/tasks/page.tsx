import { listVisibleTicketLinks } from "@/app/(app)/tasks/actions";
import { TasksView } from "@/components/TasksView";

export default async function TasksPage() {
  let links: Awaited<ReturnType<typeof listVisibleTicketLinks>> = [];
  try {
    links = await listVisibleTicketLinks();
  } catch {
    links = [];
  }
  return <TasksView initial={links} />;
}

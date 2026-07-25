import { listVisibleAttachments } from "@/app/(app)/files/actions";
import { FilesView } from "@/components/FilesView";

export default async function FilesPage() {
  let files: Awaited<ReturnType<typeof listVisibleAttachments>> = [];
  try {
    files = await listVisibleAttachments();
  } catch {
    files = [];
  }
  const channelMap = new Map<string, string>();
  for (const f of files) {
    if (f.channel_id && f.channel_name) channelMap.set(f.channel_id, f.channel_name);
  }
  const channels = Array.from(channelMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return <FilesView initial={files} channels={channels} />;
}

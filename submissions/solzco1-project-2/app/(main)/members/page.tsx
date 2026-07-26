import { startDmFromForm } from "@/app/actions";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function MembersPage() {
  const { user } = await requireProfile();
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("profiles")
    .select("id, display_name, email, role")
    .order("display_name");

  return (
    <div className="p-4">
      <h1 className="font-serif text-2xl">Cohort members</h1>
      <p className="mt-1 text-sm text-ink/70">Start a 1:1 direct message.</p>
      <ul className="mt-6 divide-y divide-moss/15 rounded border border-moss/20">
        {(members ?? [])
          .filter((m) => m.id !== user.id)
          .map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-medium">{m.display_name}</p>
                <p className="text-xs text-ink/70">{m.email}</p>
              </div>
              <form action={startDmFromForm}>
                <input type="hidden" name="userId" value={m.id} />
                <button
                  type="submit"
                  className="min-h-[44px] rounded border border-moss px-3 py-2 text-sm"
                >
                  Message
                </button>
              </form>
            </li>
          ))}
      </ul>
    </div>
  );
}

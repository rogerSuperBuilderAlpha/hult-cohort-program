import { createClient } from "@supabase/supabase-js";
import { hashPassword } from "../src/lib/password";

const DEMO_SLUG = "flexiflow-demo";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env for seed");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const sb = admin();

async function upsertUser(input: {
  email: string;
  username: string;
  name: string;
  password: string;
}) {
  const password_hash = await hashPassword(input.password);
  const { data: existing } = await sb
    .from("users")
    .select("*")
    .eq("email", input.email)
    .maybeSingle();
  if (existing) {
    const { data } = await sb
      .from("users")
      .update({ username: input.username, name: input.name, password_hash })
      .eq("id", existing.id)
      .select("*")
      .single();
    return data!;
  }
  const { data, error } = await sb
    .from("users")
    .insert({
      email: input.email,
      username: input.username,
      name: input.name,
      password_hash,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data!;
}

async function main() {
  const owner = await upsertUser({
    email: "demo@flexiflow.test",
    username: "demo",
    name: "Demo Owner",
    password: "DemoPass1!",
  });
  const member = await upsertUser({
    email: "sam@flexiflow.test",
    username: "sam",
    name: "Sam Member",
    password: "SamPass1!",
  });
  const guest = await upsertUser({
    email: "guest@flexiflow.test",
    username: "guest",
    name: "Gina Guest",
    password: "GuestPass1!",
  });

  // Reset the demo workspace (cascades to projects/tasks/statuses/etc.).
  await sb.from("workspaces").delete().eq("slug", DEMO_SLUG);

  const { data: ws, error: wsErr } = await sb
    .from("workspaces")
    .insert({
      name: "Product Studio",
      slug: DEMO_SLUG,
      owner_id: owner.id,
      accent_color: "#0d9488",
    })
    .select("*")
    .single();
  if (wsErr) throw wsErr;

  await sb.from("workspace_members").insert([
    { workspace_id: ws.id, user_id: owner.id, role: "OWNER" },
    { workspace_id: ws.id, user_id: member.id, role: "MEMBER" },
    { workspace_id: ws.id, user_id: guest.id, role: "GUEST" },
  ]);

  const statusDefs = [
    { name: "Backlog", color: "#64748b", position: 0, is_done: false },
    { name: "In progress", color: "#2563eb", position: 1, is_done: false },
    { name: "In review", color: "#d97706", position: 2, is_done: false },
    { name: "Done", color: "#059669", position: 3, is_done: true },
  ];
  const { data: statuses } = await sb
    .from("statuses")
    .insert(statusDefs.map((s) => ({ ...s, workspace_id: ws.id })))
    .select("*");
  const S = (name: string) => statuses!.find((s) => s.name === name)!.id;

  const { data: labels } = await sb
    .from("labels")
    .insert([
      { workspace_id: ws.id, name: "Bug", color: "#e11d48" },
      { workspace_id: ws.id, name: "Feature", color: "#2563eb" },
      { workspace_id: ws.id, name: "Urgent", color: "#d97706" },
    ])
    .select("*");

  const { data: field } = await sb
    .from("custom_fields")
    .insert({
      workspace_id: ws.id,
      name: "Priority",
      type: "select",
      options: ["Low", "Medium", "High"],
      position: 0,
    })
    .select("*")
    .single();

  const { data: project } = await sb
    .from("projects")
    .insert({
      name: "Website Revamp",
      description: "Redesign the marketing site and ship a new pricing page.",
      owner_id: owner.id,
      workspace_id: ws.id,
      color: "#0d9488",
    })
    .select("*")
    .single();

  const soon = new Date();
  soon.setDate(soon.getDate() + 2);
  const later = new Date();
  later.setDate(later.getDate() + 6);

  const { data: tasks } = await sb
    .from("tasks")
    .insert([
      {
        title: "Audit current site copy",
        description: "Catalogue every page and flag stale content.",
        status_id: S("Done"),
        project_id: project!.id,
        assignee_id: member.id,
        created_by_id: owner.id,
        position: 0,
      },
      {
        title: "Design new hero section",
        description: "Two directions for the homepage hero.",
        status_id: S("In progress"),
        project_id: project!.id,
        assignee_id: owner.id,
        created_by_id: owner.id,
        due_date: soon.toISOString(),
        position: 0,
      },
      {
        title: "Build pricing page",
        description: "Responsive pricing with monthly/annual toggle.",
        status_id: S("Backlog"),
        project_id: project!.id,
        assignee_id: member.id,
        created_by_id: owner.id,
        due_date: later.toISOString(),
        position: 0,
      },
      {
        title: "Fix nav overlap on mobile",
        description: "Header wraps awkwardly under 360px.",
        status_id: S("In review"),
        project_id: project!.id,
        assignee_id: owner.id,
        created_by_id: member.id,
        position: 0,
      },
    ])
    .select("*");

  // Labels + custom field values on a couple of tasks.
  const bug = labels!.find((l) => l.name === "Bug")!.id;
  const feature = labels!.find((l) => l.name === "Feature")!.id;
  const navTask = tasks!.find((t) => t.title.startsWith("Fix nav"))!.id;
  const heroTask = tasks!.find((t) => t.title.startsWith("Design"))!.id;
  await sb.from("task_labels").insert([
    { task_id: navTask, label_id: bug },
    { task_id: heroTask, label_id: feature },
  ]);
  await sb.from("task_field_values").insert([
    { task_id: heroTask, field_id: field!.id, value: "High" },
    { task_id: navTask, field_id: field!.id, value: "Medium" },
  ]);

  await sb.from("automation_rules").insert({
    workspace_id: ws.id,
    name: "Ping owner when done",
    trigger_status_id: S("Done"),
    action: "notify_owner",
  });

  await sb.from("activity").insert({
    workspace_id: ws.id,
    project_id: project!.id,
    user_id: owner.id,
    verb: "created project",
    detail: "Website Revamp",
  });

  console.log("Seeded workspace 'Product Studio' (slug: %s)", DEMO_SLUG);
  console.log("Owner  login: demo@flexiflow.test / DemoPass1!");
  console.log("Member login: sam@flexiflow.test / SamPass1!");
  console.log("Guest  login: guest@flexiflow.test / GuestPass1!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

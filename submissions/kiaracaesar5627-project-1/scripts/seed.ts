import { createClient } from "@supabase/supabase-js";
import { hashPassword } from "../src/lib/password";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env for seed");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function upsertUser(input: {
  email: string;
  username: string;
  name: string;
  password: string;
}) {
  const sb = admin();
  const password_hash = await hashPassword(input.password);
  const { data: existing } = await sb
    .from("users")
    .select("*")
    .eq("email", input.email)
    .maybeSingle();

  if (existing) {
    const { data, error } = await sb
      .from("users")
      .update({
        username: input.username,
        name: input.name,
        password_hash,
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
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
  return data;
}

async function main() {
  const staff = await upsertUser({
    email: "staff-review@hult-cohort.test",
    username: "staff",
    name: "Staff Reviewer",
    password: "StaffReview1!",
  });

  const demo = await upsertUser({
    email: "demo@hult-cohort.test",
    username: "demo",
    name: "Demo Builder",
    password: "DemoPass1!",
  });

  const peer = await upsertUser({
    email: "peer@hult-cohort.test",
    username: "peer",
    name: "Peer Reviewer",
    password: "PeerPass1!",
  });

  const sb = admin();
  const { data: existingProject } = await sb
    .from("projects")
    .select("*")
    .eq("name", "Summer Pilot 2026")
    .eq("owner_id", demo.id)
    .maybeSingle();

  let projectId = existingProject?.id as string | undefined;
  if (!projectId) {
    const { data, error } = await sb
      .from("projects")
      .insert({
        name: "Summer Pilot 2026",
        description: "Track cohort deliverables, deadlines, and ship momentum.",
        owner_id: demo.id,
      })
      .select("*")
      .single();
    if (error) throw error;
    projectId = data.id;
  } else {
    await sb
      .from("projects")
      .update({
        description: "Track cohort deliverables, deadlines, and ship momentum.",
        archived: false,
      })
      .eq("id", projectId);
  }

  await sb.from("tasks").delete().eq("project_id", projectId);

  const soon = new Date();
  soon.setDate(soon.getDate() + 1);
  const later = new Date();
  later.setDate(later.getDate() + 5);

  const { error: taskError } = await sb.from("tasks").insert([
    {
      title: "Open Project 1 submission PR",
      description: "Push branch and open PR with production URL in the body.",
      status: "IN_PROGRESS",
      project_id: projectId,
      assignee_id: demo.id,
      created_by_id: demo.id,
      due_date: soon.toISOString(),
    },
    {
      title: "Peer review pass",
      description: "File written GitHub reviews, then cast private votes.",
      status: "TODO",
      project_id: projectId,
      assignee_id: peer.id,
      created_by_id: staff.id,
      due_date: later.toISOString(),
    },
    {
      title: "Staff smoke-test deploy",
      description: "Sign up, create project, assign tasks across accounts.",
      status: "TODO",
      project_id: projectId,
      assignee_id: staff.id,
      created_by_id: demo.id,
      due_date: soon.toISOString(),
    },
    {
      title: "Ship motivation dashboard polish",
      description: "Make next actions and progress impossible to miss.",
      status: "DONE",
      project_id: projectId,
      assignee_id: demo.id,
      created_by_id: demo.id,
    },
  ]);
  if (taskError) throw taskError;

  console.log("Seeded users: staff / demo / peer");
  console.log("Demo login: demo@hult-cohort.test / DemoPass1!");
  console.log("Staff login: staff-review@hult-cohort.test / StaffReview1!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

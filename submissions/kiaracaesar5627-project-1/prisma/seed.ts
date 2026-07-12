import { hashPassword } from "../src/lib/password";
import { PrismaClient, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function upsertUser(input: {
  email: string;
  username: string;
  name: string;
  password: string;
}) {
  const passwordHash = await hashPassword(input.password);
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      username: input.username,
      name: input.name,
      passwordHash,
    },
    create: {
      email: input.email,
      username: input.username,
      name: input.name,
      passwordHash,
    },
  });
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

  const project = await prisma.project.upsert({
    where: { id: "seed-summer-pilot" },
    update: {
      name: "Summer Pilot 2026",
      description: "Track cohort deliverables, deadlines, and ship momentum.",
      archived: false,
      ownerId: demo.id,
    },
    create: {
      id: "seed-summer-pilot",
      name: "Summer Pilot 2026",
      description: "Track cohort deliverables, deadlines, and ship momentum.",
      ownerId: demo.id,
    },
  });

  await prisma.task.deleteMany({ where: { projectId: project.id } });

  const soon = new Date();
  soon.setDate(soon.getDate() + 1);
  const later = new Date();
  later.setDate(later.getDate() + 5);

  await prisma.task.createMany({
    data: [
      {
        title: "Open Project 1 submission PR",
        description: "Push branch and open PR with production URL in the body.",
        status: TaskStatus.IN_PROGRESS,
        projectId: project.id,
        assigneeId: demo.id,
        createdById: demo.id,
        dueDate: soon,
      },
      {
        title: "Peer review pass",
        description: "File written GitHub reviews, then cast private votes.",
        status: TaskStatus.TODO,
        projectId: project.id,
        assigneeId: peer.id,
        createdById: staff.id,
        dueDate: later,
      },
      {
        title: "Staff smoke-test deploy",
        description: "Sign up, create project, assign tasks across accounts.",
        status: TaskStatus.TODO,
        projectId: project.id,
        assigneeId: staff.id,
        createdById: demo.id,
        dueDate: soon,
      },
      {
        title: "Ship motivation dashboard polish",
        description: "Make next actions and progress impossible to miss.",
        status: TaskStatus.DONE,
        projectId: project.id,
        assigneeId: demo.id,
        createdById: demo.id,
      },
    ],
  });

  console.log("Seeded users: staff / demo / peer");
  console.log("Demo login: demo@hult-cohort.test / DemoPass1!");
  console.log("Staff login: staff-review@hult-cohort.test / StaffReview1!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

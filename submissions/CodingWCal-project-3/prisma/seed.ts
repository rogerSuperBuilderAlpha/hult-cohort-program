import { prisma } from "../src/lib/prisma/db";

async function main() {
  const member1 = await prisma.member.upsert({
    where: { email: "calvin@cursor.sh" },
    update: {},
    create: {
      name: "Calvin Van",
      email: "calvin@cursor.sh",
      slug: "calvin-van",
      bio: "Builder and full-stack engineer building at the intersection of design and systems.",
      avatar: "https://avatars.githubusercontent.com/u/200448977?v=4",
      githubUrl: "https://github.com/codingwcal",
      twitterUrl: "https://x.com/codingwcal",
      status: "active",
    },
  });

  const member2 = await prisma.member.upsert({
    where: { email: "alex@example.com" },
    update: {},
    create: {
      name: "Alex H.",
      email: "alex@example.com",
      slug: "alex-h",
      bio: "ML engineer building production AI systems. Former quant researcher.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      githubUrl: "https://github.com/alexh",
      status: "active",
    },
  });

  const member3 = await prisma.member.upsert({
    where: { email: "sarah@cursor.sh" },
    update: {},
    create: {
      name: "Sarah M.",
      email: "sarah@cursor.sh",
      slug: "sarah-mendez",
      bio: "Full-stack developer focused on real-time collaboration and developer tooling.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
      githubUrl: "https://github.com/sarahm",
      status: "active",
    },
  });

  const member4 = await prisma.member.upsert({
    where: { email: "jordan@cursor.sh" },
    update: {},
    create: {
      name: "Jordan W.",
      email: "jordan@cursor.sh",
      slug: "jordan-w",
      bio: "Product engineer shipping developer tools and design systems. Previously at early-stage startups.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      githubUrl: "https://github.com/jordanw",
      status: "active",
    },
  });

  const member5 = await prisma.member.upsert({
    where: { email: "maya@cursor.sh" },
    update: {},
    create: {
      name: "Maya R.",
      email: "maya@cursor.sh",
      slug: "maya-r",
      bio: "Building AI-native interfaces. Background in computational linguistics and UX research.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      githubUrl: "https://github.com/mayar",
      status: "alumni",
    },
  });

  const project1 = await prisma.project.upsert({
    where: { slug: "odyssey-travel-planner" },
    update: {},
    create: {
      title: "Odyssey Travel Planner",
      slug: "odyssey-travel-planner",
      description:
        "A collaborative trip planning app with day-by-day itinerary timelines, interactive Leaflet maps with pinned destinations, budget tracking by category, and real-time collaboration via Supabase subscriptions. Built over one week using Next.js 14 App Router with TypeScript strict mode.",
      techStack: JSON.stringify(["Next.js 14", "Prisma", "Supabase", "Leaflet", "Clerk"]),
      coverImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop",
      githubUrl: "https://github.com/codingwcal/odyssey",
      liveUrl: "https://odyssey.vercel.app",
      featured: true,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { slug: "automated-hedge-fund" },
    update: {},
    create: {
      title: "Automated Hedge Fund",
      slug: "automated-hedge-fund",
      description:
        "Real-time market analysis platform with ML-based signal detection, automated portfolio rebalancing, and historical backtesting. Python backend with FastAPI processes market data streams while Redis handles real-time caching. Deployed via Docker with a React dashboard for monitoring.",
      techStack: JSON.stringify(["Python", "FastAPI", "React", "Redis", "Docker"]),
      coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop",
      githubUrl: "https://github.com/alexh/hedge-fund",
      featured: true,
    },
  });

  const project3 = await prisma.project.upsert({
    where: { slug: "vibe-marketing-platform" },
    update: {},
    create: {
      title: "Vibe Marketing Platform",
      slug: "vibe-marketing-platform",
      description:
        "Curated editorial showcase for the Cursor Boston × Hult cohort. Features a warm editorial design system, dark mode, project gallery with gradient fallbacks, member profiles with active/alumni status, and an admin CMS with GitHub auth. Built with Next.js 16 App Router, Tailwind CSS v4, Prisma + Turso.",
      techStack: JSON.stringify(["Next.js 16", "Tailwind CSS v4", "Prisma", "Turso", "NextAuth.js"]),
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop",
      githubUrl: "https://github.com/codingwcal/cursor-boston-showcase",
      liveUrl: "https://cursor-boston-showcase.vercel.app",
      featured: true,
    },
  });

  const project4 = await prisma.project.upsert({
    where: { slug: "pulse-health-dashboard" },
    update: {},
    create: {
      title: "Pulse Health Dashboard",
      slug: "pulse-health-dashboard",
      description:
        "Patient health analytics dashboard for small clinics. Aggregates EHR data into visual trends, flags anomalies via statistical models, and generates weekly summaries. Built with a Go backend pipeline and a lightweight Svelte frontend for fast interactivity.",
      techStack: JSON.stringify(["Go", "Svelte", "PostgreSQL", "Chart.js", "Docker"]),
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop",
      githubUrl: "https://github.com/jordanw/pulse",
      featured: false,
    },
  });

  const project5 = await prisma.project.upsert({
    where: { slug: "context-chat" },
    update: {},
    create: {
      title: "Context Chat",
      slug: "context-chat",
      description:
        "An AI chat interface that maintains long-running context across sessions using vector embeddings. Supports document upload, inline citations, and configurable personas. Built as a monorepo with a T3 stack backend and a React Native mobile companion.",
      techStack: JSON.stringify(["Next.js 15", "tRPC", "Prisma", "Pinecone", "React Native"]),
      coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop",
      githubUrl: "https://github.com/mayar/context-chat",
      liveUrl: "https://contextchat.vercel.app",
      featured: false,
    },
  });

  const project6 = await prisma.project.upsert({
    where: { slug: "stripe-connector" },
    update: {},
    create: {
      title: "Stripe Connector",
      slug: "stripe-connector",
      description:
        "Open-source middleware that bridges Stripe webhooks to internal systems via a declarative YAML config. Handles idempotency, retries with exponential backoff, and provides a dashboard for inspecting failed events. Used by 3 SaaS companies in beta.",
      techStack: JSON.stringify(["TypeScript", "Express", "Stripe API", "Redis", "Docker"]),
      coverImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop",
      githubUrl: "https://github.com/sarahm/stripe-connector",
      featured: false,
    },
  });

  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project1.id, memberId: member1.id } },
    update: {},
    create: { projectId: project1.id, memberId: member1.id },
  });

  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project2.id, memberId: member2.id } },
    update: {},
    create: { projectId: project2.id, memberId: member2.id },
  });

  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project3.id, memberId: member1.id } },
    update: {},
    create: { projectId: project3.id, memberId: member1.id },
  });

  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project4.id, memberId: member4.id } },
    update: {},
    create: { projectId: project4.id, memberId: member4.id },
  });

  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project5.id, memberId: member5.id } },
    update: {},
    create: { projectId: project5.id, memberId: member5.id },
  });

  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project6.id, memberId: member3.id } },
    update: {},
    create: { projectId: project6.id, memberId: member3.id },
  });

  console.log("Seeded: 5 members, 6 projects, 6 associations");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

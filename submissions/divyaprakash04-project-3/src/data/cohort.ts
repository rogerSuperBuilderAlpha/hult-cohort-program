export type Participant = {
    handle: string;
    name: string;
    tagline: string;
    techStack: string[];
    focus: string;
    githubUrl: string;
    linkedinUrl?: string;
    latentUrl?: string;
    projects: string[];
};

export type Project = {
    id: string;
    title: string;
    ownerHandle: string;
    week: number;
    deployUrl: string;
    sourceUrl: string;
    techStack: string[];
    summary: string;
    whyItMatters: string;
    changelog: { date: string; description: string }[];
};

export const cohortStats = {
    participants: 18,
    activeProjects: 9,
    deploymentsLive: 7,
    partnerInterest: 'High signal',
};

export const participants: Participant[] = [
    {
        handle: 'DivyaPrakash04',
        name: 'Divya Prakash',
        tagline:
            'Shipping full-stack AI orchestration engines that turn raw compute into elite, partner-ready product surfaces.',
        techStack: ['Next.js', 'TypeScript', 'OpenAI', 'Postgres'],
        focus: 'AI product surfaces',
        githubUrl: 'https://github.com/DivyaPrakash04',
        linkedinUrl: 'https://linkedin.com/in/divyaprakash04',
        latentUrl: 'https://latent.space/DivyaPrakash04',
        projects: ['vibehub', 'signal-studio'],
    },
    {
        handle: 'maya-lee',
        name: 'Maya Lee',
        tagline: 'Designing the invisible architecture that makes ambitious products feel effortless.',
        techStack: ['React', 'Tailwind', 'Supabase'],
        focus: 'B2B product experience',
        githubUrl: 'https://github.com/maya-lee',
        linkedinUrl: 'https://linkedin.com/in/maya-lee',
        projects: ['signal-studio'],
    },
    {
        handle: 'noah-garcia',
        name: 'Noah Garcia',
        tagline: 'Building resilient systems with a founder mindset and shipping discipline.',
        techStack: ['Node.js', 'Docker', 'Azure'],
        focus: 'Infrastructure and delivery',
        githubUrl: 'https://github.com/noah-garcia',
        linkedinUrl: 'https://linkedin.com/in/noah-garcia',
        projects: ['pulse-ops'],
    },
];

export const projects: Project[] = [
    {
        id: 'vibehub',
        title: 'VibeHub',
        ownerHandle: 'DivyaPrakash04',
        week: 3,
        deployUrl: 'https://vibehub-demo.vercel.app',
        sourceUrl: 'https://github.com/DivyaPrakash04/vibehub',
        techStack: ['Next.js', 'TypeScript', 'Tailwind', 'Framer Motion'],
        summary: 'A speaking-first marketing surface that turns cohort momentum into a launchable narrative.',
        whyItMatters:
            'It gives partners a fast, credible story about the team\'s ability to ship high-signal experiences.',
        changelog: [
            { date: '2026-08-01', description: 'Launched high-energy hero experience and dynamic project showcase.' },
            { date: '2026-08-03', description: 'Added participant profiles and persuasive partner-facing narrative.' },
        ],
    },
    {
        id: 'signal-studio',
        title: 'Signal Studio',
        ownerHandle: 'maya-lee',
        week: 2,
        deployUrl: 'https://signal-studio-demo.vercel.app',
        sourceUrl: 'https://github.com/maya-lee/signal-studio',
        techStack: ['React', 'Supabase', 'Tailwind'],
        summary: 'A collaborative workflow engine that sharpens product signals for founders and operators.',
        whyItMatters:
            'It demonstrates how strong product thinking can turn internal workflows into polished launch moments.',
        changelog: [
            { date: '2026-07-24', description: 'Rolled out responsive dashboard for fast signal review.' },
            { date: '2026-07-29', description: 'Integrated live collaboration and richer onboarding states.' },
        ],
    },
];

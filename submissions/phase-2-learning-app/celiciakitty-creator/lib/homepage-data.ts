import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Layers,
  Lightbulb,
  Target,
  Users,
} from "lucide-react";

export const brand = {
  name: "LexLearn",
  tagline: "Learn. Understand. Apply.",
} as const;

export const navigation: {
  label: string;
  href: string;
  active?: boolean;
}[] = [
  { label: "Home", href: "#", active: true },
  { label: "Learn", href: "#learn" },
  { label: "Quizzes", href: "#quizzes" },
  { label: "Progress", href: "#progress" },
  { label: "About", href: "#about" },
] as const;

export const hero = {
  eyebrow: "BEGINNER-FRIENDLY UK LAW",
  heading: ["Learn with clarity.", "Apply with confidence."],
  supporting:
    "Explore civil law, criminal law and everyday legal rights through interactive lessons, real-life examples and quizzes—designed for beginners with no prior legal knowledge.",
  primaryCta: "Start Learning",
  secondaryCta: "Browse Modules",
} as const;

export const features = [
  {
    icon: Layers,
    title: "3 Subject Areas",
    description: "Civil, criminal & everyday law",
  },
  {
    icon: BookOpen,
    title: "5 Modules",
    description: "Structured learning path",
  },
  {
    icon: GraduationCap,
    title: "Beginner Friendly",
    description: "No prior knowledge needed",
  },
  {
    icon: ClipboardCheck,
    title: "Interactive Quizzes",
    description: "Test and reinforce learning",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description: "See your improvement",
  },
] as const;

export const benefits: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Users,
    title: "Real-life scenarios",
    description: "Understand the law through everyday examples",
  },
  {
    icon: Target,
    title: "Bite-sized lessons",
    description: "Short, focused lessons that fit your schedule",
  },
  {
    icon: Lightbulb,
    title: "Did you know?",
    description: "Discover interesting legal facts as you learn",
  },
  {
    icon: BarChart3,
    title: "Track and improve",
    description: "Monitor your progress and celebrate milestones",
  },
];

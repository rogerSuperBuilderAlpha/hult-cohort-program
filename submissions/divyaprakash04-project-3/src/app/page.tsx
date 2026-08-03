"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Globe2, Rocket, Sparkles, Users } from 'lucide-react';
import { cohortStats, participants, projects } from '@/data/cohort';

const statKeys = Object.entries(cohortStats) as [string, string | number][];

export default function HomePage() {
    return (
        <main className="min-h-screen px-6 py-8 text-slate-100 lg:px-10 lg:py-10">
            <div className="mx-auto flex max-w-7xl flex-col gap-8">
                <header className="rounded-full border border-emerald-400/20 bg-slate-900/70 px-4 py-3 shadow-[0_0_40px_rgba(16,185,129,0.12)] backdrop-blur">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="font-display text-lg font-semibold tracking-wide text-white">VibeHub</p>
                            <p className="text-sm text-slate-400">Hult Cursor Cohort 3 • high-signal builder showcase</p>
                        </div>
                        <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                            <Link href="/" className="rounded-full border border-slate-800 px-3 py-1.5 transition hover:border-emerald-400/40 hover:text-white">
                                Home
                            </Link>
                            <Link href="/participants" className="rounded-full border border-slate-800 px-3 py-1.5 transition hover:border-cyan-400/40 hover:text-white">
                                Participants
                            </Link>
                            <Link href="/projects" className="rounded-full border border-slate-800 px-3 py-1.5 transition hover:border-orange-400/40 hover:text-white">
                                Projects
                            </Link>
                        </nav>
                    </div>
                </header>

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="relative overflow-hidden rounded-[2rem] border border-emerald-400/25 bg-slate-900/75 p-8 shadow-[0_0_80px_rgba(16,185,129,0.1)] lg:p-12"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_35%)]" />
                    <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
                                <Sparkles size={16} /> Cohort 3 is building with velocity
                            </div>
                            <div className="space-y-4">
                                <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.4rem]">
                                    A launch-ready story for the builders shaping the next wave.
                                </h1>
                                <p className="max-w-2xl text-lg text-slate-300">
                                    VibeHub turns the cohort into a living, partner-facing signal: sharp people, fast shipping, and credible momentum.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/participants"
                                    className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-emerald-400"
                                >
                                    Meet the builders <ArrowRight size={16} />
                                </Link>
                                <Link
                                    href="/projects"
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-cyan-400/40"
                                >
                                    Explore launches
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/80 p-6">
                            <div className="flex items-center gap-2 text-slate-300">
                                <Rocket size={18} className="text-emerald-400" />
                                <span className="text-sm uppercase tracking-[0.3em]">Signal snapshot</span>
                            </div>
                            <div className="mt-6 grid gap-3">
                                {statKeys.map(([key, value], index) => (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0, x: 12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.07, duration: 0.25 }}
                                        className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4"
                                    >
                                        <p className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-500">{key}</p>
                                        <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid gap-4 rounded-[1.75rem] border border-slate-800 bg-slate-900/65 p-8 lg:grid-cols-3"
                >
                    <div className="flex items-start gap-3">
                        <Users className="mt-1 text-cyan-400" size={20} />
                        <div>
                            <h2 className="font-semibold text-white">Participant-led energy</h2>
                            <p className="mt-1 text-sm text-slate-400">Every profile shows momentum, craft, and the story behind the build.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Globe2 className="mt-1 text-orange-400" size={20} />
                        <div>
                            <h2 className="font-semibold text-white">Partner-facing clarity</h2>
                            <p className="mt-1 text-sm text-slate-400">The platform turns project work into a credible narrative for founders and partners.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Sparkles className="mt-1 text-emerald-400" size={20} />
                        <div>
                            <h2 className="font-semibold text-white">Launch-ready presence</h2>
                            <p className="mt-1 text-sm text-slate-400">Deployment links and evidence keep the story anchored in shipped work.</p>
                        </div>
                    </div>
                </motion.section>

                <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/65 p-8">
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Featured participants</p>
                        <div className="mt-4 grid gap-4">
                            {participants.slice(0, 3).map((participant, index) => (
                                <motion.article
                                    key={participant.handle}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.06 }}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-white">{participant.name}</h3>
                                            <p className="text-sm text-slate-400">@{participant.handle}</p>
                                        </div>
                                        <Link href={`/participants/${participant.handle}`} className="text-sm text-emerald-400">
                                            View profile →
                                        </Link>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-300">{participant.tagline}</p>
                                </motion.article>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/65 p-8">
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Featured projects</p>
                        <div className="mt-4 grid gap-4">
                            {projects.map((project, index) => (
                                <motion.article
                                    key={project.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-white">{project.title}</h3>
                                            <p className="text-sm text-slate-400">Week {project.week} • @{project.ownerHandle}</p>
                                        </div>
                                        <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                                            {project.techStack[0]}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-300">{project.summary}</p>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

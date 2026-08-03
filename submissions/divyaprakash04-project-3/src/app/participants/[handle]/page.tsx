"use client";

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, Github } from 'lucide-react';
import { participants, projects } from '@/data/cohort';

export default function ParticipantDetailPage({ params }: { params: { handle: string } }) {
    const participant = participants.find((entry) => entry.handle === params.handle);

    if (!participant) {
        notFound();
    }

    const participantProjects = projects.filter((project) => project.ownerHandle === participant.handle);

    return (
        <main className="min-h-screen px-6 py-10 text-slate-100 lg:px-10">
            <div className="mx-auto max-w-6xl">
                <Link href="/participants" className="inline-flex items-center gap-2 text-sm text-emerald-400">
                    <ArrowRight size={14} className="rotate-180" /> Back to roster
                </Link>

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 rounded-[1.75rem] border border-emerald-400/20 bg-slate-900/75 p-8 shadow-[0_0_60px_rgba(16,185,129,0.08)]"
                >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Builder profile</p>
                            <h1 className="font-display text-3xl font-semibold">{participant.name}</h1>
                            <p className="mt-2 text-lg text-slate-300">@{participant.handle}</p>
                        </div>
                        <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                            {participant.focus}
                        </div>
                    </div>

                    <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{participant.tagline}</p>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {participant.techStack.map((tech) => (
                            <span key={tech} className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                                {tech}
                            </span>
                        ))}
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <a href={participant.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-emerald-400/40">
                            <Github size={18} className="text-emerald-400" />
                            <span>Open GitHub profile</span>
                        </a>
                        {participant.linkedinUrl ? (
                            <a href={participant.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-cyan-400/40">
                                <ExternalLink size={18} className="text-cyan-400" />
                                <span>Open LinkedIn profile</span>
                            </a>
                        ) : null}
                    </div>
                </motion.section>

                <section className="mt-8 rounded-[1.75rem] border border-slate-800 bg-slate-900/65 p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Highlighted work</p>
                            <h2 className="font-display text-2xl font-semibold">What they ship</h2>
                        </div>
                        <div className="text-sm text-slate-400">Partner-ready product surfaces</div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                        <h3 className="text-lg font-semibold text-white">Why this builder matters</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                            This builder is shaping product stories that feel credible, useful, and instantly understandable to partners and founders.
                        </p>
                    </div>

                    <div className="mt-6 grid gap-4">
                        {participantProjects.length > 0 ? (
                            participantProjects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-white">{project.title}</h3>
                                            <p className="text-sm text-slate-400">Week {project.week}</p>
                                        </div>
                                        <a href={project.deployUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-emerald-400">
                                            Live deployment <ArrowRight size={14} />
                                        </a>
                                    </div>
                                    <p className="mt-3 text-sm leading-7 text-slate-300">{project.summary}</p>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400">No featured projects yet for this builder.</p>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

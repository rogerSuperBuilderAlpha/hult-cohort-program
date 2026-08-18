"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Github, Linkedin } from 'lucide-react';
import { participants } from '@/data/cohort';

export default function ParticipantsPage() {
    return (
        <main className="min-h-screen px-6 py-10 text-slate-100 lg:px-10">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Builder roster</p>
                        <h1 className="font-display text-3xl font-semibold">Cohort builders</h1>
                    </div>
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-emerald-400">
                        <ArrowRight size={14} className="rotate-180" /> Back home
                    </Link>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {participants.map((participant, index) => (
                        <motion.article
                            key={participant.handle}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: index * 0.06 }}
                            whileHover={{ y: -6, scale: 1.01 }}
                            className="group rounded-[1.5rem] border border-slate-800 bg-slate-900/70 p-6 shadow-[0_0_45px_rgba(16,185,129,0.06)]"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold text-white">{participant.name}</h2>
                                    <p className="mt-1 text-sm text-slate-400">@{participant.handle}</p>
                                </div>
                                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[0.7rem] text-emerald-300">
                                    {participant.focus}
                                </span>
                            </div>

                            <p className="mt-4 text-sm leading-6 text-slate-300">{participant.tagline}</p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {participant.techStack.map((tech) => (
                                    <span key={tech} className="rounded-full bg-slate-800 px-2.5 py-1 text-[0.7rem] text-slate-300">
                                        {tech}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3 text-sm">
                                <a href={participant.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-emerald-400 transition group-hover:text-emerald-300">
                                    <Github size={14} /> GitHub
                                </a>
                                {participant.linkedinUrl ? (
                                    <a href={participant.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-cyan-400 transition group-hover:text-cyan-300">
                                        <Linkedin size={14} /> LinkedIn
                                    </a>
                                ) : null}
                                <Link href={`/participants/${participant.handle}`} className="inline-flex items-center gap-2 text-orange-400 transition group-hover:text-orange-300">
                                    Full profile <ArrowRight size={14} />
                                </Link>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </main>
    );
}

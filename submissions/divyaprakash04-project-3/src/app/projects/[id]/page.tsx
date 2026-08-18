"use client";

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { projects } from '@/data/cohort';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
    const project = projects.find((entry) => entry.id === params.id);

    if (!project) {
        notFound();
    }

    return (
        <main className="min-h-screen px-6 py-10 text-slate-100 lg:px-10">
            <div className="mx-auto max-w-6xl">
                <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-emerald-400">
                    <ArrowRight size={14} className="rotate-180" /> Back to projects
                </Link>

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 rounded-[1.75rem] border border-cyan-400/20 bg-slate-900/75 p-8 shadow-[0_0_60px_rgba(59,130,246,0.08)]"
                >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Project detail</p>
                            <h1 className="font-display text-3xl font-semibold">{project.title}</h1>
                            <p className="mt-2 text-slate-400">Week {project.week} • @{project.ownerHandle}</p>
                        </div>
                        <a href={project.deployUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950">
                            Launch project <ArrowRight size={14} />
                        </a>
                    </div>

                    <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{project.summary}</p>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                            <span key={tech} className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                                {tech}
                            </span>
                        ))}
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                            <h2 className="font-semibold text-white">Why this matters</h2>
                            <p className="mt-3 text-sm leading-7 text-slate-300">{project.whyItMatters}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                            <h2 className="font-semibold text-white">Evidence & rollout</h2>
                            <div className="mt-4 space-y-3 text-sm text-slate-300">
                                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
                                    <span>Deployment</span>
                                    <a href={project.deployUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-emerald-400">
                                        Open <ExternalLink size={14} />
                                    </a>
                                </div>
                                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
                                    <span>Source code</span>
                                    <a href={project.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-cyan-400">
                                        Open <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                        <h2 className="font-semibold text-white">Technical changelog</h2>
                        <div className="mt-4 space-y-3">
                            {project.changelog.map((item, index) => (
                                <motion.div
                                    key={item.date}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <span className="text-sm text-slate-400">{item.date}</span>
                                    <span className="text-sm text-slate-200">{item.description}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>
            </div>
        </main>
    );
}

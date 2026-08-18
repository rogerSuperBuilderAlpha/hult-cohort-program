"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { projects } from '@/data/cohort';

export default function ProjectsPage() {
    return (
        <main className="min-h-screen px-6 py-10 text-slate-100 lg:px-10">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Launchpad</p>
                        <h1 className="font-display text-3xl font-semibold">Active projects</h1>
                    </div>
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-emerald-400">
                        <ArrowRight size={14} className="rotate-180" /> Back home
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {projects.map((project, index) => (
                        <motion.article
                            key={project.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: index * 0.06 }}
                            whileHover={{ y: -6, scale: 1.01 }}
                            className="group rounded-[1.5rem] border border-slate-800 bg-slate-900/70 p-6 shadow-[0_0_45px_rgba(59,130,246,0.06)]"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold text-white">{project.title}</h2>
                                    <p className="text-sm text-slate-400">Week {project.week} • @{project.ownerHandle}</p>
                                </div>
                                <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-[0.7rem] text-cyan-300">
                                    {project.techStack[0]}
                                </span>
                            </div>
                            <p className="mt-4 text-sm leading-7 text-slate-300">{project.summary}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {project.techStack.map((tech) => (
                                    <span key={tech} className="rounded-full bg-slate-800 px-2.5 py-1 text-[0.7rem] text-slate-300">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <a href={project.deployUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400">
                                    Live deployment <ArrowRight size={14} />
                                </a>
                                <a href={project.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition group-hover:border-cyan-400/40">
                                    Source code <ExternalLink size={14} />
                                </a>
                                <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition group-hover:border-orange-400/40">
                                    View detail <ArrowRight size={14} />
                                </Link>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </main>
    );
}

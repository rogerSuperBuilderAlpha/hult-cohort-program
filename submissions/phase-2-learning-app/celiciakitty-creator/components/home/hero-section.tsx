"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { HeroBannerImage } from "@/components/home/hero-banner-image";
import { getContinueHref } from "@/lib/course/index";
import { hero } from "@/lib/homepage-data";
import { useProgress } from "@/hooks/use-progress";

export function HeroSection() {
  const { progress, hydrated } = useProgress();
  const continueHref = hydrated ? getContinueHref(progress) : "/learn/1";

  return (
    <section
      id="hero"
      className="relative z-0 border-b border-lex-navy/8 bg-gradient-to-b from-lex-pale via-lex-surface to-lex-pale"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1fr_minmax(280px,42%)] lg:gap-10 lg:px-8 lg:py-16">
        <motion.div
          className="relative z-10 order-2 lg:order-1"
          initial={false}
        >
          <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-lex-gold">
            {hero.eyebrow}
          </p>
          <h1
            id="hero-heading"
            className="font-serif text-4xl leading-[1.12] text-lex-navy sm:text-5xl lg:text-[3.25rem]"
          >
            {hero.heading[0]}
            <br />
            <span className="italic">{hero.heading[1]}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-lex-navy/75 sm:text-lg">
            {hero.supporting}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={continueHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-lex-navy px-6 text-base font-medium text-white shadow-md hover:bg-lex-navy/90"
            >
              {hero.primaryCta}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/learn"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-lex-navy/20 bg-white px-6 text-base font-medium text-lex-navy shadow-sm hover:bg-lex-pale"
            >
              {hero.secondaryCta}
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="relative z-0 order-1 lg:order-2"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: "easeOut", delay: 0.1 }}
        >
          <div
            className="pointer-events-none absolute -inset-4 z-0 rounded-3xl bg-lex-navy/5 blur-2xl lg:-inset-6"
            aria-hidden
          />
          <HeroBannerImage />
        </motion.div>
      </div>
    </section>
  );
}

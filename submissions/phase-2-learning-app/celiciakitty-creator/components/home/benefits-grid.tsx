"use client";

import { MotionHover, MotionWrapper } from "@/components/home/motion-wrapper";
import { benefits } from "@/lib/homepage-data";

export function BenefitsGrid() {
  return (
    <MotionWrapper delay={0.08}>
      <section id="about" className="mt-10" aria-labelledby="benefits-heading">
        <h2
          id="benefits-heading"
          className="mb-5 font-serif text-2xl font-semibold text-lex-navy"
        >
          Why Learn with LexLearn?
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {benefits.map((benefit, index) => (
            <li key={benefit.title}>
              <MotionHover>
                <MotionWrapper delay={0.04 * index}>
                  <article className="flex h-full gap-4 rounded-xl border border-lex-navy/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-lex-pale text-lex-navy">
                      <benefit.icon className="size-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-medium text-lex-navy">{benefit.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-lex-navy/65">
                        {benefit.description}
                      </p>
                    </div>
                  </article>
                </MotionWrapper>
              </MotionHover>
            </li>
          ))}
        </ul>
      </section>
    </MotionWrapper>
  );
}

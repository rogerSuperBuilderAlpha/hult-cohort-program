"use client";

import { MotionHover, MotionWrapper } from "@/components/home/motion-wrapper";
import { features } from "@/lib/homepage-data";

export function FeatureStrip() {
  return (
    <div className="relative z-20">
      <MotionWrapper className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-4 mb-10 grid gap-4 sm:grid-cols-2 lg:-mt-6 lg:grid-cols-3 xl:grid-cols-5">
        {features.map((feature, index) => (
          <MotionHover key={feature.title}>
            <MotionWrapper delay={index * 0.06}>
              <article className="flex h-full items-start gap-4 rounded-xl border border-lex-navy/10 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(30,58,95,0.18)]">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-lex-pale text-lex-navy ring-1 ring-lex-navy/8">
                  <feature.icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <h2 className="font-serif text-lg font-semibold text-lex-navy">
                    {feature.title}
                  </h2>
                  <p className="mt-1 text-sm text-lex-navy/65">
                    {feature.description}
                  </p>
                </div>
              </article>
            </MotionWrapper>
          </MotionHover>
        ))}
        </div>
      </MotionWrapper>
    </div>
  );
}

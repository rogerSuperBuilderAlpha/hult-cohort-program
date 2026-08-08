"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Gavel,
  Handshake,
  Landmark,
  Lock,
  Scale,
  ShieldAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { MotionHover, MotionWrapper } from "@/components/home/motion-wrapper";
import { CategoryBadge } from "@/components/learn/category-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getModuleDisplayStatus } from "@/lib/course/index";
import {
  COURSE_SUBTITLE,
  COURSE_TITLE,
  moduleRegistry,
} from "@/lib/course/modules";
import type { ModuleDisplayStatus, ModuleId } from "@/lib/course/types";
import { useProgress } from "@/hooks/use-progress";
import { cn } from "@/lib/utils";

const moduleIcons: LucideIcon[] = [
  Handshake,
  Scale,
  Gavel,
  ShieldAlert,
  Landmark,
];

export function CourseModulesList() {
  const { progress, hydrated } = useProgress();

  return (
    <MotionWrapper delay={0.05}>
      <section aria-labelledby="modules-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2
            id="modules-heading"
            className="font-serif text-2xl font-semibold text-lex-navy"
          >
            Learning Modules
          </h2>
          <Link
            href="/learn"
            className="text-sm font-medium text-lex-navy/60 transition-colors hover:text-lex-navy"
          >
            View all
          </Link>
        </div>

        <MotionHover>
          <Card className="overflow-hidden rounded-2xl border-lex-navy/10 bg-white py-0 shadow-[0_12px_40px_-16px_rgba(30,58,95,0.2)] ring-0">
            <CardHeader className="border-b border-lex-navy/8 bg-lex-pale/40 px-5 py-4">
              <CardTitle className="font-serif text-lg text-lex-navy">
                {COURSE_TITLE}
              </CardTitle>
              <p className="mt-1 text-sm text-lex-navy/65">{COURSE_SUBTITLE}</p>
            </CardHeader>
            <CardContent className="divide-y divide-lex-navy/8 p-0">
              <ul>
                {moduleRegistry.map((module, index) => {
                  const Icon = moduleIcons[index] ?? Handshake;
                  const moduleId = module.id as ModuleId;
                  const status: ModuleDisplayStatus = hydrated
                    ? getModuleDisplayStatus(progress, moduleId)
                    : moduleId === "1"
                      ? "available"
                      : "locked";
                  const isLocked = status === "locked";
                  const href = isLocked ? undefined : `/learn/${moduleId}`;

                  const content = (
                    <>
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-lg",
                          isLocked
                            ? "bg-lex-pale/80 text-lex-navy/40"
                            : "bg-lex-pale text-lex-navy"
                        )}
                      >
                        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5">
                          <CategoryBadge category={module.category} />
                        </div>
                        <h3
                          className={cn(
                            "font-medium",
                            isLocked ? "text-lex-navy/50" : "text-lex-navy"
                          )}
                        >
                          {module.title}
                        </h3>
                        <p
                          className={cn(
                            "mt-0.5 text-sm",
                            isLocked ? "text-lex-navy/40" : "text-lex-navy/65"
                          )}
                        >
                          {module.description}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {status === "completed" && (
                          <CheckCircle2
                            className="size-5 text-emerald-600"
                            aria-label="Completed"
                          />
                        )}
                        {status === "in-progress" && (
                          <span className="rounded-full bg-lex-navy/10 px-2.5 py-1 text-xs font-semibold text-lex-navy">
                            In progress
                          </span>
                        )}
                        {status === "available" && (
                          <span className="rounded-full bg-lex-gold/15 px-2.5 py-1 text-xs font-semibold text-lex-navy">
                            Start
                          </span>
                        )}
                        {status === "locked" && (
                          <Lock
                            className="size-4 text-lex-navy/35"
                            aria-label="Locked"
                          />
                        )}
                      </div>
                    </>
                  );

                  return (
                    <li key={module.id}>
                      {href ? (
                        <Link
                          href={href}
                          className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-lex-pale/30"
                        >
                          {content}
                        </Link>
                      ) : (
                        <article className="flex items-center gap-4 bg-white/60 px-5 py-4">
                          {content}
                        </article>
                      )}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </MotionHover>
      </section>
    </MotionWrapper>
  );
}

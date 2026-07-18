"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import CohortRow from "@/components/CohortRow";
import GoToNav from "@/components/GoToNav";
import {
  AllSubmissions,
  COHORT_ROW_COUNT,
  getRowSubmission,
  InitiativeSubmissions,
  SubmissionField,
} from "@/lib/cohortSubmissions";
import { getInitiativeAnchorId, initiatives, type Initiative } from "@/lib/initiatives";
import { STATUS_TIER_DEFINITIONS } from "@/lib/rowTiers";
import { tableClass, thClass } from "@/lib/tableStyles";

const rowNumbers = Array.from({ length: COHORT_ROW_COUNT }, (_, index) => index + 1);
const ROW_HEIGHT_PX = 28;
const ROW_OVERSCAN = 6;
const TABLE_BODY_MAX_HEIGHT = "28rem";
const COLUMN_COUNT = 8;

function StatusLegend() {
  return (
    <div
      aria-label="Row status colour legend"
      className="rounded border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-surface-border dark:bg-surface-card"
    >
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] leading-tight">
        {STATUS_TIER_DEFINITIONS.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5 text-slate-700 dark:text-surface-secondary">
            <span
              className={`inline-block h-2 w-4 shrink-0 rounded-sm border ${
                item.isDefault ? "bg-white dark:bg-surface-bg" : ""
              }`}
              style={{
                backgroundColor: item.background,
                borderColor: item.border,
              }}
              aria-hidden="true"
            />
            <span className="tabular-nums">
              {item.label}
              {item.trophy ? " 🏆" : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface VirtualizedCohortBodyProps {
  initiativeTitle: string;
  submissions: InitiativeSubmissions;
  onToggleField: (rowNumber: number, field: SubmissionField) => void;
  onUpdateName: (rowNumber: number, name: string) => void;
}

function VirtualizedCohortBody({
  initiativeTitle,
  submissions,
  onToggleField,
  onUpdateName,
}: VirtualizedCohortBodyProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 30 });

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const updateRange = () => {
      const start = Math.max(
        0,
        Math.floor(scrollElement.scrollTop / ROW_HEIGHT_PX) - ROW_OVERSCAN
      );
      const visibleCount =
        Math.ceil(scrollElement.clientHeight / ROW_HEIGHT_PX) + ROW_OVERSCAN * 2;
      const end = Math.min(COHORT_ROW_COUNT, start + visibleCount);
      setVisibleRange((current) =>
        current.start === start && current.end === end ? current : { start, end }
      );
    };

    updateRange();
    scrollElement.addEventListener("scroll", updateRange, { passive: true });
    window.addEventListener("resize", updateRange);

    return () => {
      scrollElement.removeEventListener("scroll", updateRange);
      window.removeEventListener("resize", updateRange);
    };
  }, []);

  const topSpacerHeight = visibleRange.start * ROW_HEIGHT_PX;
  const bottomSpacerHeight = (COHORT_ROW_COUNT - visibleRange.end) * ROW_HEIGHT_PX;
  const visibleRows = rowNumbers.slice(visibleRange.start, visibleRange.end);

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto overflow-y-auto"
      style={{ maxHeight: TABLE_BODY_MAX_HEIGHT }}
    >
      <table className={tableClass}>
        <caption className="sr-only">{initiativeTitle} cohort submissions</caption>
        <thead className="sticky top-0 z-10">
          <tr>
            <th className={`${thClass} w-16 text-center`}>#</th>
            <th className={`${thClass} min-w-[9rem]`}>Name</th>
            <th className={`${thClass} text-center`}>Pull Request Merged</th>
            <th className={`${thClass} text-center`}>1st Review Submitted</th>
            <th className={`${thClass} text-center`}>2nd Review Submitted</th>
            <th className={`${thClass} text-center`}>1st Vote Submitted</th>
            <th className={`${thClass} text-center`}>2nd Vote Submitted</th>
            <th className={`${thClass} text-center`}>Status</th>
          </tr>
        </thead>
        <tbody>
          {topSpacerHeight > 0 && (
            <tr aria-hidden="true">
              <td colSpan={COLUMN_COUNT} style={{ height: topSpacerHeight, padding: 0, border: "none" }} />
            </tr>
          )}
          {visibleRows.map((rowNumber) => (
            <CohortRow
              key={rowNumber}
              rowNumber={rowNumber}
              row={getRowSubmission(submissions, rowNumber)}
              onToggleField={onToggleField}
              onUpdateName={onUpdateName}
            />
          ))}
          {bottomSpacerHeight > 0 && (
            <tr aria-hidden="true">
              <td colSpan={COLUMN_COUNT} style={{ height: bottomSpacerHeight, padding: 0, border: "none" }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

interface InitiativeCohortTableProps {
  initiative: Initiative;
  submissions: InitiativeSubmissions;
  onToggle: (initiativeSlug: string, rowNumber: number, field: SubmissionField) => void;
  onUpdateName: (initiativeSlug: string, rowNumber: number, name: string) => void;
}

const InitiativeCohortTable = memo(function InitiativeCohortTable({
  initiative,
  submissions,
  onToggle,
  onUpdateName,
}: InitiativeCohortTableProps) {
  const onToggleField = useCallback(
    (rowNumber: number, field: SubmissionField) => {
      onToggle(initiative.slug, rowNumber, field);
    },
    [initiative.slug, onToggle]
  );

  const onUpdateRowName = useCallback(
    (rowNumber: number, name: string) => {
      onUpdateName(initiative.slug, rowNumber, name);
    },
    [initiative.slug, onUpdateName]
  );

  return (
    <div id={getInitiativeAnchorId(initiative.slug)} className="scroll-mt-8 space-y-3">
      <h3 className="overflow-visible rounded-lg bg-brand-50 px-3 py-3.5 text-center font-display text-lg font-bold leading-relaxed text-brand-700 underline decoration-brand-400 underline-offset-[0.2em] dark:bg-brand-500/10 dark:text-brand-400 dark:decoration-brand-500/60 sm:text-xl">
        {initiative.title}
      </h3>

      <VirtualizedCohortBody
        initiativeTitle={initiative.title}
        submissions={submissions}
        onToggleField={onToggleField}
        onUpdateName={onUpdateRowName}
      />

      <GoToNav menuIdSuffix={initiative.slug} />
    </div>
  );
});

export default function InitiativeSummary({
  submissions,
  onToggle,
  onUpdateName,
}: {
  submissions: AllSubmissions;
  onToggle: (initiativeSlug: string, rowNumber: number, field: SubmissionField) => void;
  onUpdateName: (initiativeSlug: string, rowNumber: number, name: string) => void;
}) {
  return (
    <section aria-label="Initiative summary" className="space-y-8">
      <div className="space-y-3">
        <h2 className="section-heading">Initiative Summary</h2>
        <StatusLegend />
      </div>

      {initiatives.map((initiative) => (
        <InitiativeCohortTable
          key={initiative.slug}
          initiative={initiative}
          submissions={submissions[initiative.slug] ?? {}}
          onToggle={onToggle}
          onUpdateName={onUpdateName}
        />
      ))}
    </section>
  );
}

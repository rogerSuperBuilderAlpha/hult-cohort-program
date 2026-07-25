"use client";

import { memo } from "react";
import {
  calculateRowStatus,
  COHORT_NAME_MAX_LENGTH,
  RowSubmission,
  sanitizeCohortName,
  SUBMISSION_FIELDS,
  SubmissionField,
} from "@/lib/cohortSubmissions";
import {
  cohortTdBaseClass,
  cohortTdDefaultClass,
  cohortTdDefaultNumberClass,
  cohortTdDefaultStatusClass,
} from "@/lib/tableStyles";
import { getRowTier, tierCellStyle } from "@/lib/rowTiers";

function SubmissionCheckbox({
  label,
  checked,
  onChange,
  inverted,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  inverted?: boolean;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
      className={`h-3.5 w-3.5 cursor-pointer rounded focus:ring-2 focus:ring-white/40 ${
        inverted
          ? "border-white/60 bg-white/10 text-white"
          : "border-slate-300 text-brand-600 focus:ring-brand-500/20 dark:border-surface-border dark:bg-surface-bg"
      }`}
    />
  );
}

function NameInput({
  rowNumber,
  value,
  onChange,
}: {
  rowNumber: number;
  value: string;
  onChange: (name: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(sanitizeCohortName(event.target.value))}
      maxLength={COHORT_NAME_MAX_LENGTH}
      inputMode="text"
      autoComplete="off"
      spellCheck={false}
      aria-label={`Row ${rowNumber} name`}
      className="w-full border-0 bg-transparent p-0 text-sm leading-tight text-inherit outline-none focus:ring-0"
    />
  );
}

interface CohortRowProps {
  rowNumber: number;
  row: RowSubmission;
  onToggleField: (rowNumber: number, field: SubmissionField) => void;
  onUpdateName: (rowNumber: number, name: string) => void;
}

function CohortRow({ rowNumber, row, onToggleField, onUpdateName }: CohortRowProps) {
  const statusPercent = calculateRowStatus(row);
  const tier = getRowTier(statusPercent);
  const cellStyle = tierCellStyle(tier);
  const invertedCheckbox = !tier.isDefault && statusPercent >= 40;

  return (
    <tr className={`transition-colors duration-300 ${tier.showTrophy ? "shadow-md shadow-purple-500/25" : ""}`}>
      <td
        className={
          tier.isDefault
            ? cohortTdDefaultNumberClass
            : `${cohortTdBaseClass} border-l-4 text-center tabular-nums font-medium`
        }
        style={tier.isDefault ? undefined : { ...cellStyle, borderLeftColor: tier.accent }}
      >
        {rowNumber}
      </td>
      <td className={tier.isDefault ? cohortTdDefaultClass : cohortTdBaseClass} style={cellStyle}>
        <NameInput
          rowNumber={rowNumber}
          value={row.name}
          onChange={(name) => onUpdateName(rowNumber, name)}
        />
      </td>
      {SUBMISSION_FIELDS.map((field) => (
        <td
          key={field}
          className={`${tier.isDefault ? cohortTdDefaultClass : cohortTdBaseClass} text-center`}
          style={cellStyle}
        >
          <SubmissionCheckbox
            label={`Row ${rowNumber} ${field}`}
            checked={row[field]}
            onChange={() => onToggleField(rowNumber, field)}
            inverted={invertedCheckbox}
          />
        </td>
      ))}
      <td
        className={
          tier.isDefault ? cohortTdDefaultStatusClass : `${cohortTdBaseClass} text-center font-bold tabular-nums`
        }
        style={cellStyle}
      >
        <div className="flex items-center justify-center gap-1.5">
          <span>{statusPercent}%</span>
          {tier.showTrophy && (
            <span aria-label="Achievement unlocked" role="img">
              🏆
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

function rowsAreEqual(previous: RowSubmission, next: RowSubmission): boolean {
  return (
    previous.name === next.name &&
    SUBMISSION_FIELDS.every((field) => previous[field] === next[field])
  );
}

export default memo(CohortRow, (previous, next) => {
  return (
    previous.rowNumber === next.rowNumber &&
    rowsAreEqual(previous.row, next.row) &&
    previous.onToggleField === next.onToggleField &&
    previous.onUpdateName === next.onUpdateName
  );
});

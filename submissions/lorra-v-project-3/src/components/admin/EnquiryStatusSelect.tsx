"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEnquiryStatusAction } from "@/app/admin/enquiries/actions";
import type { EnquiryStatus } from "@/lib/types/enquiry";
import { ENQUIRY_STATUS_LABELS } from "@/lib/types/enquiry";

type Props = {
  enquiryId: string;
  status: EnquiryStatus;
};

export function EnquiryStatusSelect({ enquiryId, status }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      aria-label="Enquiry status"
      className="h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral"
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as EnquiryStatus;
        startTransition(async () => {
          await updateEnquiryStatusAction(enquiryId, next);
          router.refresh();
        });
      }}
    >
      {(Object.keys(ENQUIRY_STATUS_LABELS) as EnquiryStatus[]).map((value) => (
        <option key={value} value={value}>
          {ENQUIRY_STATUS_LABELS[value]}
        </option>
      ))}
    </select>
  );
}

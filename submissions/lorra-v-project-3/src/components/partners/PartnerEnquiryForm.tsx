"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { INTEREST_TYPES } from "@/lib/types/enquiry";

export type EnquiryOption = {
  value: string;
  label: string;
};

type Props = {
  projects: EnquiryOption[];
  participants: EnquiryOption[];
  defaultProjectId?: string | null;
  defaultParticipantId?: string | null;
};

export function PartnerEnquiryForm({
  projects,
  participants,
  defaultProjectId,
  defaultParticipantId,
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      organization: String(form.get("organization") || ""),
      contact_name: String(form.get("contact_name") || ""),
      email: String(form.get("email") || ""),
      interest_type: String(form.get("interest_type") || ""),
      project_id: String(form.get("project_id") || "none"),
      participant_id: String(form.get("participant_id") || "none"),
      website_url: String(form.get("website_url") || ""),
      linkedin_url: String(form.get("linkedin_url") || ""),
      message: String(form.get("message") || ""),
    };

    try {
      const res = await fetch("/api/partner-enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(data.error || "Submission failed. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div
        className="relative overflow-hidden rounded-xl border border-accent-partners/40 bg-background-elevated px-6 py-10"
        role="status"
        aria-live="polite"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at 20% 30%, color-mix(in oklab, var(--accent-partners) 35%, transparent), transparent 55%), radial-gradient(ellipse at 85% 70%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative space-y-3">
          <p className="text-xs uppercase tracking-[0.16em] text-accent-partners">
            Enquiry received
          </p>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Thanks — we’ll be in touch
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-foreground-muted">
            Your interest is with the Comentiq team. We’ll match it to the right
            builder or project and follow up at the email you provided.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Input
        label="Organization"
        name="organization"
        required
        autoComplete="organization"
        placeholder="Acme Labs"
        disabled={pending}
      />
      <Input
        label="Website"
        name="website_url"
        type="url"
        inputMode="url"
        autoComplete="url"
        placeholder="https://…"
        hint="Optional"
        disabled={pending}
      />
      <Input
        label="LinkedIn"
        name="linkedin_url"
        type="url"
        inputMode="url"
        placeholder="https://linkedin.com/…"
        hint="Optional"
        disabled={pending}
      />
      <Input
        label="Contact name"
        name="contact_name"
        required
        autoComplete="name"
        placeholder="Alex Rivera"
        disabled={pending}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="alex@acme.com"
        disabled={pending}
      />
      <Select
        label="Interest type"
        name="interest_type"
        required
        defaultValue="General"
        options={INTEREST_TYPES.map((t) => ({ value: t, label: t }))}
        disabled={pending}
      />
      <Select
        label="Project (optional)"
        name="project_id"
        defaultValue={defaultProjectId || "none"}
        options={[
          { value: "none", label: "No specific project" },
          ...projects,
        ]}
        disabled={pending}
      />
      <Select
        label="Builder (optional)"
        name="participant_id"
        defaultValue={defaultParticipantId || "none"}
        options={[
          { value: "none", label: "No specific builder" },
          ...participants,
        ]}
        disabled={pending}
      />
      <Textarea
        label="Message"
        name="message"
        rows={5}
        placeholder="What are you looking for, and how might you help?"
        disabled={pending}
      />

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      <Button type="submit" accent="partners" disabled={pending}>
        {pending ? "Sending…" : "Submit enquiry"}
      </Button>
    </form>
  );
}

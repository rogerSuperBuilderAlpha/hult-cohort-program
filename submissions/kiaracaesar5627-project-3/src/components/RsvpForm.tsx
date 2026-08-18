"use client";

import { FormEvent, useState, useTransition } from "react";
import { SuccessBurst } from "@/components/SuccessBurst";

export function RsvpForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<"in-person" | "virtual">(
    "virtual",
  );
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") || ""),
          company: String(data.get("company") || ""),
          email: String(data.get("email") || ""),
          attendance,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setStatus(json.error || "RSVP failed.");
        return;
      }
      form.reset();
      setAttendance("virtual");
      setStatus("You're on the list for the Aug 19 hiring partner showcase.");
    });
  }

  const success = status?.startsWith("You're");

  return (
    <form onSubmit={onSubmit} className="fun-form grid max-w-xl gap-4">
      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" required autoComplete="organization" />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <p className="mb-2 text-sm text-[var(--fog)]">Attendance</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`filter-chip ${attendance === "in-person" ? "is-active" : ""}`}
            onClick={() => setAttendance("in-person")}
          >
            In person — Boston
          </button>
          <button
            type="button"
            className={`filter-chip ${attendance === "virtual" ? "is-active" : ""}`}
            onClick={() => setAttendance("virtual")}
          >
            Virtual livestream
          </button>
        </div>
      </div>
      <button
        className="btn btn-primary btn-bounce w-fit"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving…" : "RSVP"}
      </button>
      {success && status ? <SuccessBurst message={status} /> : null}
      {status && !success ? (
        <p className="text-sm text-[var(--ember)]" role="status">
          {status}
        </p>
      ) : null}
    </form>
  );
}

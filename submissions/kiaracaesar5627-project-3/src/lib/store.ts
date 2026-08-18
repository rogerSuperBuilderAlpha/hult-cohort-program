export type IntroRequest = {
  id: string;
  partnerName: string;
  company: string;
  email: string;
  studentHandles: string[];
  message: string;
  createdAt: string;
};

export type RsvpRequest = {
  id: string;
  name: string;
  company: string;
  email: string;
  attendance: "in-person" | "virtual";
  createdAt: string;
};

const globalStore = globalThis as typeof globalThis & {
  __signalIntros?: IntroRequest[];
  __signalRsvps?: RsvpRequest[];
};

function intros() {
  if (!globalStore.__signalIntros) globalStore.__signalIntros = [];
  return globalStore.__signalIntros;
}

function rsvps() {
  if (!globalStore.__signalRsvps) globalStore.__signalRsvps = [];
  return globalStore.__signalRsvps;
}

export function addIntro(input: Omit<IntroRequest, "id" | "createdAt">) {
  const row: IntroRequest = {
    ...input,
    id: `intro_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  intros().unshift(row);
  return row;
}

export function addRsvp(input: Omit<RsvpRequest, "id" | "createdAt">) {
  const row: RsvpRequest = {
    ...input,
    id: `rsvp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  rsvps().unshift(row);
  return row;
}

export function listIntros() {
  return [...intros()];
}

export function listRsvps() {
  return [...rsvps()];
}

/** Best-effort notify placement lead when Resend is configured. */
export async function notifyPlacementLead(subject: string, body: string) {
  const to = process.env.PLACEMENT_LEAD_EMAIL?.trim();
  const key = process.env.RESEND_API_KEY?.trim();
  if (!to || !key) {
    console.info("[signal] placement notify (log only):", subject, body);
    return { delivered: false as const, mode: "log" as const };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Trailmark <onboarding@resend.dev>",
      to: [to],
      subject,
      text: body,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[signal] Resend failed", res.status, text);
    return { delivered: false as const, mode: "resend-error" as const };
  }

  return { delivered: true as const, mode: "resend" as const };
}

export type TestimonialKind =
  | "mentor"
  | "partner"
  | "peer"
  | "operator";

export type Testimonial = {
  id: string;
  kind: TestimonialKind;
  quote: string;
  author: string;
  role: string;
  org?: string;
  aboutHandle?: string;
  /** Seed quotes for UX — not live partner feedback. */
  isDemo?: boolean;
};

export const TESTIMONIAL_KIND_LABEL: Record<TestimonialKind, string> = {
  mentor: "Mentor feedback",
  partner: "Partner feedback",
  peer: "Peer recognition",
  operator: "Operator note",
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    kind: "mentor",
    isDemo: true,
    quote:
      "Rawle’s Forth deploy was the first PM tool I could open without a walkthrough. Clear status, honest scope, and docs that operators can inherit.",
    author: "Elena Vos",
    role: "Program mentor",
    org: "Hult Cohort",
    aboutHandle: "studmuffin01",
  },
  {
    id: "t2",
    kind: "partner",
    isDemo: true,
    quote:
      "We evaluated three profiles in under fifteen minutes. The build log and Live badge made the difference — we requested intros the same afternoon.",
    author: "Marcus Hale",
    role: "Engineering manager",
    org: "Northline Systems",
  },
  {
    id: "t3",
    kind: "peer",
    isDemo: true,
    quote:
      "Fireside’s Forth deep links saved our review week. Chat stopped dying in threads and started becoming owned tickets.",
    author: "Maya Chen",
    role: "Peer · PM lead",
    aboutHandle: "studmuffin01",
  },
  {
    id: "t4",
    kind: "partner",
    isDemo: true,
    quote:
      "As a pilot partner we ran their prototype with our maintenance desk. The problem framing matched our downtime costs — not a generic AI demo.",
    author: "Priya Shah",
    role: "Ops lead",
    org: "Harbor Cloud",
  },
  {
    id: "t5",
    kind: "mentor",
    isDemo: true,
    quote:
      "Jordan’s peer reviews are specific: deploy URL, failure mode, suggested fix. That is the standard we want employers to see.",
    author: "Chris Okonkwo",
    role: "Technical mentor",
    org: "Hult Cohort",
    aboutHandle: "jblake",
  },
  {
    id: "t6",
    kind: "peer",
    isDemo: true,
    quote:
      "Sofia’s accessibility notes on my PR were sharper than most design reviews I’ve had at work. Quiet excellence.",
    author: "Noah Patel",
    role: "Peer · Engineer",
    aboutHandle: "sreyes",
  },
  {
    id: "t7",
    kind: "operator",
    isDemo: true,
    quote:
      "When Lighthouse wired PM snapshot status into public pages, partner demos stopped needing a separate status deck.",
    author: "Placement desk",
    role: "Cohort operations",
    org: "Hult Cohort",
  },
  {
    id: "t8",
    kind: "mentor",
    isDemo: true,
    quote:
      "Mentor sessions with Priya stay on decisions and trade-offs. Her public write-ups make those choices visible to hiring partners.",
    author: "Amelia Grant",
    role: "Career mentor",
    org: "Ludwitt network",
    aboutHandle: "priya",
  },
];

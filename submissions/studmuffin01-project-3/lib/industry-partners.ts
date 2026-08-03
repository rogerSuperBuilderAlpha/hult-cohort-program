export type IndustryPartner = {
  id: string;
  name: string;
  sector: string;
  /** Seed partners for UX density — not confirmed hiring relationships. */
  isDemo?: boolean;
};

/** Seed hiring / industry partners shown in Live Summary counts. */
export const INDUSTRY_PARTNERS: IndustryPartner[] = [
  { id: "p1", name: "Northline Systems", sector: "Developer tools", isDemo: true },
  { id: "p2", name: "Harbor Cloud", sector: "Infrastructure", isDemo: true },
  { id: "p3", name: "Signal Finance", sector: "Fintech", isDemo: true },
  { id: "p4", name: "Cursor Boston Network", sector: "AI tooling", isDemo: true },
  { id: "p5", name: "Ledger Labs", sector: "B2B SaaS", isDemo: true },
  { id: "p6", name: "Waypoint Health", sector: "Healthtech", isDemo: true },
  { id: "p7", name: "Atlas Robotics", sector: "Hardware + software", isDemo: true },
  { id: "p8", name: "Prime Vector", sector: "Consulting eng", isDemo: true },
  { id: "p9", name: "Open Quay", sector: "Open source ops", isDemo: true },
  { id: "p10", name: "Kinetic Retail", sector: "E-commerce", isDemo: true },
  { id: "p11", name: "Blue Stack Capital", sector: "Venture / tech", isDemo: true },
  { id: "p12", name: "Hult Corporate Partners", sector: "Institutional", isDemo: true },
];

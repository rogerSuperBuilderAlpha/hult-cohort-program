export type IndustryPartner = {
  id: string;
  name: string;
  sector: string;
};

/** Seed hiring / industry partners shown in Live Summary counts. */
export const INDUSTRY_PARTNERS: IndustryPartner[] = [
  { id: "p1", name: "Northline Systems", sector: "Developer tools" },
  { id: "p2", name: "Harbor Cloud", sector: "Infrastructure" },
  { id: "p3", name: "Signal Finance", sector: "Fintech" },
  { id: "p4", name: "Cursor Boston Network", sector: "AI tooling" },
  { id: "p5", name: "Ledger Labs", sector: "B2B SaaS" },
  { id: "p6", name: "Waypoint Health", sector: "Healthtech" },
  { id: "p7", name: "Atlas Robotics", sector: "Hardware + software" },
  { id: "p8", name: "Prime Vector", sector: "Consulting eng" },
  { id: "p9", name: "Open Quay", sector: "Open source ops" },
  { id: "p10", name: "Kinetic Retail", sector: "E-commerce" },
  { id: "p11", name: "Blue Stack Capital", sector: "Venture / tech" },
  { id: "p12", name: "Hult Corporate Partners", sector: "Institutional" },
];

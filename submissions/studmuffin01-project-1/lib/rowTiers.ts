/** Row status tier colours for Initiative Summary gamification. */

export interface RowTier {
  background?: string;
  border?: string;
  text: string;
  accent?: string;
  showTrophy: boolean;
  isDefault: boolean;
}

export interface StatusTierDefinition {
  threshold: number;
  label: string;
  background?: string;
  border: string;
  text: string;
  accent?: string;
  trophy?: boolean;
  isDefault?: boolean;
}

export const STATUS_TIER_DEFINITIONS: StatusTierDefinition[] = [
  {
    threshold: 100,
    label: "100%",
    background: "#8B5CF6",
    border: "#7C3AED",
    text: "#FFFFFF",
    accent: "#6D28D9",
    trophy: true,
  },
  {
    threshold: 80,
    label: "80%",
    background: "#22C55E",
    border: "#16A34A",
    text: "#FFFFFF",
    accent: "#15803D",
  },
  {
    threshold: 60,
    label: "60%",
    background: "#F97316",
    border: "#EA580C",
    text: "#FFFFFF",
    accent: "#C2410C",
  },
  {
    threshold: 40,
    label: "40%",
    background: "#2563EB",
    border: "#1D4ED8",
    text: "#FFFFFF",
    accent: "#1E40AF",
  },
  {
    threshold: 20,
    label: "20%",
    background: "#E2E8F0",
    border: "#CBD5E1",
    text: "#475569",
    accent: "#94A3B8",
  },
  {
    threshold: 0,
    label: "0%",
    border: "#CBD5E1",
    text: "#475569",
    accent: "#94A3B8",
    isDefault: true,
  },
];

export function getRowTier(percent: number): RowTier {
  const tier =
    STATUS_TIER_DEFINITIONS.find((definition) => percent >= definition.threshold) ??
    STATUS_TIER_DEFINITIONS[STATUS_TIER_DEFINITIONS.length - 1];

  return {
    background: tier.background,
    border: tier.border,
    text: tier.text,
    accent: tier.accent,
    showTrophy: tier.trophy ?? false,
    isDefault: tier.isDefault ?? false,
  };
}

export function tierCellStyle(tier: RowTier):
  | {
      backgroundColor: string;
      color: string;
      borderColor: string;
    }
  | undefined {
  if (tier.isDefault || !tier.background) return undefined;

  return {
    backgroundColor: tier.background,
    color: tier.text ?? "000000",
    borderColor: tier.border ?? "#CBD5E1",
  };
}

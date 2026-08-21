export type EquipmentType =
  | 'refrigerator'
  | 'washer'
  | 'dryer'
  | 'pool_heater'
  | 'ac_unit';

export type EquipmentInput = {
  equipment: EquipmentType[];
  effectiveRateUsdPerKwh: number;
  monthlyKwh: number;
};

export type EquipmentRecommendation = {
  equipment: EquipmentType;
  label: string;
  annualKwhSavedRange: { min: number; max: number };
  annualUsdSavedRange: { min: number; max: number };
  action: string;
};

const EQUIPMENT_SHARE: Record<EquipmentType, { min: number; max: number; label: string; action: string }> = {
  refrigerator: {
    min: 0.04,
    max: 0.08,
    label: 'Refrigeration',
    action: 'Check seals, coil cleaning, and right-sizing; consider ENERGY STAR–class replacement at end of life.',
  },
  washer: {
    min: 0.02,
    max: 0.05,
    label: 'Clothes washer',
    action: 'Use cold cycles where appropriate; maintain loads; upgrade to efficient model when replacing.',
  },
  dryer: {
    min: 0.03,
    max: 0.07,
    label: 'Clothes dryer',
    action: 'Clean lint paths; consider heat-pump or line-drying where feasible.',
  },
  pool_heater: {
    min: 0.08,
    max: 0.15,
    label: 'Pool heater / pump',
    action: 'Optimise pump schedules and cover pool; audit heater type and sizing.',
  },
  ac_unit: {
    min: 0.1,
    max: 0.2,
    label: 'Air conditioning',
    action: 'Service units, improve setpoints and zoning; plan high-efficiency replacement.',
  },
};

export function recommendEquipmentUpgrades(input: EquipmentInput): EquipmentRecommendation[] {
  const annualKwh = Math.max(0, input.monthlyKwh * 12);
  const rate = Math.max(0.01, input.effectiveRateUsdPerKwh);

  return input.equipment.map((eq) => {
    const spec = EQUIPMENT_SHARE[eq];
    const minKwh = Math.round(annualKwh * spec.min);
    const maxKwh = Math.round(annualKwh * spec.max);
    return {
      equipment: eq,
      label: spec.label,
      annualKwhSavedRange: { min: minKwh, max: maxKwh },
      annualUsdSavedRange: {
        min: Math.round(minKwh * rate),
        max: Math.round(maxKwh * rate),
      },
      action: spec.action,
    };
  });
}

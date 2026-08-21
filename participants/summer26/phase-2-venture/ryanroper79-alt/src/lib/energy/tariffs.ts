export type JurisdictionId =
  | 'trinidad_tobago'
  | 'barbados'
  | 'jamaica'
  | 'saint_kitts'
  | 'guyana';

export type TariffReference = {
  id: JurisdictionId;
  label: string;
  /** USD per kWh — null when no verified public aggregate rate is available */
  referenceResidentialUsdPerKwh: number | null;
  sourceUrl: string;
  sourceLabel: string;
  collectedPeriod: string | null;
  notes: string;
};

/** Public reference rates — verify at source before decisions. */
export const TARIFF_REFERENCES: TariffReference[] = [
  {
    id: 'trinidad_tobago',
    label: 'Trinidad & Tobago',
    referenceResidentialUsdPerKwh: 0.062,
    sourceUrl: 'https://www.globalpetrolprices.com/Trinidad-and-Tobago/electricity_prices/',
    sourceLabel: 'GlobalPetrolPrices (T&TEC / RIC sources)',
    collectedPeriod: 'December 2025',
    notes: 'Also see T&TEC tariff pages for tiered billing.',
  },
  {
    id: 'barbados',
    label: 'Barbados',
    referenceResidentialUsdPerKwh: 0.329,
    sourceUrl: 'https://www.blpc.com.bb/residential/residential-tariffs-riders/',
    sourceLabel: 'GlobalPetrolPrices (BL&P sources)',
    collectedPeriod: 'December 2025',
    notes: 'Tiered BL&P residential tariffs may differ by consumption band.',
  },
  {
    id: 'jamaica',
    label: 'Jamaica',
    referenceResidentialUsdPerKwh: 0.29,
    sourceUrl: 'https://www.globalpetrolprices.com/Jamaica/electricity_prices/',
    sourceLabel: 'GlobalPetrolPrices (JPS / OUR sources)',
    collectedPeriod: 'December 2025',
    notes: 'JPS bill calculator: https://mybillie.online/JPSBillCalculator',
  },
  {
    id: 'saint_kitts',
    label: 'St Kitts & Nevis',
    referenceResidentialUsdPerKwh: null,
    sourceUrl: 'https://www.skelec.kn/electricity-tariff/',
    sourceLabel: 'SKELEC published tariff schedule',
    collectedPeriod: null,
    notes: 'No aggregate USD/kWh in GlobalPetrolPrices snapshot — use SKELEC tariff or enter your effective rate.',
  },
  {
    id: 'guyana',
    label: 'Guyana',
    referenceResidentialUsdPerKwh: null,
    sourceUrl: 'https://gplinc.com/bill/rates-and-tariffs/',
    sourceLabel: 'GPL rates and tariffs',
    collectedPeriod: null,
    notes: 'Guyana calculator: https://592hub.com/tools/electricity-calculator?type=residential',
  },
];

export type JurisdictionComparison = {
  jurisdiction: JurisdictionId;
  label: string;
  estimatedMonthlyUsd: number | null;
  estimatedAnnualUsd: number | null;
  referenceRateUsdPerKwh: number | null;
  sourceUrl: string;
  isCheapest: boolean;
  notes: string;
};

export function compareJurisdictions(
  monthlyKwh: number,
  homeJurisdiction: JurisdictionId,
  userEffectiveRateUsdPerKwh: number | null
): JurisdictionComparison[] {
  const comparisons = TARIFF_REFERENCES.map((ref) => {
    const rate =
      ref.id === homeJurisdiction && userEffectiveRateUsdPerKwh != null && userEffectiveRateUsdPerKwh > 0
        ? userEffectiveRateUsdPerKwh
        : ref.referenceResidentialUsdPerKwh;

    const estimatedMonthlyUsd = rate != null && monthlyKwh > 0 ? monthlyKwh * rate : null;
    const estimatedAnnualUsd = estimatedMonthlyUsd != null ? estimatedMonthlyUsd * 12 : null;

    return {
      jurisdiction: ref.id,
      label: ref.label,
      estimatedMonthlyUsd,
      estimatedAnnualUsd,
      referenceRateUsdPerKwh: rate,
      sourceUrl: ref.sourceUrl,
      isCheapest: false,
      notes: ref.notes,
    };
  });

  const withEstimates = comparisons.filter((c) => c.estimatedMonthlyUsd != null);
  if (withEstimates.length === 0) return comparisons;

  const min = Math.min(...withEstimates.map((c) => c.estimatedMonthlyUsd as number));
  return comparisons.map((c) => ({
    ...c,
    isCheapest: c.estimatedMonthlyUsd != null && c.estimatedMonthlyUsd === min,
  }));
}

export function getTariffReference(id: JurisdictionId): TariffReference {
  const ref = TARIFF_REFERENCES.find((t) => t.id === id);
  if (!ref) throw new Error(`Unknown jurisdiction: ${id}`);
  return ref;
}

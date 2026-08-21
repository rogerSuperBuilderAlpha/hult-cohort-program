import type { JurisdictionId } from '@/lib/energy/tariffs';

export type AreaUnit = 'sqm' | 'sqft';

export type LocalCurrencyInfo = {
  code: string;
  symbol: string;
  name: string;
  /** Local currency units per 1 USD — illustrative planning rate */
  usdToLocalRate: number;
};

/** Illustrative FX for calculator display — verify at payment time. */
export const JURISDICTION_CURRENCY: Record<JurisdictionId, LocalCurrencyInfo> = {
  trinidad_tobago: {
    code: 'TTD',
    symbol: 'TT$',
    name: 'Trinidad & Tobago dollar',
    usdToLocalRate: 6.78,
  },
  barbados: {
    code: 'BBD',
    symbol: 'Bds$',
    name: 'Barbados dollar',
    usdToLocalRate: 2.0,
  },
  jamaica: {
    code: 'JMD',
    symbol: 'J$',
    name: 'Jamaican dollar',
    usdToLocalRate: 155,
  },
  saint_kitts: {
    code: 'XCD',
    symbol: 'EC$',
    name: 'Eastern Caribbean dollar',
    usdToLocalRate: 2.7,
  },
  guyana: {
    code: 'GYD',
    symbol: 'GY$',
    name: 'Guyana dollar',
    usdToLocalRate: 209,
  },
};

const SQFT_PER_SQM = 10.7639;

export function getCurrencyInfo(jurisdiction: JurisdictionId): LocalCurrencyInfo {
  return JURISDICTION_CURRENCY[jurisdiction];
}

export function localToUsd(amountLocal: number, jurisdiction: JurisdictionId): number {
  const rate = JURISDICTION_CURRENCY[jurisdiction].usdToLocalRate;
  if (rate <= 0) return amountLocal;
  return amountLocal / rate;
}

export function usdToLocal(amountUsd: number, jurisdiction: JurisdictionId): number {
  return amountUsd * JURISDICTION_CURRENCY[jurisdiction].usdToLocalRate;
}

export function formatLocalCurrency(
  amountLocal: number,
  jurisdiction: JurisdictionId,
  options?: { decimals?: number }
): string {
  const { symbol, code } = JURISDICTION_CURRENCY[jurisdiction];
  const decimals = options?.decimals ?? (amountLocal >= 1000 ? 0 : 2);
  const formatted = amountLocal.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol}${formatted} ${code}`;
}

export function formatUsd(amountUsd: number): string {
  return `$${amountUsd.toLocaleString(undefined, {
    minimumFractionDigits: amountUsd >= 100 ? 0 : 2,
    maximumFractionDigits: amountUsd >= 100 ? 0 : 2,
  })} USD`;
}

export function areaToSqm(value: number, unit: AreaUnit): number {
  if (unit === 'sqft') return value * (1 / SQFT_PER_SQM);
  return value;
}

export function sqmToDisplay(valueSqm: number, unit: AreaUnit): number {
  if (unit === 'sqft') return Math.round(valueSqm * SQFT_PER_SQM * 10) / 10;
  return Math.round(valueSqm * 10) / 10;
}

export function areaUnitLabel(unit: AreaUnit): string {
  return unit === 'sqft' ? 'ft²' : 'm²';
}

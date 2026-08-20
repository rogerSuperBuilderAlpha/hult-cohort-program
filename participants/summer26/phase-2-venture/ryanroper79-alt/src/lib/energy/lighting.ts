export type BulbType = 'incandescent_60w' | 'halogen_50w' | 'cfl_15w' | 'led_9w';

export type LightingInput = {
  bulbCount: number;
  bulbType: BulbType;
  hoursPerDay: number;
  effectiveRateUsdPerKwh: number;
};

export type LightingResult = {
  currentWattsEach: number;
  proposedWattsEach: number;
  capitalCostUsd: { min: number; max: number };
  annualKwhSaved: number;
  annualUsdSaved: number;
  paybackMonths: { min: number; max: number };
  assumptions: string[];
};

const BULB_WATTS: Record<BulbType, number> = {
  incandescent_60w: 60,
  halogen_50w: 50,
  cfl_15w: 15,
  led_9w: 9,
};

const LED_TARGET_WATTS = 9;
const LED_COST_PER_BULB = { min: 3, max: 8 };

export function estimateLightingRetrofit(input: LightingInput): LightingResult {
  const count = Math.max(0, Math.min(input.bulbCount, 10_000));
  const hours = Math.max(0, Math.min(input.hoursPerDay, 24));
  const rate = Math.max(0.01, input.effectiveRateUsdPerKwh);

  const currentWattsEach = BULB_WATTS[input.bulbType];
  const proposedWattsEach = input.bulbType === 'led_9w' ? currentWattsEach : LED_TARGET_WATTS;

  const currentKwhYear = (count * currentWattsEach * hours * 365) / 1000;
  const proposedKwhYear = (count * proposedWattsEach * hours * 365) / 1000;
  const annualKwhSaved = Math.max(0, Math.round(currentKwhYear - proposedKwhYear));
  const annualUsdSaved = Math.round(annualKwhSaved * rate);

  const capitalMin = input.bulbType === 'led_9w' ? 0 : count * LED_COST_PER_BULB.min;
  const capitalMax = input.bulbType === 'led_9w' ? 0 : count * LED_COST_PER_BULB.max;

  const paybackMin =
    annualUsdSaved > 0 && capitalMax > 0 ? Math.ceil((capitalMax / annualUsdSaved) * 12) : 0;
  const paybackMax =
    annualUsdSaved > 0 && capitalMin > 0 ? Math.ceil((capitalMin / annualUsdSaved) * 12) : 0;

  return {
    currentWattsEach,
    proposedWattsEach,
    capitalCostUsd: { min: capitalMin, max: capitalMax },
    annualKwhSaved,
    annualUsdSaved,
    paybackMonths: { min: paybackMin, max: paybackMax },
    assumptions: [
      'LED retrofit uses generic $3–$8 per bulb capital range (verify local pricing).',
      'Savings assume constant daily operating hours entered by user.',
      input.bulbType === 'led_9w'
        ? 'Existing LEDs — no retrofit capital assumed.'
        : 'Payback = capital ÷ annual savings (illustrative).',
    ],
  };
}

/** Optional camera path: user counts bulbs manually after visual survey — no computer vision. */
export function suggestBulbCountFromManualSurvey(rooms: number, avgBulbsPerRoom: number): number {
  return Math.max(0, Math.round(rooms * avgBulbsPerRoom));
}

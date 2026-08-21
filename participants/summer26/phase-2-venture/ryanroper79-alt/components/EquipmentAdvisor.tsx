'use client';

import { useState } from 'react';
import type { EquipmentType } from '@/lib/energy/equipment';
import type { EquipmentRecommendation } from '@/lib/energy/equipment';

const OPTIONS: { id: EquipmentType; label: string }[] = [
  { id: 'refrigerator', label: 'Refrigerator' },
  { id: 'washer', label: 'Washer' },
  { id: 'dryer', label: 'Dryer' },
  { id: 'pool_heater', label: 'Pool heater' },
  { id: 'ac_unit', label: 'AC unit' },
];

export function EquipmentAdvisor() {
  const [selected, setSelected] = useState<EquipmentType[]>(['ac_unit', 'refrigerator']);
  const [monthlyKwh, setMonthlyKwh] = useState('600');
  const [rate, setRate] = useState('0.25');
  const [rows, setRows] = useState<EquipmentRecommendation[]>([]);

  function toggle(id: EquipmentType) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function analyze() {
    const res = await fetch('/api/equipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        equipment: selected,
        monthlyKwh: parseFloat(monthlyKwh) || 0,
        effectiveRateUsdPerKwh: parseFloat(rate) || 0.25,
      }),
    });
    const body = await res.json();
    if (res.ok) setRows(body.recommendations);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => toggle(o.id)}
            className={`rounded-full border px-3 py-1 text-xs ${
              selected.includes(o.id) ? 'border-ceal-600 bg-ceal-600 text-white' : 'border-ceal-300'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Monthly kWh
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={monthlyKwh} onChange={(e) => setMonthlyKwh(e.target.value)} />
        </label>
        <label className="text-sm">
          Rate ($/kWh)
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={rate} onChange={(e) => setRate(e.target.value)} />
        </label>
      </div>
      <button type="button" onClick={analyze} className="rounded-lg bg-ceal-600 px-4 py-2 text-sm font-semibold text-white">
        Review equipment opportunities
      </button>
      {rows.length > 0 && (
        <ul className="space-y-3 text-sm">
          {rows.map((r) => (
            <li key={r.equipment} className="rounded-lg border p-4">
              <p className="font-semibold">{r.label}</p>
              <p className="mt-1">
                Illustrative savings: {r.annualKwhSavedRange.min}–{r.annualKwhSavedRange.max} kWh/yr ($
                {r.annualUsdSavedRange.min}–${r.annualUsdSavedRange.max})
              </p>
              <p className="mt-2 text-ceal-800/90">{r.action}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { BulbType } from '@/lib/energy/lighting';
import type { LightingResult } from '@/lib/energy/lighting';

export function LightingEstimator() {
  const [bulbCount, setBulbCount] = useState('12');
  const [bulbType, setBulbType] = useState<BulbType>('incandescent_60w');
  const [hoursPerDay, setHoursPerDay] = useState('5');
  const [rate, setRate] = useState('0.25');
  const [rooms, setRooms] = useState('4');
  const [avgBulbs, setAvgBulbs] = useState('3');
  const [result, setResult] = useState<LightingResult | null>(null);

  async function calculate() {
    const res = await fetch('/api/lighting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bulbCount: parseInt(bulbCount, 10) || 0,
        bulbType,
        hoursPerDay: parseFloat(hoursPerDay) || 0,
        effectiveRateUsdPerKwh: parseFloat(rate) || 0.25,
      }),
    });
    const body = await res.json();
    if (res.ok) setResult(body.result);
  }

  function applyRoomSurvey() {
    const count = Math.round((parseInt(rooms, 10) || 0) * (parseInt(avgBulbs, 10) || 0));
    setBulbCount(String(count));
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-ceal-800/80">
        Count bulbs by room after a visual survey (or use camera locally to assist counting — enter
        counts manually). Estimates LED retrofit capital and payback.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Rooms surveyed
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={rooms} onChange={(e) => setRooms(e.target.value)} />
        </label>
        <label className="text-sm">
          Avg bulbs per room
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={avgBulbs} onChange={(e) => setAvgBulbs(e.target.value)} />
        </label>
        <button type="button" onClick={applyRoomSurvey} className="self-end rounded-lg border px-3 py-2 text-sm">
          Apply room survey count
        </button>
        <label className="text-sm">
          Total bulb count
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={bulbCount} onChange={(e) => setBulbCount(e.target.value)} />
        </label>
        <label className="text-sm">
          Bulb type
          <select className="mt-1 w-full rounded-lg border px-3 py-2" value={bulbType} onChange={(e) => setBulbType(e.target.value as BulbType)}>
            <option value="incandescent_60w">Incandescent 60W</option>
            <option value="halogen_50w">Halogen 50W</option>
            <option value="cfl_15w">CFL 15W</option>
            <option value="led_9w">LED 9W (existing)</option>
          </select>
        </label>
        <label className="text-sm">
          Hours per day
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)} />
        </label>
        <label className="text-sm">
          Effective rate ($/kWh)
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={rate} onChange={(e) => setRate(e.target.value)} />
        </label>
      </div>
      <button type="button" onClick={calculate} className="rounded-lg bg-ceal-600 px-4 py-2 text-sm font-semibold text-white">
        Estimate retrofit
      </button>
      {result && (
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded-lg bg-ceal-50 p-3">
            <dt className="text-xs uppercase text-ceal-600">Capital cost</dt>
            <dd className="font-bold">${result.capitalCostUsd.min}–${result.capitalCostUsd.max}</dd>
          </div>
          <div className="rounded-lg bg-ceal-50 p-3">
            <dt className="text-xs uppercase text-ceal-600">Annual savings</dt>
            <dd className="font-bold">${result.annualUsdSaved} ({result.annualKwhSaved} kWh)</dd>
          </div>
          <div className="rounded-lg bg-ceal-50 p-3 sm:col-span-2">
            <dt className="text-xs uppercase text-ceal-600">Payback period</dt>
            <dd className="font-bold">
              {result.paybackMonths.min > 0
                ? `${result.paybackMonths.min}–${result.paybackMonths.max} months`
                : 'Already on LED — no retrofit assumed'}
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}

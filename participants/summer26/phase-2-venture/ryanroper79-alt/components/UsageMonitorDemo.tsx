'use client';

import { useState } from 'react';
import { DEFAULT_MONITOR_DEVICES, simulateUsageMonitor, type MonitorDevice } from '@/lib/energy/monitor';

export function UsageMonitorDemo() {
  const [devices, setDevices] = useState<MonitorDevice[]>(DEFAULT_MONITOR_DEVICES);
  const [hours, setHours] = useState('8');
  const [rate, setRate] = useState('0.25');
  const [target, setTarget] = useState('200');
  const [plan, setPlan] = useState<ReturnType<typeof simulateUsageMonitor> | null>(null);

  function toggleDevice(id: string) {
    setDevices((ds) => ds.map((d) => (d.id === id ? { ...d, on: !d.on } : d)));
  }

  function runSimulation() {
    setPlan(
      simulateUsageMonitor(
        devices,
        parseFloat(hours) || 0,
        parseFloat(rate) || 0.25,
        parseFloat(target) || 0
      )
    );
  }

  function autoOptimize() {
    const rateNum = parseFloat(rate) || 0.25;
    const hoursNum = parseFloat(hours) || 8;
    const targetNum = parseFloat(target) || 200;
    let adjusted = [...devices];
    let sim = simulateUsageMonitor(adjusted, hoursNum, rateNum, targetNum);
    let guard = 0;
    while (!sim.withinTarget && guard < 10) {
      const candidate = adjusted
        .filter((d) => d.on && !d.essential)
        .sort((a, b) => b.watts - a.watts)[0];
      if (!candidate) break;
      adjusted = adjusted.map((d) => (d.id === candidate.id ? { ...d, on: false } : d));
      sim = simulateUsageMonitor(adjusted, hoursNum, rateNum, targetNum);
      guard += 1;
    }
    setDevices(adjusted);
    setPlan(sim);
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-ceal-800/80">
        Simulated home monitor — toggle loads to match a target monthly bill. Production IoT
        integrations are roadmap items; this demo does not control real equipment.
      </p>
      <ul className="space-y-2 text-sm">
        {devices.map((d) => (
          <li key={d.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
            <span>
              {d.label} ({d.watts} W) {d.essential ? '· essential' : ''}
            </span>
            <button
              type="button"
              onClick={() => toggleDevice(d.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                d.on ? 'bg-ceal-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {d.on ? 'On' : 'Off'}
            </button>
          </li>
        ))}
      </ul>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm">
          Active hours / day
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={hours} onChange={(e) => setHours(e.target.value)} />
        </label>
        <label className="text-sm">
          Rate ($/kWh)
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={rate} onChange={(e) => setRate(e.target.value)} />
        </label>
        <label className="text-sm">
          Target monthly bill ($)
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={target} onChange={(e) => setTarget(e.target.value)} />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={runSimulation} className="rounded-lg bg-ceal-600 px-4 py-2 text-sm font-semibold text-white">
          Simulate
        </button>
        <button type="button" onClick={autoOptimize} className="rounded-lg border border-ceal-600 px-4 py-2 text-sm font-semibold text-ceal-800">
          Auto-optimize to target
        </button>
      </div>
      {plan && (
        <div className="rounded-lg bg-ceal-50 p-4 text-sm">
          <p>
            Estimated: <strong>${plan.estimatedMonthlyUsd}/mo</strong> ({plan.estimatedMonthlyKwh} kWh) · Target: $
            {plan.targetMonthlyUsd}
          </p>
          <p className="mt-2 font-medium">{plan.withinTarget ? 'Within target' : 'Above target'}</p>
          <ul className="mt-2 list-disc pl-5">
            {plan.suggestedChanges.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

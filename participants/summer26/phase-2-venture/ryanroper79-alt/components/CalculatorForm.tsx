'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { CalculatorResult, MajorLoad, EfficiencyMeasure, PropertyType } from '@/lib/energy/calculator';
import type { JurisdictionId } from '@/lib/energy/tariffs';
import {
  areaToSqm,
  formatLocalCurrency,
  formatUsd,
  getCurrencyInfo,
  localToUsd,
  usdToLocal,
  type AreaUnit,
} from '@/lib/energy/currency';
import { CEAL_GREEN_BOOKING_URL } from '@/lib/energy/interventions';

const JURISDICTIONS: { id: JurisdictionId; label: string }[] = [
  { id: 'trinidad_tobago', label: 'Trinidad & Tobago' },
  { id: 'barbados', label: 'Barbados' },
  { id: 'jamaica', label: 'Jamaica' },
  { id: 'saint_kitts', label: 'St Kitts & Nevis' },
  { id: 'guyana', label: 'Guyana' },
];

const LOADS: { id: MajorLoad; label: string }[] = [
  { id: 'air_conditioning', label: 'Air conditioning' },
  { id: 'refrigeration', label: 'Refrigeration' },
  { id: 'lighting', label: 'Lighting' },
  { id: 'motors_pumps', label: 'Motors / pumps' },
  { id: 'water_heating', label: 'Water heating' },
  { id: 'it_servers', label: 'IT / servers' },
  { id: 'pool_equipment', label: 'Pool equipment' },
];

const MEASURES: { id: EfficiencyMeasure; label: string }[] = [
  { id: 'led_lighting', label: 'LED lighting' },
  { id: 'efficient_ac', label: 'Efficient AC' },
  { id: 'solar_pv', label: 'Solar PV' },
  { id: 'building_controls', label: 'Building controls' },
  { id: 'power_factor_correction', label: 'Power factor correction' },
];

export function CalculatorForm({
  eventMode = false,
  initialJurisdiction,
  initialKwh,
  initialSpend,
  initialEmail,
  initialCompanyName,
}: {
  eventMode?: boolean;
  initialJurisdiction?: JurisdictionId;
  initialKwh?: string;
  initialSpend?: string;
  initialEmail?: string;
  initialCompanyName?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [billText, setBillText] = useState('');

  const [billHints, setBillHints] = useState<string[]>([]);
  const [sheetSaved, setSheetSaved] = useState<boolean | null>(null);

  const [form, setForm] = useState({
    jurisdiction: (initialJurisdiction ?? 'trinidad_tobago') as JurisdictionId,
    propertyType: 'commercial' as PropertyType,
    monthlyExpenditureLocal: initialSpend ?? '420',
    monthlyKwh: initialKwh ?? '',
    floorArea: '',
    floorAreaUnit: 'sqm' as AreaUnit,
    weeklyOperatingHours: '60',
    majorLoads: ['air_conditioning', 'refrigeration'] as MajorLoad[],
    efficiencyMeasures: [] as EfficiencyMeasure[],
    companyName: initialCompanyName ?? '',
    address: '',
    email: initialEmail ?? '',
    phone: '',
  });

  const currency = useMemo(() => getCurrencyInfo(form.jurisdiction), [form.jurisdiction]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSheetSaved(null);

    if (eventMode && (!form.companyName.trim() || !form.email.trim())) {
      setError('Please enter your company/name and email — required for tonight\'s session spreadsheet.');
      setLoading(false);
      return;
    }

    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'calculator_started' }),
      });

      const monthlyExpenditureLocal = parseFloat(form.monthlyExpenditureLocal) || 0;
      const floorAreaSqm = form.floorArea
        ? areaToSqm(parseFloat(form.floorArea) || 0, form.floorAreaUnit)
        : null;

      const res = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jurisdiction: form.jurisdiction,
          propertyType: form.propertyType,
          monthlyExpenditureUsd: localToUsd(monthlyExpenditureLocal, form.jurisdiction),
          monthlyExpenditureLocal,
          monthlyKwh: form.monthlyKwh ? parseFloat(form.monthlyKwh) : null,
          floorAreaSqm,
          weeklyOperatingHours: parseFloat(form.weeklyOperatingHours) || 0,
          majorLoads: form.majorLoads,
          efficiencyMeasures: form.efficiencyMeasures,
          contact: {
            companyName: form.companyName || null,
            address: form.address || null,
            email: form.email || null,
            phone: form.phone || null,
          },
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Calculation failed');
      setResult(body.result);
      setSheetSaved(body.sheetSaved ?? false);
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'calculator_completed' }),
      });
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'results_viewed' }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function toggleLoad(id: MajorLoad) {
    setForm((f) => ({
      ...f,
      majorLoads: f.majorLoads.includes(id)
        ? f.majorLoads.filter((x) => x !== id)
        : [...f.majorLoads, id],
    }));
  }

  function toggleMeasure(id: EfficiencyMeasure) {
    setForm((f) => ({
      ...f,
      efficiencyMeasures: f.efficiencyMeasures.includes(id)
        ? f.efficiencyMeasures.filter((x) => x !== id)
        : [...f.efficiencyMeasures, id],
    }));
  }

  async function parseBill() {
    const res = await fetch('/api/calculator/parse-bill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: billText, jurisdiction: form.jurisdiction }),
    });
    const body = await res.json();
    setBillHints(body.hints ?? []);
    const kwhValue = body.monthlyKwh ?? body.kwh;
    const amountValue = body.monthlyAmountLocal ?? body.amountLocal;
    if (kwhValue) setForm((f) => ({ ...f, monthlyKwh: String(Math.round(kwhValue)) }));
    if (amountValue) setForm((f) => ({ ...f, monthlyExpenditureLocal: String(Math.round(amountValue * 100) / 100) }));
  }

  function formatRangeLocal(min: number, max: number, jurisdiction: JurisdictionId) {
    return `${formatLocalCurrency(min, jurisdiction, { decimals: 0 })}–${formatLocalCurrency(max, jurisdiction, { decimals: 0 })}`;
  }

  return (
    <div className="mt-6 space-y-8">
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        {eventMode && (
          <p className="sm:col-span-2 rounded-lg border-2 border-ceal-600 bg-ceal-600/10 p-4 text-sm text-ceal-950">
            <strong>Live CEAL Green session</strong> — enter your utility bill, tap Calculate, and your
            results are saved to the group spreadsheet. Then book your engineer consult with{' '}
            <strong>Book Now</strong> below.
          </p>
        )}
        <p className="sm:col-span-2 rounded-lg border border-ceal-200 bg-ceal-50/60 p-3 text-sm text-ceal-900">
          This calculator establishes an energy baseline, explains key readings, and estimates savings and payback
          for efficiency measures <strong>before</strong> renewable investment — following the efficiency-first
          sequence recommended for Caribbean facilities.
        </p>
        <label className="text-sm">
          Country / region
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.jurisdiction}
            onChange={(e) => setForm({ ...form, jurisdiction: e.target.value as JurisdictionId })}
          >
            {JURISDICTIONS.map((j) => (
              <option key={j.id} value={j.id}>
                {j.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Property type
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.propertyType}
            onChange={(e) => setForm({ ...form, propertyType: e.target.value as PropertyType })}
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="institutional">Institutional</option>
          </select>
        </label>
        <label className="text-sm">
          Monthly electricity spend ({currency.code})
          <input
            type="number"
            min="0"
            step="0.01"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.monthlyExpenditureLocal}
            onChange={(e) => setForm({ ...form, monthlyExpenditureLocal: e.target.value })}
            required
          />
          <span className="mt-1 block text-xs text-ceal-700">
            Enter your bill in {currency.name} ({currency.symbol}). Approx.{' '}
            {formatUsd(localToUsd(parseFloat(form.monthlyExpenditureLocal) || 0, form.jurisdiction))}.
          </span>
        </label>
        <label className="text-sm">
          Monthly kWh (if known)
          <input
            type="number"
            min="0"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.monthlyKwh}
            onChange={(e) => setForm({ ...form, monthlyKwh: e.target.value })}
          />
        </label>
        <div className="text-sm">
          <span className="font-medium">Floor area</span>
          <div className="mt-1 flex gap-2">
            <input
              type="number"
              min="0"
              step="0.1"
              className="min-w-0 flex-1 rounded-lg border px-3 py-2"
              value={form.floorArea}
              onChange={(e) => setForm({ ...form, floorArea: e.target.value })}
              placeholder={`e.g. 500`}
            />
            <select
              className="rounded-lg border px-3 py-2"
              value={form.floorAreaUnit}
              onChange={(e) =>
                setForm({ ...form, floorAreaUnit: e.target.value as AreaUnit })
              }
              aria-label="Floor area unit"
            >
              <option value="sqm">m²</option>
              <option value="sqft">ft²</option>
            </select>
          </div>
          {form.floorArea && (
            <span className="mt-1 block text-xs text-ceal-700">
              ≈{' '}
              {form.floorAreaUnit === 'sqft'
                ? `${areaToSqm(parseFloat(form.floorArea) || 0, 'sqft').toFixed(0)} m²`
                : `${((parseFloat(form.floorArea) || 0) * 10.7639).toFixed(0)} ft²`}{' '}
              equivalent
            </span>
          )}
        </div>
        <label className="text-sm">
          Weekly operating hours
          <input
            type="number"
            min="0"
            max="168"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.weeklyOperatingHours}
            onChange={(e) => setForm({ ...form, weeklyOperatingHours: e.target.value })}
          />
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium">Major electrical loads</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {LOADS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => toggleLoad(l.id)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  form.majorLoads.includes(l.id) ? 'border-ceal-600 bg-ceal-600 text-white' : 'border-ceal-300'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium">Existing efficiency measures</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {MEASURES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMeasure(m.id)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  form.efficiencyMeasures.includes(m.id)
                    ? 'border-ceal-600 bg-ceal-600 text-white'
                    : 'border-ceal-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="sm:col-span-2 rounded-xl border border-ceal-200 bg-ceal-50/40 p-4">
          <legend className="px-1 text-sm font-medium text-ceal-900">
            {eventMode ? (
              <>
                Your details <span className="font-normal text-red-700">(required tonight)</span>
              </>
            ) : (
              <>
                Contact details <span className="font-normal text-ceal-700">(optional)</span>
              </>
            )}
          </legend>
          <p className="mt-1 text-xs text-ceal-800/80">
            {eventMode
              ? 'Name/company and email are saved with your bill data to the session Google Sheet.'
              : 'Help us follow up on audit readiness and Caribbean tariff insights. Leave blank if you prefer not to share.'}
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              Company / your name
              <input
                type="text"
                autoComplete="organization"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="e.g. Island Resort Ltd"
                required={eventMode}
              />
            </label>
            <label className="text-sm sm:col-span-2">
              Address
              <input
                type="text"
                autoComplete="street-address"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street, city, country"
              />
            </label>
            <label className="text-sm">
              Email address
              <input
                type="email"
                autoComplete="email"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contact@company.com"
                required={eventMode}
              />
            </label>
            <label className="text-sm">
              Phone number
              <input
                type="tel"
                autoComplete="tel"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 246 555 0100"
              />
            </label>
          </div>
        </fieldset>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-ceal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-ceal-700 disabled:opacity-50"
          >
            {loading ? 'Calculating…' : 'Calculate'}
          </button>
        </div>
      </form>

      <section className="rounded-xl border bg-slate-50 p-4 text-sm">
        <h3 className="font-semibold">Bill helper — T&TEC, JPS, BL&P &amp; more</h3>
        <p className="mt-1 text-slate-700">
          Paste bill text (e.g. T&TEC Commercial B: units consumed, billing days, amount due). We extract
          kWh and {currency.code} locally — then confirm values above. Bill images stay on your device.
        </p>
        <textarea
          className="mt-3 w-full rounded-lg border px-3 py-2 font-mono text-xs"
          rows={4}
          placeholder={`Example T&TEC paste:
1627.00 units at a Rate of $0.4150 per unit
Billing Period 62 Days
Please Pay This Amount 868.76`}
          value={billText}
          onChange={(e) => setBillText(e.target.value)}
        />
        {billHints.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-ceal-800">
            {billHints.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={parseBill}
            className="rounded-lg border border-ceal-500 px-3 py-1 text-xs font-medium text-ceal-800"
          >
            Extract from pasted text
          </button>
          <label className="cursor-pointer rounded-lg border border-ceal-500 px-3 py-1 text-xs font-medium text-ceal-800">
            Capture bill photo (local preview only)
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={() => {
                /* User reads values manually from preview — no OCR/ upload */
                alert('Review the photo on your device and enter kWh/spend manually. Images are not sent to the server.');
              }}
            />
          </label>
        </div>
      </section>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-900">{error}</p>}

      {result && (
        <section className="space-y-6 rounded-2xl border border-ceal-500/30 bg-white p-6">
          <h3 className="text-lg font-bold text-ceal-900">Results</h3>

          {sheetSaved === true && (
            <p className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-900">
              Saved to the session spreadsheet — thank you! Your next step: book a CEAL engineer below.
            </p>
          )}
          {sheetSaved === false && eventMode && (
            <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
              Results calculated, but the spreadsheet webhook is not configured yet. Ask the presenter to
              enable CRM_WEBHOOK_URL — your data is still shown below.
            </p>
          )}

          <div className="rounded-xl border-2 border-ceal-600 bg-ceal-600 p-5 text-white shadow-lg">
            <h4 className="text-lg font-bold">Your next step — Book Now</h4>
            <p className="mt-2 text-sm text-ceal-50">
              CEAL Green engineers will confirm install costs, prioritize AC / refrigeration / sensors within
              your budget, and target at least 25% off your monthly bill.
            </p>
            <a
              href={CEAL_GREEN_BOOKING_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-bold text-ceal-800 hover:bg-ceal-50"
            >
              Book Now at cealgreen.com →
            </a>
          </div>

          <div className="rounded-xl border-2 border-ceal-600 bg-gradient-to-br from-ceal-50 to-white p-5">
            <h4 className="text-base font-bold text-ceal-900">
              Target: at least {result.reductionTarget.targetPct}% lower monthly bill
            </h4>
            <p className="mt-2 text-sm text-ceal-800">
              From{' '}
              <strong>
                {formatLocalCurrency(result.reductionTarget.currentMonthlyBillLocal, form.jurisdiction)}/mo
              </strong>{' '}
              toward{' '}
              <strong>
                {formatLocalCurrency(result.reductionTarget.targetMonthlyBillLocal, form.jurisdiction)}/mo
              </strong>{' '}
              — saving roughly{' '}
              <strong>
                {formatLocalCurrency(result.reductionTarget.monthlySavingsLocal, form.jurisdiction)}/mo
              </strong>{' '}
              ({formatLocalCurrency(result.reductionTarget.annualSavingsLocal, form.jurisdiction)}/yr).
            </p>
            <a
              href={CEAL_GREEN_BOOKING_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-lg bg-ceal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ceal-700"
            >
              Book CEAL Green engineers for firm quotes →
            </a>
            <p className="mt-2 text-xs text-ceal-700">
              CEAL prioritizes AC, refrigeration, and sensor installs within your budget over months — with
              measured savings, not guesswork.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-ceal-900">Where your savings come from</h4>
            <p className="mt-1 text-xs text-ceal-700">
              Illustrative monthly value if you implement these measures — CEAL confirms costs on site.
            </p>
            <div className="mt-3 grid gap-4 lg:grid-cols-3">
              {result.priorityInterventions.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-ceal-200 bg-ceal-50/50 p-4 text-sm shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-ceal-600">
                    ~{item.billSharePct}% of typical bill
                  </p>
                  <h5 className="mt-1 font-bold text-ceal-900">{item.title}</h5>
                  <p className="mt-1 text-xs font-medium text-ceal-700">{item.headline}</p>
                  <p className="mt-2 text-ceal-800">{item.description}</p>
                  <dl className="mt-3 space-y-2 border-t border-ceal-200 pt-3">
                    <div>
                      <dt className="text-xs uppercase text-ceal-600">Est. monthly savings</dt>
                      <dd className="text-lg font-bold text-ceal-900">
                        {formatRangeLocal(
                          item.estimatedMonthlySavingsLocal.min,
                          item.estimatedMonthlySavingsLocal.max,
                          form.jurisdiction
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-ceal-600">Est. install cost</dt>
                      <dd className="font-medium">
                        {formatRangeLocal(
                          item.estimatedInstallCostLocal.min,
                          item.estimatedInstallCostLocal.max,
                          form.jurisdiction
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-ceal-600">Simple payback</dt>
                      <dd className="font-medium">
                        {item.paybackMonths.min === item.paybackMonths.max
                          ? `${item.paybackMonths.min} mo`
                          : `${item.paybackMonths.min}–${item.paybackMonths.max} mo`}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 text-sm">
            <h4 className="font-semibold text-indigo-950">Phased install roadmap (with CEAL)</h4>
            <ol className="mt-3 space-y-3">
              {result.reductionTarget.phasedSteps.map((step) => (
                <li key={step.phase} className="rounded-lg border border-indigo-100 bg-white p-3">
                  <p className="font-semibold text-indigo-950">
                    Phase {step.phase}: {step.months} — {step.focus}
                  </p>
                  <p className="text-xs text-indigo-700">
                    Cumulative target: ~{step.cumulativeReductionPct}% bill reduction
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-indigo-900/90">
                    {step.measures.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-indigo-800">{result.reductionTarget.cealGreenNote}</p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-ceal-50 p-3">
              <dt className="text-xs uppercase text-ceal-600">Monthly kWh</dt>
              <dd className="text-2xl font-bold">{result.monthlyKwh.toLocaleString()}</dd>
            </div>
            <div className="rounded-lg bg-ceal-50 p-3">
              <dt className="text-xs uppercase text-ceal-600">Annual kWh</dt>
              <dd className="text-2xl font-bold">{result.annualKwh.toLocaleString()}</dd>
            </div>
            <div className="rounded-lg bg-ceal-50 p-3">
              <dt className="text-xs uppercase text-ceal-600">Annual spend</dt>
              <dd className="text-xl font-bold">
                {formatLocalCurrency(result.currency.annualExpenditureLocal, form.jurisdiction)}
              </dd>
              <dd className="text-xs text-ceal-700">
                {formatUsd(result.annualExpenditureUsd)}
              </dd>
            </div>
            <div className="rounded-lg bg-ceal-50 p-3">
              <dt className="text-xs uppercase text-ceal-600">Audit readiness</dt>
              <dd className="text-2xl font-bold">{result.auditReadinessScore}/100</dd>
            </div>
          </dl>

          {result.energyUseIntensityKwhPerSqmYear != null && (
            <p className="text-sm">
              Energy use intensity:{' '}
              <strong>{result.energyUseIntensityKwhPerSqmYear} kWh/m²/year</strong>
            </p>
          )}

          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 text-sm">
            <h4 className="font-semibold text-indigo-950">Why an energy audit matters for your business</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-indigo-950/90">
              {result.auditBusinessCase.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border bg-white p-4 text-sm shadow-sm">
            <h4 className="font-semibold text-ceal-900">
              Suggested audit path: {result.suggestedAuditLevel.name}
            </h4>
            <p className="mt-2 text-ceal-800">{result.suggestedAuditLevel.summary}</p>
            <p className="mt-2 text-xs text-ceal-700">
              <strong>When to use:</strong> {result.suggestedAuditLevel.whenRecommended}
            </p>
            <h5 className="mt-3 font-medium text-ceal-900">Audit deliverables (specification)</h5>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-ceal-800">
              {result.suggestedAuditLevel.deliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold">Specifications &amp; how to read your results</h4>
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-ceal-50 text-left">
                    <th className="py-2 pr-3 font-medium">Reading</th>
                    <th className="py-2 pr-3 font-medium">Your value</th>
                    <th className="py-2 pr-3 font-medium">Specification</th>
                    <th className="py-2 pr-3 font-medium">How to interpret</th>
                    <th className="py-2 font-medium">Business use</th>
                  </tr>
                </thead>
                <tbody>
                  {result.readingGuide.map((row) => (
                    <tr key={row.id} className="border-b align-top">
                      <td className="py-2 pr-3 font-medium">{row.label}</td>
                      <td className="py-2 pr-3 whitespace-nowrap">{row.value}</td>
                      <td className="py-2 pr-3 text-ceal-800">{row.specification}</td>
                      <td className="py-2 pr-3 text-ceal-800">{row.howToRead}</td>
                      <td className="py-2 text-ceal-800">{row.businessRelevance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">End-use breakdown (illustrative)</h4>
            <p className="mt-1 text-xs text-ceal-700">
              Based on selected major loads — a Level 2 audit validates this split with metering.
            </p>
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4">End use</th>
                    <th className="py-2 pr-4">Share</th>
                    <th className="py-2 pr-4">Est. annual kWh</th>
                    <th className="py-2">Typical systems</th>
                  </tr>
                </thead>
                <tbody>
                  {result.endUseBreakdown.map((row) => (
                    <tr key={row.category} className="border-b">
                      <td className="py-2 pr-4 font-medium">{row.category}</td>
                      <td className="py-2 pr-4">{row.sharePct}%</td>
                      <td className="py-2 pr-4">{row.estimatedAnnualKwh.toLocaleString()}</td>
                      <td className="py-2 text-ceal-800">{row.systems}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">Proposed energy conservation measures (ECMs)</h4>
            <p className="mt-1 text-xs text-ceal-700">
              Estimated savings, implementation cost bands, and simple payback if measures are implemented.
              Efficiency measures should precede renewable capex.
            </p>
            <div className="mt-3 space-y-3">
              {result.conservationMeasures.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-lg border p-4 text-sm ${
                    m.phase === 'renewable-later' ? 'border-amber-200 bg-amber-50/50' : 'bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{m.title}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        m.phase === 'efficiency-first'
                          ? 'bg-ceal-100 text-ceal-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {m.phase === 'efficiency-first' ? 'Efficiency first' : 'After audit — renewables'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize">
                      {m.priority} priority
                    </span>
                  </div>
                  <p className="mt-2 text-ceal-800">{m.description}</p>
                  <dl className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs uppercase text-ceal-600">Est. annual savings</dt>
                      <dd className="font-medium">
                        {formatRangeLocal(
                          usdToLocal(m.estimatedAnnualUsdSaved.min, form.jurisdiction),
                          usdToLocal(m.estimatedAnnualUsdSaved.max, form.jurisdiction),
                          form.jurisdiction
                        )}
                        <span className="block text-xs font-normal text-ceal-700">
                          ({formatUsd(m.estimatedAnnualUsdSaved.min)}–{formatUsd(m.estimatedAnnualUsdSaved.max)})
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-ceal-600">Est. cost</dt>
                      <dd className="font-medium">
                        {formatRangeLocal(
                          usdToLocal(m.estimatedCostUsd.min, form.jurisdiction),
                          usdToLocal(m.estimatedCostUsd.max, form.jurisdiction),
                          form.jurisdiction
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-ceal-600">Simple payback</dt>
                      <dd className="font-medium">
                        {m.paybackMonths.min === m.paybackMonths.max
                          ? `${m.paybackMonths.min} mo`
                          : `${m.paybackMonths.min}–${m.paybackMonths.max} mo`}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-600">{result.auditLiteratureNote}</p>
          </div>

          <div>
            <h4 className="font-semibold">Portfolio savings scenarios (annual)</h4>
            <ul className="mt-2 space-y-2 text-sm">
              {result.savingsScenarios.map((s) => (
                <li key={s.label} className="rounded-lg border p-3">
                  <span className="font-medium capitalize">{s.label}</span> — {s.description}:{' '}
                  {s.annualKwhSaved.min.toLocaleString()}–{s.annualKwhSaved.max.toLocaleString()} kWh/yr (
                  {formatRangeLocal(
                    usdToLocal(s.annualUsdSaved.min, form.jurisdiction),
                    usdToLocal(s.annualUsdSaved.max, form.jurisdiction),
                    form.jurisdiction
                  )}
                  /yr)
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold">Jurisdiction comparison (same kWh profile)</h4>
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4">Jurisdiction</th>
                    <th className="py-2 pr-4">Est. monthly</th>
                    <th className="py-2 pr-4">Ref. rate</th>
                    <th className="py-2">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {result.jurisdictionComparison.map((row) => (
                    <tr key={row.jurisdiction} className={row.isCheapest ? 'bg-ceal-50 font-medium' : ''}>
                      <td className="py-2 pr-4">
                        {row.label}
                        {row.isCheapest && row.estimatedMonthlyUsd != null ? ' · lowest' : ''}
                      </td>
                      <td className="py-2 pr-4">
                        {row.estimatedMonthlyUsd != null
                          ? `${formatLocalCurrency(
                              usdToLocal(row.estimatedMonthlyUsd, form.jurisdiction),
                              form.jurisdiction
                            )} (~$${row.estimatedMonthlyUsd.toFixed(0)})`
                          : 'Enter rate at source'}
                      </td>
                      <td className="py-2 pr-4">
                        {row.referenceRateUsdPerKwh != null
                          ? `$${row.referenceRateUsdPerKwh.toFixed(3)}/kWh`
                          : '—'}
                      </td>
                      <td className="py-2">
                        <a href={row.sourceUrl} className="underline" target="_blank" rel="noreferrer">
                          Verify tariff
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">Recommended actions</h4>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm">
              {result.recommendedActions.map((a) => (
                <li key={a.title}>
                  <strong>{a.title}</strong> — {a.detail}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 text-sm">
            <p className="font-semibold text-indigo-900">
              Professional audit: {result.pursueProfessionalAudit ? 'Recommended' : 'Optional for now'}
            </p>
            <p className="mt-1 text-indigo-900/90">{result.auditRationale}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <AuditRequestButton />
              <a
                href={CEAL_GREEN_BOOKING_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-indigo-700 px-4 py-2 text-xs font-semibold text-indigo-900 hover:bg-indigo-100"
              >
                www.cealgreen.com — engineered install plan
              </a>
            </div>
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer font-medium">Assumptions</summary>
            <ul className="mt-2 list-disc pl-5">
              {result.assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </details>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/lighting" className="underline text-ceal-700">
              Lighting retrofit estimator →
            </Link>
            <Link href="/equipment" className="underline text-ceal-700">
              Equipment recommendations →
            </Link>
            <Link href="/monitor" className="underline text-ceal-700">
              Usage monitor (simulated) →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function AuditRequestButton() {
  const [sent, setSent] = useState(false);
  async function requestAudit() {
    await fetch('/api/audit-request', { method: 'POST' });
    setSent(true);
  }
  return (
    <button
      type="button"
      onClick={requestAudit}
      disabled={sent}
      className="mt-3 rounded-lg bg-indigo-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
    >
      {sent ? 'Request recorded' : 'Request audit information'}
    </button>
  );
}

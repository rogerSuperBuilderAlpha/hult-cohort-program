'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { JurisdictionId } from '@/lib/energy/tariffs';
import { getCurrencyInfo } from '@/lib/energy/currency';

const JURISDICTIONS: { id: JurisdictionId; label: string }[] = [
  { id: 'trinidad_tobago', label: 'Trinidad & Tobago' },
  { id: 'barbados', label: 'Barbados' },
  { id: 'jamaica', label: 'Jamaica' },
  { id: 'saint_kitts', label: 'St Kitts & Nevis' },
  { id: 'guyana', label: 'Guyana' },
];

export type ExtractedBill = {
  monthlyKwh: string;
  monthlyExpenditureLocal: string;
  hints: string[];
};

export function BillUploadPanel({
  calculatorHref = '/calculator',
  defaultJurisdiction = 'trinidad_tobago' as JurisdictionId,
}: {
  calculatorHref?: string;
  defaultJurisdiction?: JurisdictionId;
}) {
  const [jurisdiction, setJurisdiction] = useState<JurisdictionId>(defaultJurisdiction);
  const [billText, setBillText] = useState('');
  const [hints, setHints] = useState<string[]>([]);
  const [extracted, setExtracted] = useState<ExtractedBill | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currency = getCurrencyInfo(jurisdiction);

  async function parseBill() {
    setLoading(true);
    try {
      const res = await fetch('/api/calculator/parse-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: billText, jurisdiction }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Parse failed');
      setHints(body.hints ?? []);
      const kwh = body.monthlyKwh ?? body.kwh;
      const amount = body.monthlyAmountLocal ?? body.amountLocal;
      if (kwh || amount) {
        setExtracted({
          monthlyKwh: kwh ? String(Math.round(kwh)) : '',
          monthlyExpenditureLocal: amount ? String(Math.round(amount * 100) / 100) : '',
          hints: body.hints ?? [],
        });
      }
    } catch (err) {
      setHints([err instanceof Error ? err.message : 'Could not parse bill']);
    } finally {
      setLoading(false);
    }
  }

  function onPhotoSelected(file: File | null) {
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setHints([
      'Photo saved on your device only — read kWh and amount due from the image, paste text below, or enter values in the calculator.',
    ]);
  }

  const calculatorQuery = extracted
    ? `?kwh=${encodeURIComponent(extracted.monthlyKwh)}&spend=${encodeURIComponent(extracted.monthlyExpenditureLocal)}&jurisdiction=${jurisdiction}`
    : `?jurisdiction=${jurisdiction}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Utility / country
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value as JurisdictionId)}
          >
            {JURISDICTIONS.map((j) => (
              <option key={j.id} value={j.id}>
                {j.label}
              </option>
            ))}
          </select>
        </label>
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
          <p className="font-semibold">Supported formats</p>
          <p className="mt-1 text-emerald-800/90">
            T&amp;TEC, JPS, BL&amp;P, SKELEC — paste bill text or photograph your invoice. Images are
            not uploaded to our servers.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-slate-900">Paste bill text</h3>
          <p className="mt-1 text-sm text-slate-600">
            Copy lines from your PDF or email bill — we extract kWh and {currency.code} locally.
          </p>
          <textarea
            className="mt-3 w-full rounded-lg border px-3 py-2 font-mono text-xs"
            rows={6}
            placeholder={`Example T&TEC:
1627.00 units at a Rate of $0.4150 per unit
Billing Period 62 Days
Please Pay This Amount 868.76`}
            value={billText}
            onChange={(e) => setBillText(e.target.value)}
          />
          <button
            type="button"
            onClick={parseBill}
            disabled={loading || !billText.trim()}
            className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Extracting…' : 'Extract bill data'}
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-slate-900">Scan or upload photo</h3>
          <p className="mt-1 text-sm text-slate-600">
            Use your camera to capture the bill. Review the image, then paste key figures or continue
            to the calculator.
          </p>
          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 px-6 py-10 hover:bg-emerald-50">
            <span className="text-3xl" aria-hidden>
              📷
            </span>
            <span className="mt-2 text-sm font-semibold text-emerald-800">Tap to capture or upload</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => onPhotoSelected(e.target.files?.[0] ?? null)}
            />
          </label>
          {previewUrl && (
            <div className="mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Your bill preview — stored locally in your browser"
                className="max-h-48 w-full rounded-lg border object-contain"
              />
            </div>
          )}
        </section>
      </div>

      {hints.length > 0 && (
        <ul className="list-disc space-y-1 rounded-lg bg-slate-50 p-4 pl-8 text-sm text-slate-700">
          {hints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}

      {extracted && (extracted.monthlyKwh || extracted.monthlyExpenditureLocal) && (
        <section className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50 p-5">
          <h3 className="font-bold text-emerald-950">Extracted from your bill</h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {extracted.monthlyKwh && (
              <div className="rounded-lg bg-white p-3">
                <dt className="text-xs uppercase text-slate-500">Monthly kWh (normalized)</dt>
                <dd className="text-xl font-bold text-slate-900">{extracted.monthlyKwh}</dd>
              </div>
            )}
            {extracted.monthlyExpenditureLocal && (
              <div className="rounded-lg bg-white p-3">
                <dt className="text-xs uppercase text-slate-500">Monthly spend ({currency.code})</dt>
                <dd className="text-xl font-bold text-slate-900">
                  {currency.symbol}
                  {extracted.monthlyExpenditureLocal}
                </dd>
              </div>
            )}
          </dl>
          <Link
            href={`${calculatorHref}${calculatorQuery}`}
            className="mt-4 inline-flex rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
          >
            Continue to calculator with these values →
          </Link>
        </section>
      )}
    </div>
  );
}

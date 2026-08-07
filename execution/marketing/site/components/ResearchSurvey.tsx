'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { authedFetch } from '@/lib/authed-fetch';
import {
  SCALE_ANCHORS,
  getWaveById,
  type SurveyItem,
  type SurveyWaveId,
} from '@/lib/research/survey-instrument';
import { CONSENT } from '@/lib/research/survey-consent';
import page from '../app/page.module.css';
import s from './ResearchSurvey.module.css';

type WaveStatus = 'not-yet' | 'open' | 'closed';

type WaveSummary = {
  id: SurveyWaveId;
  label: string;
  shortLabel: string;
  status: WaveStatus;
  opensAt: string;
  closesAt: string;
  completed: boolean;
};

type SurveyState = {
  consentVersion: string;
  consented: boolean;
  waves: WaveSummary[];
  openWaveId: SurveyWaveId | null;
};

type AnswerValue = number | string;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function badgeClass(w: WaveSummary): string {
  if (w.completed) return s.badgeDone;
  if (w.status === 'open') return s.badgeOpen;
  if (w.status === 'not-yet') return s.badgeSoon;
  return s.badgeClosed;
}

function badgeLabel(w: WaveSummary): string {
  if (w.completed) return 'Completed';
  if (w.status === 'open') return 'Open now';
  if (w.status === 'not-yet') return `Opens ${formatDate(w.opensAt)}`;
  return 'Closed';
}

function LikertItem({
  item,
  value,
  onChange,
}: {
  item: SurveyItem;
  value: AnswerValue | undefined;
  onChange: (v: number) => void;
}) {
  const anchors = SCALE_ANCHORS[item.scale === 'A5' ? 'A5' : 'A7'];
  return (
    <fieldset className={s.item} style={{ border: 0, padding: 0, margin: '18px 0' }}>
      <legend className={s.itemText}>{item.text}</legend>
      <div className={s.scaleRow} role="radiogroup" aria-label={item.text}>
        {anchors.map((anchor, i) => {
          const v = i + 1;
          const selected = value === v;
          return (
            <label
              key={v}
              className={`${s.scaleOption} ${selected ? s.scaleOptionSelected : ''}`}
            >
              <input
                className={s.srOnly}
                type="radio"
                name={item.id}
                value={v}
                checked={selected}
                onChange={() => onChange(v)}
              />
              <span className={s.scaleNum}>{v}</span>
              <span className={s.scaleAnchor}>{anchor}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function CatItem({
  item,
  value,
  onChange,
}: {
  item: SurveyItem;
  value: AnswerValue | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className={s.item} style={{ border: 0, padding: 0, margin: '18px 0' }}>
      <legend className={s.itemText}>{item.text}</legend>
      <div className={s.catList}>
        {(item.options ?? []).map((opt) => (
          <label key={opt.value} className={s.catOption}>
            <input
              type="radio"
              name={item.id}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function TextItem({
  item,
  value,
  onChange,
}: {
  item: SurveyItem;
  value: AnswerValue | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className={s.item}>
      <label className={s.itemText} htmlFor={item.id}>
        {item.text}
      </label>
      <textarea
        id={item.id}
        className={s.textarea}
        value={typeof value === 'string' ? value : ''}
        maxLength={4000}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function ResearchSurvey({ getIdToken }: { getIdToken: () => Promise<string | null> }) {
  const [state, setState] = useState<SurveyState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [consentBusy, setConsentBusy] = useState(false);
  const [declined, setDeclined] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const json = await authedFetch<SurveyState>(
        getIdToken,
        '/api/research/survey',
        {},
        'Could not load the survey.'
      );
      setState(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the survey.');
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openWave = useMemo(
    () => (state?.openWaveId ? getWaveById(state.openWaveId) : undefined),
    [state?.openWaveId]
  );
  const openSummary = state?.waves.find((w) => w.id === state.openWaveId);

  const visibleItems = useMemo(() => {
    if (!openWave) return [];
    return openWave.sections
      .flatMap((sec) => sec.items)
      .filter((it) => !it.showIf || answers[it.showIf.id] === it.showIf.equals);
  }, [openWave, answers]);

  const answeredCount = visibleItems.filter((it) => answers[it.id] !== undefined && answers[it.id] !== '').length;

  function setAnswer(id: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function submitConsent(consented: boolean) {
    setConsentBusy(true);
    setSubmitError('');
    try {
      await authedFetch(
        getIdToken,
        '/api/research/consent',
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ consented }) },
        'Could not record your choice.'
      );
      if (consented) {
        await refresh();
      } else {
        setDeclined(true);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not record your choice.');
    } finally {
      setConsentBusy(false);
    }
  }

  async function submitSurvey() {
    if (!openWave) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await authedFetch(
        getIdToken,
        '/api/research/survey',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wave: openWave.id, answers }),
        },
        'Could not save your responses.'
      );
      await refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not save your responses.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className={page.formNote}>Loading…</p>;
  if (error) return <p className={page.formError}>{error}</p>;
  if (!state) return null;

  const scheduleList = (
    <ul className={s.waveList}>
      {state.waves.map((w) => (
        <li key={w.id} className={s.waveRow}>
          <span>{w.shortLabel}</span>
          <span className={`${s.waveBadge} ${badgeClass(w)}`}>{badgeLabel(w)}</span>
        </li>
      ))}
    </ul>
  );

  if (!openWave || !openSummary) {
    return (
      <div>
        <p className={page.formNote}>
          No research survey is open right now. Surveys open before week 1, after the first review cycle,
          and at the end of week 6. You will be notified when the next one opens.
        </p>
        {scheduleList}
      </div>
    );
  }

  if (openSummary.completed) {
    return (
      <div>
        <div className={page.calloutSuccess}>
          <p>
            <strong>Thank you.</strong> Your response to the {openSummary.shortLabel.toLowerCase()} survey
            is recorded. You can update it while the window is open.
          </p>
        </div>
        {scheduleList}
        <div className={s.submitRow}>
          <button
            type="button"
            className={page.secondaryBtn}
            onClick={() => {
              setAnswers({});
            }}
          >
            Review or update my answers
          </button>
        </div>
      </div>
    );
  }

  if (declined) {
    return (
      <div className={page.callout}>
        <p>
          Your choice not to take part is recorded. This does not affect anything else in the program. If
          you change your mind while a survey is open, reload this page.
        </p>
      </div>
    );
  }

  if (!state.consented) {
    return (
      <div>
        <h2 className={page.sectionTitle} style={{ fontSize: '1.2rem' }}>{CONSENT.title}</h2>
        <p className={s.consentMeta}>{CONSENT.studyTitle}</p>
        <p className={s.consentMeta}>{CONSENT.irbLine}</p>
        <p className={s.consentMeta}>{CONSENT.piLine}</p>
        <p className={s.consentBody} style={{ marginTop: 14 }}>{CONSENT.intro}</p>
        {CONSENT.sections.map((sec) => (
          <div key={sec.heading} className={s.consentSection}>
            <h3 className={s.consentHeading}>{sec.heading}</h3>
            <p className={s.consentBody}>{sec.body}</p>
          </div>
        ))}
        <p className={s.consentBody}>{CONSENT.statement}</p>
        <p className={s.consentMeta}>{CONSENT.declineNote}</p>
        <div className={s.submitRow}>
          <button
            type="button"
            className={page.primaryBtn}
            disabled={consentBusy}
            onClick={() => void submitConsent(true)}
          >
            {consentBusy ? 'Recording…' : 'I consent to take part'}
          </button>
          <button
            type="button"
            className={page.secondaryBtn}
            disabled={consentBusy}
            onClick={() => void submitConsent(false)}
          >
            I do not wish to take part
          </button>
        </div>
        {submitError ? <p className={page.formError}>{submitError}</p> : null}
      </div>
    );
  }

  return (
    <div>
      <p className={page.formNote} style={{ marginTop: 0 }}>{openWave.intro}</p>
      <p className={s.progress}>
        About {openWave.estimatedMinutes} minutes · {answeredCount} of {visibleItems.length} answered ·
        every question is optional.
      </p>

      {openWave.sections.map((sec) => (
        <section key={sec.title} className={s.section}>
          <h2 className={s.sectionTitle}>{sec.title}</h2>
          {sec.intro ? <p className={s.sectionIntro}>{sec.intro}</p> : null}
          {sec.items
            .filter((it) => !it.showIf || answers[it.showIf.id] === it.showIf.equals)
            .map((it) => {
              const value = answers[it.id];
              if (it.scale === 'TEXT') {
                return <TextItem key={it.id} item={it} value={value} onChange={(v) => setAnswer(it.id, v)} />;
              }
              if (it.scale === 'CAT') {
                return <CatItem key={it.id} item={it} value={value} onChange={(v) => setAnswer(it.id, v)} />;
              }
              return (
                <LikertItem key={it.id} item={it} value={value} onChange={(v) => setAnswer(it.id, v)} />
              );
            })}
        </section>
      ))}

      <div className={s.submitRow}>
        <button
          type="button"
          className={page.primaryBtn}
          disabled={submitting || answeredCount === 0}
          onClick={() => void submitSurvey()}
        >
          {submitting ? 'Submitting…' : 'Submit responses'}
        </button>
        <span className={s.progress}>You can submit now and update later while the window is open.</span>
      </div>
      {submitError ? <p className={page.formError}>{submitError}</p> : null}
    </div>
  );
}

import {
  agentRecommendationsForNextRfp,
  extractLossLessons,
  extractWinPatterns,
} from '@/lib/rfp-analytics';

export function AgentRecommendations() {
  const winPatterns = extractWinPatterns();
  const lossLessons = extractLossLessons();
  const nextDraftRecs = agentRecommendationsForNextRfp();

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-ceal-500/20 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-ceal-900">Agent recommendations for the next RFP draft</h2>
        <p className="mt-2 text-sm text-ceal-900/70">
          Learned from cEAL Green wins and losses — intended for fully agent-generated proposals targeting a{' '}
          <strong>10% win rate</strong>.
        </p>
        <ul className="mt-4 space-y-2">
          {nextDraftRecs.map((rec) => (
            <li key={rec} className="flex gap-2 text-sm text-ceal-900/90">
              <span className="text-ceal-600" aria-hidden>
                →
              </span>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
          <h3 className="font-semibold text-emerald-900">Patterns from wins</h3>
          <ul className="mt-3 space-y-3">
            {winPatterns.map((p) => (
              <li key={p.theme} className="text-sm">
                <span className="font-medium text-emerald-800">{p.theme}</span>
                <span className="text-emerald-700/80"> ({p.seenInWins} wins)</span>
                <p className="mt-0.5 text-emerald-900/80">{p.recommendation}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
          <h3 className="font-semibold text-red-900">Lessons from losses</h3>
          <ul className="mt-3 space-y-3">
            {lossLessons.map((l) => (
              <li key={l.theme} className="text-sm">
                <span className="font-medium text-red-800">{l.theme}</span>
                <span className="text-red-700/80"> ({l.seenInLosses} losses)</span>
                <p className="mt-0.5 text-red-900/80">{l.avoid}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

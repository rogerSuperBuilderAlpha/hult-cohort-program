import Link from 'next/link';
import type { Metadata } from 'next';

/**
 * `/approach` — how Pulse is built, and why. Public, signed out, static.
 *
 * Companion to `/how`: that page walks what Pulse does; this walks the architecture, what
 * makes it different, and how it's tested. DESIGN-SPEC §4 — sentence case, 11–14px, hairline
 * borders, cards on zinc-900. Green is the one motivating action, so every marker and bar is
 * zinc; emphasis is weight, not hue.
 */
export const metadata: Metadata = {
  title: 'How Pulse is built',
  description: 'The architecture behind Pulse — a pure sensing core, consent enforced twice, and a test pyramid that proves it.',
};

const DIFFERENT = [
  {
    name: 'It passes the AI-first test',
    body: 'Take the model out and there’s no product left. The sensing, the writing, and the matching are the product — which is why the chat box in the corner was rejected.',
  },
  {
    name: 'It shows facts before it shows anyone',
    body: 'A stranger sees the cohort’s real week before making an account. The value sits in front of the signup, because merged PRs are public record.',
  },
  {
    name: 'It never invents to look busy',
    body: 'Most of the cohort hasn’t pushed yet, and Pulse says so. The gap between enrolled and shipped is left honest, not padded.',
  },
  {
    name: 'It breaks honestly',
    body: 'When GitHub is unreachable, Pulse shows nothing rather than a stale board dressed as live — the one failure every other board has.',
  },
  {
    name: 'It reads hostile text safely',
    body: 'Pulse feeds commit messages and PR titles to a model, then posts to the cohort. A guard holds every sentence to describing only the person who did the work.',
  },
];

const ARCH = [
  {
    tag: 'Step 1',
    title: 'One place turns activity into facts',
    body: 'A single piece of code reads commits and PRs and writes down plain facts — who did what, and when. It doesn’t call the AI or touch a database, so it’s easy to test and hard to get wrong.',
  },
  {
    tag: 'Step 2',
    title: 'Signed out reads GitHub, signed in reads your board',
    body: 'A visitor who isn’t logged in sees the cohort read straight from the public repo. A logged-in member sees their own board. Both show the same facts, so nothing ever contradicts itself.',
  },
  {
    tag: 'Step 3',
    title: 'The AI writes only with your permission',
    body: 'Before a sentence goes out under your name, Pulse checks your choice in two places — once in the app, once in the database. Two locks, so a mistake in one can’t slip through.',
  },
  {
    tag: 'Step 4',
    title: 'Built one layer at a time',
    body: 'Sense works today. Bank and Broker are designed to slot in behind it later, without redoing what’s already built.',
  },
];

// Widest rung is the base of the pyramid: many fast unit checks, narrowing to a few end-to-end.
const TESTS = [
  { name: 'End to end', body: 'Playwright drives the real flows in a browser — the way a person does.', w: 'w-[36%]' },
  { name: 'Integration', body: 'Sensing and syncing run against the emulator, so a real board comes out.', w: 'w-[52%]' },
  { name: 'Firestore rules', body: 'The access and consent model is proven against the emulator.', w: 'w-[68%]' },
  { name: 'Unit', body: 'The pure sensing core is checked exhaustively, no GitHub, no model.', w: 'w-[84%]' },
  { name: 'Typecheck and lint', body: 'The types hold and the code reads to one standard.', w: 'w-full' },
];

export default function ApproachPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-20">
      <header className="mb-14">
        <Link href="/" className="flex w-fit items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden />
          <span className="text-sm font-medium text-zinc-100">Pulse</span>
        </Link>
        <h1 className="mt-6 text-2xl font-medium tracking-tight text-zinc-100">
          How Pulse is built, and why.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          One idea shapes every part of this: keep what Pulse <em>knows</em> apart from what Pulse
          <em> says</em>. Facts are public record and safe to show. A sentence a model writes about
          a person is a disclosure, and it waits for their yes.
        </p>
        <p className="mt-4 text-sm text-zinc-400">
          Reading the walkthrough first?{' '}
          <Link href="/how" className="text-zinc-300 underline underline-offset-2 hover:text-zinc-100">
            Start with what Pulse does
          </Link>
          .
        </p>
      </header>

      {/* -------------------------------------------------- what makes it different */}
      <Band label="What makes it different">
        <div className="grid gap-3 sm:grid-cols-2">
          {DIFFERENT.map((d) => (
            <div key={d.name} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-sm font-medium text-zinc-100">{d.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">{d.body}</p>
            </div>
          ))}
        </div>
      </Band>

      {/* -------------------------------------------------- architecture */}
      <Band label="How it fits together">
        <p className="mb-5 text-sm leading-relaxed text-zinc-300">
          Four steps, in plain terms: read the work into facts, show those facts two ways, guard
          anything the AI writes, and build the rest in layers.
        </p>
        <ArchDiagram />
        <div className="relative mt-6">
          <span className="absolute left-[15px] top-3 bottom-3 w-px bg-zinc-800" aria-hidden />
          <div className="space-y-3">
            {ARCH.map((a) => (
              <div key={a.tag} className="relative pl-8">
                <span className="absolute left-[11px] top-1.5 h-2 w-2 rounded-full border border-zinc-500 bg-zinc-950" aria-hidden />
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-xs text-zinc-500">{a.tag}</p>
                  <p className="mt-1 text-sm font-medium text-zinc-100">{a.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">{a.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Band>

      {/* -------------------------------------------------- testing */}
      <Band label="How it’s tested">
        <p className="mb-5 text-sm leading-relaxed text-zinc-300">
          Every change clears the whole gate before it merges. Many fast checks at the base, a few
          real-browser runs at the top — each rung proves a different thing.
        </p>
        <div className="space-y-2">
          {TESTS.map((t) => (
            <div key={t.name} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
              <div className={`mx-auto ${t.w}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-zinc-100">{t.name}</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">{t.body}</p>
                <div className="mt-2 h-1 w-full rounded-full bg-zinc-700" aria-hidden />
              </div>
            </div>
          ))}
        </div>
      </Band>

      {/* -------------------------------------------------- stack */}
      <Band label="Built with">
        <div className="flex flex-wrap gap-2">
          {['Next 16', 'React 19', 'Firebase', 'Firestore', 'Anthropic SDK', 'Vercel', 'Playwright', 'Vitest'].map(
            (t) => (
              <span key={t} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300">
                {t}
              </span>
            )
          )}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          The Firebase keys ship in the client by design — access is held by the security rules, not
          by hiding the keys. The server secrets never reach the browser.
        </p>
      </Band>

      {/* -------------------------------------------------- see it live */}
      <div className="mt-12 flex flex-wrap gap-3 border-t border-zinc-800 pt-8">
        <Link
          href="/how"
          className="inline-flex min-h-11 items-center rounded border border-zinc-800 px-4 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
        >
          See what Pulse does
        </Link>
        <Link
          href="/signin"
          className="inline-flex min-h-11 items-center rounded bg-emerald-500 px-4 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-400"
        >
          Sign in — yours is waiting
        </Link>
      </div>

      <footer className="mt-12 border-t border-zinc-800 pt-6">
        <p className="text-xs leading-relaxed text-zinc-400">
          Pulse reads public activity from the cohort&rsquo;s GitHub repo to show the cohort&rsquo;s work.
          Facts only — AI summaries about a person appear only if they&rsquo;ve connected their own
          account. Built for the Hult Cohort Developer Program, <strong>non-commercial, for cohort use
          only</strong>. Not you?{' '}
          <Link href="/opt-out" className="text-zinc-400 underline underline-offset-2 hover:text-zinc-200">
            Remove me
          </Link>
          .
        </p>
      </footer>
    </main>
  );
}

/** A titled band: a small zinc label, a hairline top rule, and its content. */
function Band({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 border-t border-zinc-800 pt-6">
      <h2 className="mb-4 text-xs text-zinc-400">{label}</h2>
      {children}
    </section>
  );
}

/**
 * The system, drawn: the public repo feeds one sensing core; the core feeds a signed-out
 * cohort view and a signed-in board; the board's AI sentence passes a consent gate before it
 * posts. An SVG so it stays crisp. Zinc throughout, one emerald node for the core that's the
 * heart of it — nothing else coloured.
 */
function ArchDiagram() {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <svg viewBox="0 0 640 260" className="h-auto w-full min-w-[560px]" role="img" aria-label="The public repo feeds the sensing core, which feeds the signed-out cohort view and your signed-in board; the board's AI sentence passes a consent gate before it posts">
        <defs>
          <marker id="a2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="none" stroke="#52525b" strokeWidth="1.2" />
          </marker>
        </defs>
        {/* connectors */}
        <line x1="150" y1="130" x2="196" y2="130" stroke="#52525b" strokeWidth="1.2" markerEnd="url(#a2)" />
        <path d="M372,110 C410,110 410,58 448,58" fill="none" stroke="#52525b" strokeWidth="1.2" markerEnd="url(#a2)" />
        <path d="M372,150 C410,150 410,192 448,192" fill="none" stroke="#52525b" strokeWidth="1.2" markerEnd="url(#a2)" />

        {/* GitHub repo */}
        <rect x="12" y="104" width="138" height="52" rx="8" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />
        <text x="30" y="128" fill="#fafafa" fontSize="13" fontWeight="500" fontFamily="sans-serif">Public repo</text>
        <text x="30" y="146" fill="#a1a1aa" fontSize="11" fontFamily="sans-serif">commits &amp; PRs</text>

        {/* sensing core (emerald) */}
        <rect x="200" y="98" width="172" height="64" rx="8" fill="#18181b" stroke="#34d399" strokeWidth="1.3" />
        <text x="220" y="124" fill="#fafafa" fontSize="13" fontWeight="500" fontFamily="sans-serif">Sensing core</text>
        <text x="220" y="142" fill="#a1a1aa" fontSize="11" fontFamily="sans-serif">turns activity into facts</text>

        {/* signed-out */}
        <rect x="452" y="32" width="176" height="52" rx="8" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />
        <text x="470" y="55" fill="#fafafa" fontSize="12.5" fontWeight="500" fontFamily="sans-serif">Signed out</text>
        <text x="470" y="72" fill="#a1a1aa" fontSize="11" fontFamily="sans-serif">the cohort&#39;s week</text>

        {/* signed-in board */}
        <rect x="452" y="166" width="176" height="52" rx="8" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />
        <text x="470" y="189" fill="#fafafa" fontSize="12.5" fontWeight="500" fontFamily="sans-serif">Signed in</text>
        <text x="470" y="206" fill="#a1a1aa" fontSize="11" fontFamily="sans-serif">your own board</text>

        {/* consent gate on the AI path */}
        <text x="452" y="240" fill="#71717a" fontSize="10.5" fontFamily="monospace">AI sentence → consent gate → posts</text>
      </svg>
    </div>
  );
}

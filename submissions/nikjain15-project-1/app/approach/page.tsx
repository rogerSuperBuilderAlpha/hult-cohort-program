import Link from 'next/link';
import type { Metadata } from 'next';

/**
 * `/approach` — how Pulse is built, and why it's built that way. Public, signed out.
 *
 * A companion to `/how`: that page walks what Pulse does; this one walks the architecture,
 * what makes it different, and how it's tested. Static — no data, no model — so it loads
 * instantly and reads the same every time.
 *
 * DESIGN-SPEC §4: sentence case, 11–14px, two weights, hairline borders. Green is the one
 * motivating action and nothing else is coloured — so the only green here is the brand mark
 * and the sign-in button.
 */
export const metadata: Metadata = {
  title: 'How Pulse is built',
  description: 'The architecture behind Pulse — a pure sensing core, consent enforced twice, and a test pyramid that proves it.',
};

export default function ApproachPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-20">
      <header className="mb-12">
        <Link href="/" className="flex w-fit items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden />
          <span className="text-sm font-medium text-zinc-100">Pulse</span>
        </Link>
        <h1 className="mt-6 text-2xl font-medium tracking-tight text-zinc-100">
          How Pulse is built, and why.
        </h1>
        <p className="mt-3 text-sm text-zinc-300">
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
      <section className="border-t border-zinc-800 pt-6">
        <h2 className="text-xs text-zinc-400">What makes it different</h2>
        <ul className="mt-5 space-y-3">
          <Point
            name="It passes the AI-first test"
            body="Take the model out and there's no product left. Pulse doesn't bolt a chat box onto a task board — the sensing, the writing, and the matching are the product. That test is why the chat box was rejected."
          />
          <Point
            name="It shows facts before it shows anyone"
            body="A stranger sees the cohort's real week before making an account. The value sits in front of the signup, not behind it, because merged PRs are public record."
          />
          <Point
            name="It never invents to look busy"
            body="Most of the cohort hasn't pushed yet, and Pulse says so. The gap between enrolled and shipped is left honest rather than padded with rows that aren't real."
          />
          <Point
            name="It breaks honestly"
            body="When GitHub is unreachable, Pulse says so and shows nothing rather than a stale board dressed as live — the one failure every other board has."
          />
          <Point
            name="It reads hostile text safely"
            body="Pulse feeds commit messages and PR titles — text anyone can write — to a model, then posts to the whole cohort. A guard holds every sentence to describing only the person who did the work, so a planted line can never publish something about someone else."
          />
        </ul>
      </section>

      {/* -------------------------------------------------- architecture */}
      <section className="mt-12 border-t border-zinc-800 pt-6">
        <h2 className="text-xs text-zinc-400">The architecture</h2>
        <ol className="mt-5 space-y-4">
          <Flow
            tag="The core"
            title="A pure sensing core, kept apart on purpose"
            body="The logic that decides what Pulse asserts about a person is pure functions — no network, no database, no model in the path. The most consequential code is also the most testable, so a model writing about someone can never happen by accident."
          />
          <Flow
            tag="Two paths, one shape"
            title="A server read for everyone, Firestore for you"
            body="A signed-out visitor gets a server-side read of the public repo — no auth, no model, one call. A signed-in member gets their own board from Firestore. Both render the same fact shape, so the numbers match everywhere."
          />
          <Flow
            tag="Built in layers"
            title="Sense ships, Bank and Broker build behind it"
            body="Each capability is a clean seam. Sense reads and writes the week today; Bank keeps how a problem got solved; Broker matches who's stuck to who solved it. Layer 1 stands alone while the rest are designed behind it."
          />
          <Flow
            tag="Consent, twice"
            title="The rule lives in the code and in the rules"
            body="A model narrates as a person only when they opted in, linked an account, and didn't pick ask-first. That rule is enforced in the pure core and again in Firestore's security rules — two checks, not one."
            last
          />
        </ol>
      </section>

      {/* -------------------------------------------------- testing */}
      <section className="mt-12 border-t border-zinc-800 pt-6">
        <h2 className="text-xs text-zinc-400">How it&rsquo;s tested</h2>
        <p className="mt-3 text-sm text-zinc-300">
          Every change clears the whole gate before it merges. Each rung proves a different thing.
        </p>
        <ol className="mt-5 space-y-3">
          <Test name="Typecheck and lint" body="The types hold and the code reads to one standard." />
          <Test name="Unit" body="The pure sensing core — titles, evidence, and the consent gates — is checked exhaustively, without touching GitHub or a model." />
          <Test name="Firestore rules" body="The access and consent model is run against the Firebase emulator, so a member can only ever read and write what the rules allow." />
          <Test name="Integration" body="Sensing and syncing run end to end against the emulator, so a real board comes out the far side." />
          <Test name="End to end" body="Playwright drives the real flows in a browser — sign in, the board, the consent screen — the way a person does." />
        </ol>
      </section>

      {/* -------------------------------------------------- stack */}
      <section className="mt-12 border-t border-zinc-800 pt-6">
        <h2 className="text-xs text-zinc-400">Built with</h2>
        <p className="mt-3 text-sm text-zinc-300">
          Next 16 and React 19, Firebase for auth and Firestore, the Anthropic SDK for narration,
          Vercel for hosting, Playwright and Vitest for the tests.
        </p>
        <p className="mt-3 text-sm text-zinc-400">
          The Firebase keys ship in the client by design — access is held by the security rules, not
          by hiding the keys. The server secrets never reach the browser.
        </p>
      </section>

      {/* -------------------------------------------------- see it live */}
      <section className="mt-12 border-t border-zinc-800 pt-6">
        <div className="flex flex-wrap gap-3">
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
      </section>

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

/* ------------------------------------------------------------------ pieces */

function Point({ name, body }: { name: string; body: string }) {
  return (
    <li className="rounded-lg border border-zinc-800 p-4">
      <p className="text-sm font-medium text-zinc-100">{name}</p>
      <p className="mt-1 text-sm text-zinc-400">{body}</p>
    </li>
  );
}

function Flow({
  tag,
  title,
  body,
  last,
}: {
  tag: string;
  title: string;
  body: string;
  last?: boolean;
}) {
  return (
    <li className="relative pl-5">
      <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full border border-zinc-600" aria-hidden />
      {!last && <span className="absolute left-[3.5px] top-4 bottom-[-1rem] w-px bg-zinc-800" aria-hidden />}
      <p className="text-xs text-zinc-500">{tag}</p>
      <p className="mt-1 text-sm font-medium text-zinc-100">{title}</p>
      <p className="mt-1 text-sm text-zinc-400">{body}</p>
    </li>
  );
}

function Test({ name, body }: { name: string; body: string }) {
  return (
    <li className="flex gap-4 rounded-lg border border-zinc-800 p-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-100">{name}</p>
        <p className="mt-1 text-sm text-zinc-400">{body}</p>
      </div>
    </li>
  );
}

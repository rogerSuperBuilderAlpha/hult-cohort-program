'use client';

import Link from 'next/link';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import styles from '../app/page.module.css';

const STORAGE_KEY = 'hult-eos-modal-v1';
const INTERVIEW_URL =
  'https://github.com/rogerSuperBuilderAlpha/algorithmacy-lab/tree/main/submissions/lima_pdw/interview';
const PCA_URL = 'https://pcaaca.org/page/submissionguidelines';
const REPLY_MAILTO = 'mailto:cohort@cursorboston.com';

type Tab = { id: string; label: string; panel: ReactNode };

const TABS: Tab[] = [
  {
    id: 'survey',
    label: 'Survey',
    panel: (
      <>
        <h3>End-of-term survey — do this first</h3>
        <p>The last research survey is open. Same instrument as the earlier waves. Sign in with GitHub. About fifteen minutes. Voluntary.</p>
        <p>
          <strong>Deadline: Monday, August 31 at 11:59 PM ET.</strong>
        </p>
        <p>
          <Link href="/research/survey" className={styles.primaryBtn}>
            Take the survey →
          </Link>
        </p>
      </>
    ),
  },
  {
    id: 'interview',
    label: 'Interview',
    panel: (
      <>
        <h3>Then the interview</h3>
        <p>
          About twenty minutes. Voluntary. Submission is anonymous. After you send it, you cannot withdraw it,
          because nothing links the file to you.
        </p>
        <p>
          Point any LLM or agent tool at this folder. Cursor is not required.
        </p>
        <p>
          <a href={INTERVIEW_URL} target="_blank" rel="noopener noreferrer">
            github.com/rogerSuperBuilderAlpha/algorithmacy-lab/tree/main/submissions/lima_pdw/interview
          </a>
        </p>
        <p>Tell it:</p>
        <p>
          <em>Read AGENT.md and follow it.</em>
        </p>
        <ol>
          <li>
            It shows <code>CONSENT.md</code> and waits. Confirm, say which you were (staff / participant / Roger),
            then answer one question at a time. &quot;Skip&quot; skips a question. &quot;Stop&quot; ends it.
          </li>
          <li>
            Answers land in <code>response-&lt;id&gt;.md</code> in that folder as you go.
          </li>
          <li>
            <strong>You read the file.</strong> Fix anything wrong. Cut anything that identifies you or a colleague.
            Then set <code>reviewed_by_human: true</code> at the top yourself. The agent cannot set that.
          </li>
          <li>Tell the agent to send it, or POST it yourself. Nothing leaves the machine until you say so.</li>
        </ol>
      </>
    ),
  },
  {
    id: 'pca',
    label: 'PCA',
    panel: (
      <>
        <h3>Submit a PCA talk — pop culture and business</h3>
        <p>
          Submit an essay to the Popular Culture Association and give a short talk on your favorite pop culture item{' '}
          <em>and</em> business.
        </p>
        <ul>
          <li>
            <strong>When:</strong> March 24–27, 2027, Boston
          </li>
          <li>
            <strong>What:</strong> a 15-minute paper in the <strong>Business Area</strong>
          </li>
          <li>
            <strong>Topic:</strong> your favorite piece of pop culture, and the business around it
          </li>
          <li>
            <strong>Abstract deadline:</strong> October 31, 2026 · 500 words max
          </li>
        </ul>
        <p>
          A movie, a sneaker, a game, a show, a restaurant chain, a creator economy, a platform — pick the thing you
          actually love, then talk about how it makes money, who it employs, what it sells, and why it works. That is
          the whole assignment. You already spent a summer building products. This is the same muscle, pointed at
          culture.
        </p>
        <p>
          You will need a PCA membership to submit (from $55). Membership is separate from conference registration. Do
          not pay registration until the abstract is accepted.
        </p>
        <p>
          <a href={PCA_URL} className={styles.primaryBtn} target="_blank" rel="noopener noreferrer">
            Submission guidelines →
          </a>
        </p>
        <p>
          If you want a second pair of eyes on the abstract before you hit submit,{' '}
          <a href={REPLY_MAILTO}>write the cohort inbox</a>.
        </p>
      </>
    ),
  },
  {
    id: 'certificates',
    label: 'Certificates',
    panel: (
      <>
        <h3>Certificates</h3>
        <p>Anusha is going to issue certificates from Hult. Roger will create certs from Cursor Boston.</p>
      </>
    ),
  },
  {
    id: 'fall',
    label: 'Fall',
    panel: (
      <>
        <h3>We&apos;re running it again this fall</h3>
        <p>
          Same program, next cohort, this fall. If you want in again — or you know someone who should be —{' '}
          <a href={REPLY_MAILTO}>write the cohort inbox</a>.
        </p>
      </>
    ),
  },
  {
    id: 'spring',
    label: 'Spring',
    panel: (
      <>
        <h3>Spring: course credit</h3>
        <p>
          In the spring we will be doing this for course credit. If you are enrolled as a student, you will be able to
          cross-register at Hult.
        </p>
      </>
    ),
  },
  {
    id: 'jobs',
    label: 'Jobs',
    panel: (
      <>
        <h3>This is also becoming a jobs placement program</h3>
        <p>
          If people participate in the Hult program and complete it at a certain level of proficiency — still figuring
          out what that means — we will be placing them in roles with our hiring partners.
        </p>
      </>
    ),
  },
  {
    id: 'role',
    label: 'Role',
    panel: (
      <>
        <h3>A role under Anusha at Hult</h3>
        <p>
          If you want to work on that, you are more than welcome to apply. You would be working under Anusha at Hult in
          a sales / marketing type role.{' '}
          <a href={REPLY_MAILTO}>
            <strong>Write the cohort inbox</strong>
          </a>{' '}
          if you want in.
        </p>
        <p>
          Note that sales people and marketers are now what we would have formerly called software engineers. Remember
          week 3? Week 4? Week 5? There is no such thing as just engineering anymore — every function of the business
          life cycle requires the same kinds of skills as what was previously limited to software development.
        </p>
      </>
    ),
  },
  {
    id: 'research',
    label: 'Research',
    panel: (
      <>
        <h3>Platform cooptation and algorithmacy</h3>
        <p>There are many reasons for this. Most prominently is what we are calling platform cooptation and algorithmacy.</p>
        <p>
          If you are at all academically inclined and want to contribute to research, check out{' '}
          <a href="https://algorithmacy.org" target="_blank" rel="noopener noreferrer">
            algorithmacy.org
          </a>{' '}
          and join us in Trinidad this October. Or contribute to the{' '}
          <a
            href="https://github.com/rogerSuperBuilderAlpha/algorithmacy-lab"
            target="_blank"
            rel="noopener noreferrer"
          >
            algorithmacy lab repo
          </a>
          .
        </p>
      </>
    ),
  },
];

export function EndOfSummerModal() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(TABS[0]!.id);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === 'dismissed') return;
    } catch {
      // Show anyway if storage is blocked.
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    function onDocKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onDocKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onDocKeyDown);
    };
  }, [open]);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'dismissed');
    } catch {
      // Ignore quota / private-mode failures.
    }
    setOpen(false);
  }

  function onTabListKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const tabIds = TABS.map((tab) => tab.id);
    const currentIndex = tabIds.indexOf(activeId);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % tabIds.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + tabIds.length) % tabIds.length;
    } else if (event.key === 'Home') {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      nextIndex = tabIds.length - 1;
    } else {
      return;
    }

    const nextId = tabIds[nextIndex]!;
    setActiveId(nextId);
    tabRefs.current[nextIndex]?.focus();
  }

  if (!open) return null;

  const active = TABS.find((tab) => tab.id === activeId) ?? TABS[0]!;

  return (
    <div className={styles.eosOverlay}>
      <div
        ref={dialogRef}
        className={styles.eosModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
      >
        <div className={styles.eosHeader}>
          <div>
            <p className={styles.eosEyebrow}>Summer Pilot 2026</p>
            <h2 id={`${baseId}-title`} className={styles.eosTitle}>
              That&apos;s a wrap
            </h2>
            <p className={styles.eosLead}>
              Certificates, the next cohorts, a survey, an interview, and a PCA talk. Click a tab.
            </p>
          </div>
          <button ref={closeRef} type="button" className={styles.eosClose} onClick={dismiss} aria-label="Close">
            Close
          </button>
        </div>

        <div
          className={styles.eosTabList}
          role="tablist"
          aria-label="End of summer sections"
          onKeyDown={onTabListKeyDown}
        >
          {TABS.map((tab, index) => {
            const selected = tab.id === activeId;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                className={selected ? styles.eosTabActive : styles.eosTab}
                onClick={() => setActiveId(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          className={styles.eosPanel}
          role="tabpanel"
          id={`${baseId}-panel-${active.id}`}
          aria-labelledby={`${baseId}-tab-${active.id}`}
        >
          {active.panel}
        </div>

        <div className={styles.eosFooter}>
          <button type="button" className={styles.primaryBtn} onClick={dismiss}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

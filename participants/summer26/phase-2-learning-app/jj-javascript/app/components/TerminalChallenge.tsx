'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  getChallenge,
  createInitialState,
  runCommand,
  type ShellLine,
  type ShellState,
} from '@/lib/shell/engine';

const LIMIT_SEC = 90;

function formatLines(lines: ShellLine[]) {
  return lines.map((l) => (l.kind === 'err' ? l.text : l.text)).join('\n');
}

export function TerminalChallenge({ challengeId }: { challengeId: string }) {
  const spec = useMemo(() => getChallenge(challengeId)!, [challengeId]);
  const initial = useMemo(() => spec.setup(createInitialState()), [spec]);
  const [state, setState] = useState<ShellState>(initial);
  const [output, setOutput] = useState('Welcome to Git Arcade.\nType commands below. Submit when done.\n');
  const [input, setInput] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [result, setResult] = useState<{ passed: boolean; stars: number } | null>(null);
  const commandsRef = useRef<string[]>([]);
  const startRef = useRef(Date.now());

  useEffect(() => {
    setState(spec.setup(createInitialState()));
    setOutput('Welcome to Git Arcade.\nType commands below. Submit when done.\n');
    setInput('');
    setElapsed(0);
    setRunning(true);
    setResult(null);
    commandsRef.current = [];
    startRef.current = Date.now();
  }, [spec]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!running) return;
      const sec = Math.floor((Date.now() - startRef.current) / 1000);
      setElapsed(sec);
      if (sec >= LIMIT_SEC) setRunning(false);
    }, 250);
    return () => window.clearInterval(id);
  }, [running]);

  const runLine = useCallback(
    (line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      commandsRef.current.push(trimmed);
      const { state: next, lines } = runCommand(state, trimmed);
      setState(next);
      setOutput((o) => `${o}$ ${trimmed}\n${formatLines(lines)}\n`);
    },
    [state]
  );

  async function submit() {
    setRunning(false);
    const res = await fetch('/api/challenge/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challengeId,
        commands: commandsRef.current,
        elapsedSec: elapsed,
      }),
    });
    const body = (await res.json()) as { passed: boolean; stars: number; error?: string };
    if (!res.ok) {
      setOutput((o) => `${o}\nSubmit failed: ${body.error ?? res.status}\n`);
      return;
    }
    setResult({ passed: body.passed, stars: body.stars });
    setOutput((o) =>
      `${o}\n${body.passed ? `Challenge passed! Stars: ${'★'.repeat(body.stars)}` : 'Not quite — check git status and try again.'}\n`
    );
  }

  return (
    <main className="page">
      <Link href="/">← Home</Link>
      <h1>{spec.title}</h1>
      <p>{spec.prompt}</p>
      <div className="meta">
        <span>Time: {elapsed}s / {LIMIT_SEC}s</span>
        <span>Commands: {commandsRef.current.length}</span>
        {result ? <span className="stars">{'★'.repeat(result.stars) || '—'}</span> : null}
      </div>

      <div className="terminal">
        <div className="terminal-output">{output}</div>
        <div className="terminal-input-row">
          <span className="prompt">$</span>
          <input
            className="terminal-input"
            value={input}
            disabled={!running || !!result}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const line = input;
                setInput('');
                runLine(line);
              }
            }}
            placeholder={running ? 'git status' : 'Time is up'}
            autoFocus
          />
        </div>
      </div>

      <div className="actions">
        <button className="btn primary" type="button" disabled={!!result} onClick={() => void submit()}>
          Submit challenge
        </button>
      </div>
    </main>
  );
}

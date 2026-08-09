export type FsNode = { type: 'file'; content: string } | { type: 'dir'; children: Record<string, FsNode> };

export type Commit = {
  id: string;
  message: string;
  files: Record<string, string>;
};

export type ShellState = {
  cwd: string[];
  tree: FsNode;
  gitInitialized: boolean;
  index: Set<string>;
  commits: Commit[];
  nextCommit: number;
};

export type ShellLine = { kind: 'out' | 'err'; text: string };

function isDir(node: FsNode): node is { type: 'dir'; children: Record<string, FsNode> } {
  return node.type === 'dir';
}

function pathKey(parts: string[]) {
  return parts.filter(Boolean).join('/') || '.';
}

function getDir(state: ShellState, parts: string[]): { type: 'dir'; children: Record<string, FsNode> } | null {
  let node: FsNode = state.tree;
  for (const part of parts) {
    if (!isDir(node) || !node.children[part]) return null;
    node = node.children[part];
  }
  return isDir(node) ? node : null;
}

function resolvePath(state: ShellState, target: string): string[] | null {
  if (target.startsWith('/')) {
    const parts = target.split('/').filter(Boolean);
    return getDir(state, parts) || (parts.length === 0 ? [] : null) ? parts : null;
  }
  if (target === '.') return [...state.cwd];
  if (target === '..') return state.cwd.length ? state.cwd.slice(0, -1) : [];
  const acc = [...state.cwd];
  for (const seg of target.split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') {
      if (acc.length) acc.pop();
    } else acc.push(seg);
  }
  return acc;
}

function ensureFile(state: ShellState, fileParts: string[]) {
  const dirParts = fileParts.slice(0, -1);
  const name = fileParts[fileParts.length - 1];
  const dir = getDir(state, dirParts);
  if (!dir) return false;
  if (!dir.children[name]) dir.children[name] = { type: 'file', content: '' };
  return true;
}

function readFile(state: ShellState, fileParts: string[]): string | null {
  const dirParts = fileParts.slice(0, -1);
  const name = fileParts[fileParts.length - 1];
  const dir = getDir(state, dirParts);
  if (!dir) return null;
  const node = dir.children[name];
  if (!node || node.type !== 'file') return null;
  return node.content;
}

function snapshotFiles(state: ShellState): Record<string, string> {
  const out: Record<string, string> = {};
  function walk(node: FsNode, prefix: string[]) {
    if (node.type === 'file') {
      out[pathKey(prefix)] = node.content;
      return;
    }
    for (const [name, child] of Object.entries(node.children)) walk(child, [...prefix, name]);
  }
  walk(state.tree, []);
  return out;
}

function cloneState(state: ShellState): ShellState {
  return JSON.parse(JSON.stringify(state)) as ShellState;
}

export function createInitialState(): ShellState {
  return {
    cwd: [],
    tree: { type: 'dir', children: {} },
    gitInitialized: false,
    index: new Set(),
    commits: [],
    nextCommit: 1,
  };
}

/** Deserialize state from JSON (index as array). */
export function hydrateState(raw: ShellState): ShellState {
  return {
    ...raw,
    index: new Set(Array.isArray(raw.index) ? raw.index : []),
  };
}

export function serializeState(state: ShellState): ShellState {
  return {
    ...state,
    index: Array.from(state.index) as unknown as Set<string>,
  };
}

export function runCommand(state: ShellState, line: string): { state: ShellState; lines: ShellLine[] } {
  const trimmed = line.trim();
  if (!trimmed) return { state, lines: [] };

  const parts = trimmed.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? [];
  const unquote = (s: string) => s.replace(/^['"]|['"]$/g, '');
  const cmd = parts[0];
  const args = parts.slice(1).map(unquote);
  const lines: ShellLine[] = [];
  const next = cloneState(state);
  next.index = new Set(state.index);

  const fail = (msg: string) => ({ state, lines: [{ kind: 'err' as const, text: msg }] });

  if (cmd === 'pwd') {
    lines.push({ kind: 'out', text: '/' + (next.cwd.join('/') || '') });
    return { state: next, lines };
  }

  if (cmd === 'ls') {
    const target = args[0] ?? '.';
    const resolved = resolvePath(next, target);
    if (!resolved) return fail(`ls: ${target}: No such file or directory`);
    const dir = getDir(next, resolved);
    if (!dir) return fail(`ls: ${target}: Not a directory`);
    lines.push({ kind: 'out', text: Object.keys(dir.children).sort().join('\n') || '' });
    return { state: next, lines };
  }

  if (cmd === 'cd') {
    const target = args[0];
    if (!target) return fail('cd: missing operand');
    const resolved = resolvePath(next, target);
    if (!resolved) return fail(`cd: ${target}: No such file or directory`);
    const dir = getDir(next, resolved);
    if (!dir) return fail(`cd: ${target}: Not a directory`);
    next.cwd = resolved;
    return { state: next, lines };
  }

  if (cmd === 'mkdir') {
    const name = args[0];
    if (!name) return fail('mkdir: missing operand');
    const resolved = resolvePath(next, name);
    if (!resolved) return fail(`mkdir: cannot create directory '${name}'`);
    const dirParts = resolved.slice(0, -1);
    const leaf = resolved[resolved.length - 1];
    const parent = getDir(next, dirParts);
    if (!parent) return fail(`mkdir: cannot create directory '${name}'`);
    if (parent.children[leaf]) return fail(`mkdir: cannot create directory '${name}': File exists`);
    parent.children[leaf] = { type: 'dir', children: {} };
    return { state: next, lines };
  }

  if (cmd === 'touch') {
    const name = args[0];
    if (!name) return fail('touch: missing file operand');
    const resolved = resolvePath(next, name);
    if (!resolved || resolved.length === 0) return fail(`touch: cannot touch '${name}'`);
    if (!ensureFile(next, resolved)) return fail(`touch: cannot touch '${name}'`);
    return { state: next, lines };
  }

  if (cmd === 'cat') {
    const name = args[0];
    if (!name) return fail('cat: missing file operand');
    const resolved = resolvePath(next, name);
    if (!resolved) return fail(`cat: ${name}: No such file or directory`);
    const content = readFile(next, resolved);
    if (content === null) return fail(`cat: ${name}: Is a directory`);
    lines.push({ kind: 'out', text: content });
    return { state: next, lines };
  }

  if (cmd === 'echo' && parts.length >= 3 && parts[parts.length - 2] === '>') {
    const content = unquote(parts[1]);
    const fileArg = unquote(parts[parts.length - 1]);
    const resolved = resolvePath(next, fileArg);
    if (!resolved) return fail(`echo: cannot write to '${fileArg}'`);
    if (!ensureFile(next, resolved)) return fail(`echo: cannot write to '${fileArg}'`);
    const dirParts = resolved.slice(0, -1);
    const leaf = resolved[resolved.length - 1];
    const dir = getDir(next, dirParts)!;
    (dir.children[leaf] as { type: 'file'; content: string }).content = content + '\n';
    return { state: next, lines };
  }

  if (cmd === 'git') {
    const sub = args[0];
    if (sub === 'init') {
      next.gitInitialized = true;
      lines.push({ kind: 'out', text: 'Initialized empty Git repository' });
      return { state: next, lines };
    }
    if (!next.gitInitialized) return fail('fatal: not a git repository');

    if (sub === 'status') {
      const files = snapshotFiles(next);
      const staged = [...next.index].sort();
      const untracked = Object.keys(files)
        .filter((f) => !next.index.has(f) && files[f] !== '')
        .sort();
      const out = ['On branch main', staged.length ? 'Changes to be committed:' : ''];
      for (const f of staged) out.push(`  new file:   ${f}`);
      if (untracked.length) {
        out.push('', 'Untracked files:');
        for (const f of untracked) out.push(`  ${f}`);
      }
      if (!staged.length && !untracked.length) out.push('nothing to commit, working tree clean');
      lines.push({ kind: 'out', text: out.filter((l, i) => i > 0 || l).join('\n') });
      return { state: next, lines };
    }

    if (sub === 'add') {
      const name = args[1];
      if (!name) return fail('git add: missing path');
      const resolved = resolvePath(next, name);
      if (!resolved) return fail(`fatal: pathspec '${name}' did not match any files`);
      const key = pathKey(resolved);
      if (readFile(next, resolved) === null) return fail(`fatal: pathspec '${name}' did not match any files`);
      next.index.add(key);
      return { state: next, lines };
    }

    if (sub === 'commit') {
      const mIdx = args.indexOf('-m');
      const message = mIdx >= 0 ? args.slice(mIdx + 1).join(' ') : '';
      if (!message) return fail('error: switch `m` requires a value');
      if (next.index.size === 0) return fail('nothing to commit');
      const files: Record<string, string> = {};
      const all = snapshotFiles(next);
      for (const p of next.index) files[p] = all[p] ?? '';
      const id = String(next.nextCommit++);
      next.commits.push({ id, message, files });
      next.index.clear();
      lines.push({ kind: 'out', text: `[main ${id}] ${message}` });
      return { state: next, lines };
    }

    if (sub === 'log') {
      if (!next.commits.length) lines.push({ kind: 'out', text: '' });
      else {
        lines.push({
          kind: 'out',
          text: next.commits
            .slice()
            .reverse()
            .map((c) => `commit ${c.id}\n    ${c.message}`)
            .join('\n\n'),
        });
      }
      return { state: next, lines };
    }

    return fail(`git: '${sub}' is not a git command`);
  }

  return fail(`${cmd}: command not found`);
}

export function replayCommands(commands: string[], initial = createInitialState()) {
  let state = initial;
  const transcript: ShellLine[] = [];
  for (const cmd of commands) {
    const result = runCommand(state, cmd);
    state = result.state;
    transcript.push(...result.lines);
  }
  return { state, transcript };
}

export type ChallengeSpec = {
  id: string;
  title: string;
  prompt: string;
  setup: (state: ShellState) => ShellState;
  parSeconds: number;
  parCommands: number;
  assert: (state: ShellState) => boolean;
};

export const FIRST_COMMIT_CHALLENGE: ChallengeSpec = {
  id: 'first-commit',
  title: 'First Commit',
  prompt:
    'Initialize git, create notes.txt with your first note, stage it, and commit with message "Initial commit". You have 90 seconds.',
  parSeconds: 45,
  parCommands: 4,
  setup: (state) => {
    const s = createInitialState();
    if (s.tree.type === 'dir') {
      s.tree.children['notes.txt'] = { type: 'file', content: 'My first Git note\n' };
    }
    return s;
  },
  assert: (state) => {
    if (!state.gitInitialized) return false;
    const commit = state.commits.find((c) => c.message === 'Initial commit');
    if (!commit) return false;
    return Object.prototype.hasOwnProperty.call(commit.files, 'notes.txt');
  },
};

export function scoreChallenge(
  spec: ChallengeSpec,
  elapsedSec: number,
  commandCount: number,
  passed: boolean
) {
  if (!passed) return 0;
  let stars = 1;
  if (elapsedSec <= spec.parSeconds) stars++;
  if (commandCount <= spec.parCommands) stars++;
  return stars;
}

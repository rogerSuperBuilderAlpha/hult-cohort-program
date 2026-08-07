'use client';

import { auth } from './firebase';
import type { SharedActivity, SharedMemoryNote } from './shared-context-contract';

/**
 * Browser-side calls to Pulse's shared-context routes. The bus is server-only (Admin SDK), so the
 * client never touches it directly — it goes through the routes, which verify the user's Firebase
 * ID token and derive the handle from the VERIFIED uid. Every call here attaches that token; a
 * signed-out caller gets null and the feature simply stays inert.
 */

async function authHeaders(): Promise<Record<string, string> | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  } catch {
    return null;
  }
}

/** Ask ANOTHER app's agent to do work — the user-confirmed cross-app hand-off. */
export async function sendDispatch(toApp: string, intent: string): Promise<{ ok: boolean; taskId?: string }> {
  const headers = await authHeaders();
  if (!headers) return { ok: false };
  try {
    const res = await fetch('/api/context/dispatch', { method: 'POST', headers, body: JSON.stringify({ toApp, intent }) });
    if (!res.ok) return { ok: false };
    return (await res.json()) as { ok: boolean; taskId?: string };
  } catch {
    return { ok: false };
  }
}

/** Claim + run any cross-app requests other apps addressed to Pulse for this user. Poll on open. */
export async function pollInbox(): Promise<{ handled: number }> {
  const headers = await authHeaders();
  if (!headers) return { handled: 0 };
  try {
    const res = await fetch('/api/context/inbox', { method: 'POST', headers });
    if (!res.ok) return { handled: 0 };
    return (await res.json()) as { handled: number };
  } catch {
    return { handled: 0 };
  }
}

export type SharedContextView = { handle: string | null; memory: SharedMemoryNote[]; activity: SharedActivity[] };

/** Read the user's own shared memory + activity back (the bus is otherwise invisible to them). */
export async function fetchSharedContext(): Promise<SharedContextView> {
  const empty: SharedContextView = { handle: null, memory: [], activity: [] };
  const headers = await authHeaders();
  if (!headers) return empty;
  try {
    const res = await fetch('/api/context/memory', { method: 'GET', headers });
    if (!res.ok) return empty;
    return (await res.json()) as SharedContextView;
  } catch {
    return empty;
  }
}

/** Right to be forgotten: erase the user's shared record and Pulse-local agent conversation. */
export async function forgetSharedContext(): Promise<{ ok: boolean; removed: number }> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, removed: 0 };
  try {
    const res = await fetch('/api/context/memory', { method: 'DELETE', headers });
    if (!res.ok) return { ok: false, removed: 0 };
    return (await res.json()) as { ok: boolean; removed: number };
  } catch {
    return { ok: false, removed: 0 };
  }
}

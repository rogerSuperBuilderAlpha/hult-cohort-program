'use client';

import { useEffect, useState } from 'react';
import { subscribeToBoardView } from './board-view';
import type { BoardView } from './workflows';

/**
 * Live per-user board view (workflow lanes + placements). `null` means the user has chosen no
 * workflow — the caller renders the classic three-column board. Best-effort, like the brief:
 * a listener error yields `null`, never a crash, so the board always renders.
 */
export function useBoardView(uid: string): BoardView | null {
  const [view, setView] = useState<BoardView | null>(null);
  useEffect(() => subscribeToBoardView(uid, setView), [uid]);
  return view;
}

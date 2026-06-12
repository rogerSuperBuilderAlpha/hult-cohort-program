#!/usr/bin/env node
/**
 * Ranked-choice instant runoff tally for Phase 1 votes.
 * Input CSV: voter, rank1, rank2, rank3 (GitHub handles)
 * Usage: node vote-tally.js ballots.csv
 */

import { readFileSync } from 'fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node vote-tally.js ballots.csv');
  process.exit(1);
}

const lines = readFileSync(file, 'utf8').trim().split('\n');
const header = lines.shift();
const ballots = lines.map((line) => {
  const [voter, r1, r2, r3] = line.split(',').map((s) => s.trim());
  return { voter, ranks: [r1, r2, r3].filter(Boolean) };
});

function tally(active) {
  const scores = {};
  for (const b of ballots) {
    const pick = b.ranks.find((c) => active.has(c));
    if (pick) scores[pick] = (scores[pick] || 0) + 1;
  }
  return scores;
}

let active = new Set(ballots.flatMap((b) => b.ranks));
let round = 1;

while (active.size > 1) {
  const scores = tally(active);
  const sorted = [...active].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
  console.log(`\nRound ${round}:`, scores);
  const top = scores[sorted[0]] || 0;
  const second = scores[sorted[1]] || 0;
  const majority = ballots.length / 2;
  if (top > majority) {
    console.log(`\nWinner: ${sorted[0]} (${top} votes)`);
    process.exit(0);
  }
  const eliminated = sorted[sorted.length - 1];
  console.log(`Eliminating: ${eliminated}`);
  active.delete(eliminated);
  round++;
}

console.log(`\nWinner: ${[...active][0]}`);

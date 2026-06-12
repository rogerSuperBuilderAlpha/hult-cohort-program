#!/usr/bin/env node
/**
 * Generate peer review assignments for Phase 1 review weeks.
 * Usage: node review-assignments.js roster.json > assignments.json
 *
 * roster.json: ["alice", "bob", "carol", ...]  (GitHub handles, n=30)
 */

import { readFileSync } from 'fs';

const roster = JSON.parse(readFileSync(process.argv[2] || 'roster.example.json', 'utf8'));

if (roster.length < 2) {
  console.error('Roster must have at least 2 students');
  process.exit(1);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const assignments = roster.map((reviewer) => {
  const others = roster.filter((h) => h !== reviewer);
  const shuffled = shuffle(others);
  const primary = shuffled.slice(0, 3);
  const all = shuffled;
  return {
    reviewer,
    primary_deep_reviews: primary,
    all_reviews: all,
    total_count: all.length,
  };
});

console.log(JSON.stringify({ cohort_size: roster.length, assignments }, null, 2));

#!/usr/bin/env node
/**
 * DATA-ONLY synthetic seed for screenshots (no Auth accounts).
 *
 * seed.mjs also creates Auth-emulator accounts so you can sign in AS a demo person — but those
 * extra accounts change the sign-in popup's account picker, which breaks the automated screenshot
 * sign-in. This variant writes only Firestore data (profiles, channels, messages, an XP-ranked
 * leaderboard, a live pulse feed) via the Admin SDK, so a freshly-signed-in screenshot user drops
 * into a lively cohort. Emulator only.
 *
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=demo-rally node scripts/seed-data.mjs
 */
import { getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error('Refusing to run: set FIRESTORE_EMULATOR_HOST (emulator only).');
  process.exit(2);
}
if (!getApps().length) initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'demo-rally' });
const db = getFirestore();

const PEOPLE = [
  ['ada', 'Ada Lovelace', 120], ['grace', 'Grace Hopper', 96], ['linus', 'Linus T.', 60],
  ['margaret', 'Margaret Hamilton', 84], ['dennis', 'Dennis R.', 48], ['barbara', 'Barbara Liskov', 72],
  ['ken', 'Ken Thompson', 36], ['radia', 'Radia Perlman', 24],
];
const uid = (h) => `seeddata_${h}`;
const members = PEOPLE.map(([h]) => uid(h));
const CHANNELS = [['general', 'General'], ['help', 'Help'], ['wins', 'Wins']];

async function main() {
  for (const [h, name, ] of PEOPLE) {
    await db.collection('profiles').doc(uid(h)).set({
      uid: uid(h), handle: h, githubLogin: h, displayName: name, avatarUrl: null, createdAt: FieldValue.serverTimestamp(),
    });
  }
  for (const [slug, name] of CHANNELS) {
    await db.collection('channels').doc(slug).set({
      slug, name, kind: 'channel', isPrivate: false, creatorUid: uid('ada'), memberUids: members, createdAt: FieldValue.serverTimestamp(),
    });
  }
  const msgs = [
    ['general', 'ada', 'morning all — kicking off the auth refactor today'],
    ['general', 'ken', "I'll get the webhook handler reviewed by EOD"],
    ['general', 'margaret', 'nice — ping me if you want a second pair of eyes'],
    ['help', 'linus', 'stuck on the emulator PATH thing again, anyone?'],
    ['help', 'grace', '@linus openjdk bin on your PATH fixes it — that one bites everyone'],
    ['help', 'linus', 'thanks @grace that unblocked me instantly 🙏'],
    ['wins', 'margaret', 'shipped the neighbors-only leaderboard 🎉'],
    ['wins', 'barbara', 'reviews queue is at zero for the first time this week'],
  ];
  for (const [slug, h, body] of msgs) {
    await db.collection('channels').doc(slug).collection('messages').add({
      authorUid: uid(h), body, parentId: null, reactions: {}, createdAt: FieldValue.serverTimestamp(), editedAt: null,
    });
  }
  for (const [h, , pts] of PEOPLE) {
    await db.collection('xpEvents').doc(`sd_${h}`).set({
      profileUid: uid(h), source: 'seed', refId: 'demo', points: pts, createdAt: FieldValue.serverTimestamp(),
    });
  }
  const pulses = [['grace', 'linus', 12], ['ada', 'ken', 10], ['margaret', 'barbara', 10], ['barbara', 'radia', 8], ['ken', 'dennis', 8]];
  for (let i = 0; i < pulses.length; i++) {
    const [helper, helped, points] = pulses[i];
    await db.collection('pulseEvents').doc(`sd_pulse_${i}`).set({
      actorUid: uid(helper), verb: 'recognition_confirmed', object: uid(helped), points, createdAt: FieldValue.serverTimestamp(),
    });
  }
  const goalTarget = members.length * 50;
  await db.collection('cohortGoals').doc('xp').set({ metric: 'xp', target: goalTarget, current: 540, period: 'week' }).catch(() => {});
  console.log(`Seeded data-only world: ${PEOPLE.length} people, ${CHANNELS.length} channels, XP ladder, pulse feed.`);
}
main().catch((e) => { console.error(e); process.exit(1); });

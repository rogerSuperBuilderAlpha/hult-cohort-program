#!/usr/bin/env node
/**
 * Seed a lively SYNTHETIC demo world for Rally (never real peers' data — guardrail #8).
 *
 * Creates real Auth-emulator accounts for each demo person (so you can sign IN as them via the
 * GitHub popup's account chooser) and populates channels, messages, a spread of XP, a live pulse
 * feed, a pending recognition, and open commitments — so every screen has something to show.
 *
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
 *   GCLOUD_PROJECT=demo-rally node scripts/seed.mjs
 */
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const PROJECT = process.env.GCLOUD_PROJECT || 'demo-rally';

function init() {
  if (getApps().length) return;
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (svc) initializeApp({ credential: cert(JSON.parse(svc)) });
  else if (process.env.FIRESTORE_EMULATOR_HOST) initializeApp({ projectId: PROJECT });
  else {
    console.error('Set FIRESTORE_EMULATOR_HOST (emulator) or FIREBASE_SERVICE_ACCOUNT.');
    process.exit(1);
  }
}

/** Create (or reuse) a federated GitHub account in the Auth emulator; returns its uid. */
async function ensureAuthUser(handle, name) {
  const idToken = JSON.stringify({ sub: `gh-${handle}`, email: `${handle}@rally.demo`, name, screen_name: handle });
  const res = await fetch(
    `http://${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=demo`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        postBody: `id_token=${encodeURIComponent(idToken)}&providerId=github.com`,
        requestUri: 'http://localhost',
        returnIdpCredential: true,
        returnSecureToken: true,
      }),
    },
  );
  if (!res.ok) throw new Error(`auth create failed for ${handle}: ${res.status} ${await res.text()}`);
  return (await res.json()).localId;
}

const PEOPLE = [
  ['ada', 'Ada Lovelace', 120],
  ['grace', 'Grace Hopper', 96],
  ['linus', 'Linus T.', 60],
  ['margaret', 'Margaret Hamilton', 84],
  ['dennis', 'Dennis R.', 48],
  ['barbara', 'Barbara Liskov', 72],
  ['ken', 'Ken Thompson', 36],
  ['radia', 'Radia Perlman', 24],
];
const CHANNELS = [
  { slug: 'general', name: 'General' },
  { slug: 'help', name: 'Help' },
  { slug: 'wins', name: 'Wins' },
];

async function main() {
  init();
  const db = getFirestore();

  // 1) Auth accounts + uid map.
  const uid = {};
  for (const [h, name] of PEOPLE) uid[h] = await ensureAuthUser(h, name);
  const members = PEOPLE.map(([h]) => uid[h]);

  // 2) Profiles.
  for (const [h, name] of PEOPLE) {
    await db.collection('profiles').doc(uid[h]).set({
      uid: uid[h], handle: h, displayName: name, avatarUrl: null, githubLogin: h,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  // 3) Channels (everyone a member).
  for (const c of CHANNELS) {
    await db.collection('channels').doc(c.slug).set({
      slug: c.slug, name: c.name, kind: 'channel', isPrivate: false,
      creatorUid: uid.ada, memberUids: members, createdAt: FieldValue.serverTimestamp(),
    });
  }

  // 4) Messages — incl. the recognition-worthy #help exchange.
  const msgs = [
    ['general', 'ada', 'morning all — kicking off the auth refactor today'],
    ['general', 'ken', "I'll get the webhook handler reviewed by EOD"],
    ['help', 'linus', 'stuck on the emulator PATH thing again, anyone?'],
    ['help', 'grace', '@linus openjdk bin on your PATH fixes it — that one bites everyone'],
    ['help', 'linus', 'thanks @grace that unblocked me instantly 🙏'],
    ['wins', 'margaret', 'shipped the neighbors-only leaderboard 🎉'],
    ['wins', 'barbara', 'reviews queue is at zero for the first time this week'],
  ];
  let helpThanksRef = null;
  for (const [slug, h, body] of msgs) {
    const ref = await db.collection('channels').doc(slug).collection('messages').add({
      authorUid: uid[h], body, parentId: null, createdAt: FieldValue.serverTimestamp(), editedAt: null,
    });
    if (slug === 'help' && body.includes('thanks')) helpThanksRef = `channels/help/messages/${ref.id}`;
  }

  // 5) XP ledger — a spread so the leaderboard has real ranks.
  for (const [h, , pts] of PEOPLE) {
    await db.collection('xpEvents').doc(`seed_${h}`).set({
      profileUid: uid[h], source: 'seed', refId: 'demo', points: pts, createdAt: FieldValue.serverTimestamp(),
    });
  }

  // 6) Live pulse — confirmed recognitions across the cohort.
  const pulses = [
    ['grace', 'linus', 12], ['ada', 'ken', 10], ['margaret', 'barbara', 10],
    ['barbara', 'radia', 8], ['ken', 'dennis', 8],
  ];
  for (let i = 0; i < pulses.length; i++) {
    const [helper, helped, points] = pulses[i];
    await db.collection('pulseEvents').doc(`seed_pulse_${i}`).set({
      actorUid: uid[helper], verb: 'recognition_confirmed', object: uid[helped], points,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  // 7) A PENDING recognition Linus can confirm (sign in as Linus to see "Needs you").
  await db.collection('recognitions').doc('demo_rec_1').set({
    helperUid: uid.grace, helpedUid: uid.linus, sourceMsgRef: helpThanksRef ?? 'channels/help/messages/x',
    kind: 'unblocked', status: 'suggested', points: 12, createdAt: FieldValue.serverTimestamp(),
  });

  // 8) Open commitments (show on Home "You promised" / channel).
  await db.collection('commitments').doc('demo_commit_1').set({
    authorUid: uid.ken, toUid: null, sourceMsgRef: 'channels/general/messages/x',
    text: 'Get the webhook handler reviewed by EOD', dueAt: Date.now() + 8 * 3_600_000,
    status: 'open', pmTaskUrl: null, pmExternalId: null, points: 0, createdAt: FieldValue.serverTimestamp(),
  });

  console.log('Seeded a demo world:');
  console.log(`  • ${PEOPLE.length} sign-in accounts (pick one in the GitHub popup): ${PEOPLE.map(([h]) => h).join(', ')}`);
  console.log('  • 3 channels with messages, an XP-ranked leaderboard, a live pulse feed');
  console.log('  • Sign in as "Linus T." → Home shows a recognition from Grace waiting to confirm');
  console.log('  • All synthetic. Explore, react, Track it, start a DM, Ask Rally.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

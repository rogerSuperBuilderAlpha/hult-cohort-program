import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, test } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';

const emulatorDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(emulatorDirectory, '..');
const rules = await readFile(join(root, 'firestore.rules'), 'utf8');
const [host = '127.0.0.1', portText = '8080'] = (process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080').split(':');
const projectId = process.env.GCLOUD_PROJECT || 'demo-relay65-channel-rules';

let testEnvironment;
let aliceDb;

function ids(snapshot) {
  return snapshot.docs.map((snapshotDocument) => snapshotDocument.id);
}

async function allowed(read) {
  await assertSucceeds(read);
  return read;
}

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: {
      host,
      port: Number(portText),
      rules
    }
  });

  await testEnvironment.clearFirestore();
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, 'settings', 'workspace'), {
        accessMode: 'open', cohortCapacity: 65, workspaceName: 'Hult Cohort'
      }),
      setDoc(doc(db, 'members', 'alice'), { uid: 'alice', active: true, role: 'member' }),
      setDoc(doc(db, 'members', 'bob'), { uid: 'bob', active: true, role: 'member' }),
      setDoc(doc(db, 'members', 'mallory'), { uid: 'mallory', active: true, role: 'admin' }),
      setDoc(doc(db, 'members', 'staffer'), { uid: 'staffer', active: true, role: 'staff' }),
      setDoc(doc(db, 'channels', 'announcements'), {
        type: 'public', sort: 5, archived: false, name: 'announcements', postingRoles: ['staff']
      }),
      setDoc(doc(db, 'channels', 'public-room'), {
        type: 'public', sort: 10, archived: false, name: 'public-room', postingRoles: []
      }),
      setDoc(doc(db, 'channels', 'private-alice'), {
        type: 'private', memberIds: ['alice'], sort: 20, archived: false, name: 'private-alice'
      }),
      setDoc(doc(db, 'channels', 'private-bob'), {
        type: 'private', memberIds: ['bob'], sort: 30, archived: false, name: 'private-bob'
      }),
      setDoc(doc(db, 'channels', 'private-alice', 'messages', 'visible'), {
        senderId: 'alice', content: 'Visible only to Alice.'
      }),
      setDoc(doc(db, 'channels', 'private-bob', 'messages', 'hidden'), {
        senderId: 'bob', content: 'Hidden from Alice.'
      }),
      setDoc(doc(db, 'channels', 'private-bob', 'messages', 'hidden', 'replies', 'hidden-reply'), {
        senderId: 'bob', content: 'Also hidden from Alice.'
      }),
      setDoc(doc(db, 'conversations', 'alice__bob'), {
        participantIds: ['alice', 'bob'], lastMessagePreview: 'Private conversation'
      }),
      setDoc(doc(db, 'conversations', 'alice__bob', 'messages', 'dm-message'), {
        senderId: 'alice', content: 'Private DM.'
      }),
      setDoc(doc(db, 'conversations', 'alice__bob', 'messages', 'dm-message', 'replies', 'dm-reply'), {
        senderId: 'bob', content: 'Private DM reply.'
      })
    ]);
  });

  aliceDb = testEnvironment.authenticatedContext('alice', {
    firebase: { sign_in_provider: 'github.com' }
  }).firestore();
});

after(async () => {
  await testEnvironment?.cleanup();
});

test('allows the public channel listener query', async () => {
  const read = getDocs(query(
    collection(aliceDb, 'channels'),
    where('type', '==', 'public'),
    orderBy('sort', 'asc')
  ));

  const snapshot = await allowed(read);
  assert.deepEqual(ids(snapshot), ['announcements', 'public-room']);
});

test('allows the membership channel listener query', async () => {
  const read = getDocs(query(
    collection(aliceDb, 'channels'),
    where('memberIds', 'array-contains', 'alice'),
    orderBy('sort', 'asc')
  ));

  const snapshot = await allowed(read);
  assert.deepEqual(ids(snapshot), ['private-alice']);
});

test('excludes and denies an unauthorized private channel', async () => {
  await assertSucceeds(getDoc(doc(aliceDb, 'channels', 'private-alice')));

  const membershipRead = getDocs(query(
    collection(aliceDb, 'channels'),
    where('memberIds', 'array-contains', 'alice'),
    orderBy('sort', 'asc')
  ));
  const snapshot = await allowed(membershipRead);

  assert.ok(!ids(snapshot).includes('private-bob'));
  await assertFails(getDoc(doc(aliceDb, 'channels', 'private-bob')));
});

test('denies an unrestricted channel query', async () => {
  await assertFails(getDocs(collection(aliceDb, 'channels')));
});

test('allows staff posting in announcements while denying a normal member', async () => {
  const staffDb = testEnvironment.authenticatedContext('staffer', {
    firebase: { sign_in_provider: 'github.com' }
  }).firestore();

  await assertFails(addDoc(collection(aliceDb, 'channels', 'announcements', 'messages'), {
    senderId: 'alice', content: 'A normal member cannot publish here.', signalType: 'message'
  }));
  await assertSucceeds(addDoc(collection(staffDb, 'channels', 'announcements', 'messages'), {
    senderId: 'staffer', content: 'Official cohort update.', signalType: 'update'
  }));
});

test('permits GitHub self-enrolment only while the Firestore workspace is open', async () => {
  const charlieDb = testEnvironment.authenticatedContext('charlie', {
    firebase: { sign_in_provider: 'github.com' }
  }).firestore();
  const danaDb = testEnvironment.authenticatedContext('dana', {
    firebase: { sign_in_provider: 'github.com' }
  }).firestore();
  const erinDb = testEnvironment.authenticatedContext('erin', {
    firebase: { sign_in_provider: 'github.com' }
  }).firestore();
  const passwordDb = testEnvironment.authenticatedContext('password-user', {
    firebase: { sign_in_provider: 'password' }
  }).firestore();

  await assertSucceeds(setDoc(doc(charlieDb, 'members', 'charlie'), {
    uid: 'charlie', active: true, role: 'member'
  }));
  await assertFails(setDoc(doc(charlieDb, 'members', 'eve'), {
    uid: 'eve', active: true, role: 'member'
  }));
  await assertFails(updateDoc(doc(charlieDb, 'members', 'charlie'), { role: 'admin' }));
  await assertFails(updateDoc(doc(charlieDb, 'members', 'charlie'), { active: false }));
  await assertFails(setDoc(doc(aliceDb, 'settings', 'workspace'), {
    accessMode: 'open', cohortCapacity: 65, workspaceName: 'Hult Cohort'
  }));
  await assertFails(setDoc(doc(passwordDb, 'members', 'password-user'), {
    uid: 'password-user', active: true, role: 'member'
  }));

  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await updateDoc(doc(context.firestore(), 'settings', 'workspace'), { accessMode: 'request' });
  });
  await assertFails(setDoc(doc(danaDb, 'members', 'dana'), {
    uid: 'dana', active: true, role: 'member'
  }));

  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await deleteDoc(doc(context.firestore(), 'settings', 'workspace'));
  });
  await assertFails(setDoc(doc(erinDb, 'members', 'erin'), {
    uid: 'erin', active: true, role: 'member'
  }));

  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'settings', 'workspace'), {
      accessMode: 'open', cohortCapacity: 65, workspaceName: 'Hult Cohort'
    });
  });
});

test('preserves private child-message and DM isolation without a staff or admin bypass', async () => {
  const malloryDb = testEnvironment.authenticatedContext('mallory', {
    firebase: { sign_in_provider: 'github.com' }
  }).firestore();
  const staffDb = testEnvironment.authenticatedContext('staffer', {
    firebase: { sign_in_provider: 'github.com' }
  }).firestore();

  await assertSucceeds(getDoc(doc(aliceDb, 'channels', 'private-alice', 'messages', 'visible')));
  await assertFails(getDoc(doc(aliceDb, 'channels', 'private-bob', 'messages', 'hidden')));
  await assertFails(getDoc(doc(aliceDb, 'channels', 'private-bob', 'messages', 'hidden', 'replies', 'hidden-reply')));
  await assertFails(getDoc(doc(staffDb, 'channels', 'private-bob')));

  await assertSucceeds(getDoc(doc(aliceDb, 'conversations', 'alice__bob')));
  await assertSucceeds(getDoc(doc(aliceDb, 'conversations', 'alice__bob', 'messages', 'dm-message')));
  await assertSucceeds(getDoc(doc(aliceDb, 'conversations', 'alice__bob', 'messages', 'dm-message', 'replies', 'dm-reply')));
  await assertFails(getDoc(doc(staffDb, 'conversations', 'alice__bob')));
  await assertFails(getDoc(doc(malloryDb, 'conversations', 'alice__bob')));
  await assertFails(getDoc(doc(malloryDb, 'conversations', 'alice__bob', 'messages', 'dm-message')));
  await assertFails(getDoc(doc(malloryDb, 'conversations', 'alice__bob', 'messages', 'dm-message', 'replies', 'dm-reply')));
});

test('denies a new message carrying an attachment payload', async () => {
  await assertFails(addDoc(collection(aliceDb, 'channels', 'public-room', 'messages'), {
    senderId: 'alice',
    senderName: 'Alice',
    senderHandle: 'alice',
    senderRole: 'member',
    content: 'This must not create an attachment.',
    signalType: 'message',
    attachment: { storagePath: 'channel-attachments/public-room/alice/proof.txt' },
    task: null,
    reactions: {},
    threadCount: 0,
    clientCreatedAt: Date.now()
  }));
});

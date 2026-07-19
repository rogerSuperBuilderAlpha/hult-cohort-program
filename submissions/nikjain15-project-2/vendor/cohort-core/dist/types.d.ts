/**
 * Shared, app-agnostic types for the cohort apps.
 *
 * Rally's rich domain types (Channel, Message, Recognition, …) live here too so that app
 * code AND the Firestore rules tests share one definition — the rules are the load-bearing
 * security surface, and a drifting type would let a test assert against a shape the app
 * never writes. Keep this UI-free.
 */
/** A cohort participant. Identity is the GitHub login (never derived from an email). */
export type CohortHandle = string;
/** Firestore Timestamp-ish: milliseconds since epoch. Serialisable across boundaries. */
export type Millis = number;
export interface Profile {
    uid: string;
    handle: CohortHandle;
    displayName: string;
    avatarUrl: string | null;
    githubLogin: string | null;
    createdAt: Millis;
}
export type ChannelKind = 'channel' | 'dm';
export interface Channel {
    id: string;
    slug: string;
    name: string;
    kind: ChannelKind;
    isPrivate: boolean;
    memberUids: string[];
    createdAt: Millis;
}
export interface Message {
    id: string;
    channelId: string;
    authorUid: string;
    body: string;
    parentId: string | null;
    createdAt: Millis;
    editedAt: Millis | null;
}
export type CommitmentStatus = 'open' | 'done' | 'missed';
export interface Commitment {
    id: string;
    authorUid: string;
    toUid: string | null;
    sourceMsgRef: string;
    text: string;
    dueAt: Millis | null;
    status: CommitmentStatus;
    pmTaskUrl: string | null;
    createdAt: Millis;
}
export type RecognitionStatus = 'suggested' | 'confirmed' | 'declined';
export interface Recognition {
    id: string;
    helperUid: string;
    helpedUid: string;
    sourceMsgRef: string;
    kind: string;
    status: RecognitionStatus;
    points: number;
    createdAt: Millis;
}
/** Append-only. Written only by admin routes — clients can never create these. */
export interface XpEvent {
    id: string;
    profileUid: string;
    source: string;
    refId: string;
    points: number;
    createdAt: Millis;
}
export type PulseVerb = 'recognition_confirmed' | 'commitment_kept' | 'quest_done' | 'joined';
export interface PulseEvent {
    id: string;
    actorUid: string;
    verb: PulseVerb;
    object: string;
    points: number;
    createdAt: Millis;
}

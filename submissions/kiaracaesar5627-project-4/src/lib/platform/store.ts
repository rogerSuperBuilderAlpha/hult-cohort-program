import { SITE, siteUrl } from "@/lib/site";

/** Stable seed so cold starts keep the same registered app. */
export const SEEDED_APP = {
  app_id: process.env.LUDWITT_APP_ID?.trim() || "7f3e9c2a-4b1d-4e8f-9a6c-2d5e8f1a3b7c",
  api_key:
    process.env.LUDWITT_APP_API_KEY?.trim() ||
    "app_pf7f3e9c2a4b1d4e8f9a6c2d5e8f1a3b7c",
  jwt_secret:
    process.env.LUDWITT_JWT_SECRET?.trim() ||
    "pf-jwt-summer26-kiaracaesar5627-pattern-forge",
  title: SITE.name,
  description: SITE.description,
  topic: SITE.topic,
  launch_url: `${siteUrl()}/launch`,
  repo_url: `https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/tree/participants/summer26/phase-2-learning-app/${SITE.handle}/submissions/${SITE.handle}-project-4`,
  icon_url: `${siteUrl()}/icon`,
  student_handle: process.env.LUDWITT_STUDENT_HANDLE?.trim() || SITE.handle,
  status: "approved" as const,
};

export const DEV_KEYS = {
  sandbox: "sandbox_key_demo",
  production: process.env.LUDWITT_DEV_KEY?.trim() || "prod_key_demo",
} as const;

export type LearningEventName =
  | "lesson_started"
  | "lesson_completed"
  | "quiz_submitted"
  | "session_heartbeat";

export type AppRecord = {
  app_id: string;
  developer_id: string;
  api_key: string;
  jwt_secret: string;
  title: string;
  description: string;
  topic: string;
  launch_url: string;
  repo_url: string;
  icon_url?: string;
  student_handle: string;
  status: string;
};

export type StoredEvent = {
  app_id: string;
  event: LearningEventName;
  user_id: string;
  session_id: string;
  metadata?: Record<string, unknown>;
  ts: number;
  sandbox: boolean;
};

type Developer = {
  id: string;
  handle: string;
  api_key: string;
  sandbox: boolean;
};

type StoreShape = {
  developers: Map<string, Developer>;
  apps: Map<string, AppRecord>;
  events: StoredEvent[];
  blockedUserIds: Set<string>;
};

declare global {
  var __patternForgeLudwittStore: StoreShape | undefined;
}

function createStore(): StoreShape {
  const developers = new Map<string, Developer>();
  developers.set(DEV_KEYS.sandbox, {
    id: "dev-sandbox",
    handle: SEEDED_APP.student_handle,
    api_key: DEV_KEYS.sandbox,
    sandbox: true,
  });
  developers.set(DEV_KEYS.production, {
    id: "dev-prod",
    handle: SEEDED_APP.student_handle,
    api_key: DEV_KEYS.production,
    sandbox: false,
  });

  const apps = new Map<string, AppRecord>();
  apps.set(SEEDED_APP.app_id, {
    app_id: SEEDED_APP.app_id,
    developer_id: "dev-prod",
    api_key: SEEDED_APP.api_key,
    jwt_secret: SEEDED_APP.jwt_secret,
    title: SEEDED_APP.title,
    description: SEEDED_APP.description,
    topic: SEEDED_APP.topic,
    launch_url: SEEDED_APP.launch_url,
    repo_url: SEEDED_APP.repo_url,
    icon_url: SEEDED_APP.icon_url,
    student_handle: SEEDED_APP.student_handle,
    status: SEEDED_APP.status,
  });

  return {
    developers,
    apps,
    events: [],
    blockedUserIds: new Set(["cohort-member-1", "cohort-member-2"]),
  };
}

export function getStore(): StoreShape {
  if (!globalThis.__patternForgeLudwittStore) {
    globalThis.__patternForgeLudwittStore = createStore();
  }
  return globalThis.__patternForgeLudwittStore;
}

export function authenticateDeveloper(apiKey: string): Developer | null {
  return getStore().developers.get(apiKey) || null;
}

export function registerApp(
  developerId: string,
  meta: Omit<AppRecord, "app_id" | "developer_id" | "api_key" | "jwt_secret" | "status"> & {
    status?: string;
  },
): { app_id: string; api_key: string; jwt_secret: string } {
  const store = getStore();
  // Re-registering Pattern Forge returns the seeded credentials (idempotent).
  if (meta.title === SEEDED_APP.title) {
    const existing = store.apps.get(SEEDED_APP.app_id)!;
    existing.launch_url = meta.launch_url;
    existing.repo_url = meta.repo_url;
    existing.description = meta.description;
    existing.topic = meta.topic;
    if (meta.icon_url) existing.icon_url = meta.icon_url;
    return {
      app_id: existing.app_id,
      api_key: existing.api_key,
      jwt_secret: existing.jwt_secret,
    };
  }

  const app_id = crypto.randomUUID();
  const api_key = `app_${crypto.randomUUID().replace(/-/g, "")}`;
  const jwt_secret = crypto.randomUUID();
  const record: AppRecord = {
    app_id,
    developer_id: developerId,
    api_key,
    jwt_secret,
    status: meta.status || "pending_review",
    title: meta.title,
    description: meta.description,
    topic: meta.topic,
    launch_url: meta.launch_url,
    repo_url: meta.repo_url,
    icon_url: meta.icon_url,
    student_handle: meta.student_handle,
  };
  store.apps.set(app_id, record);
  return { app_id, api_key, jwt_secret };
}

export function getApp(appId: string): AppRecord | null {
  return getStore().apps.get(appId) || null;
}

export function isBlockedUser(userId: string, studentHandle: string): boolean {
  const normalizedUser = String(userId ?? "").trim().toLowerCase();
  if (!normalizedUser) return false;
  const store = getStore();
  if (store.blockedUserIds.has(normalizedUser)) return true;
  const normalizedHandle = String(studentHandle ?? "").trim().toLowerCase();
  if (!normalizedHandle) return false;
  return normalizedUser === normalizedHandle;
}

const QUALIFYING = new Set<LearningEventName>([
  "lesson_started",
  "lesson_completed",
  "quiz_submitted",
]);

export function recordEvent(
  appId: string,
  payload: {
    event: LearningEventName;
    user_id: string;
    session_id: string;
    metadata?: Record<string, unknown>;
    sandbox: boolean;
  },
): void {
  if (payload.sandbox) return;
  getStore().events.push({
    app_id: appId,
    event: payload.event,
    user_id: payload.user_id,
    session_id: payload.session_id,
    metadata: payload.metadata,
    ts: Date.now(),
    sandbox: false,
  });
}

export function getMetrics(appId: string): {
  unique_users: number;
  qualified_users: number;
  as_of: string;
} {
  const appEvents = getStore().events.filter((e) => e.app_id === appId);
  const users = new Set(appEvents.map((e) => e.user_id));
  const qualified = new Set(
    appEvents.filter((e) => QUALIFYING.has(e.event)).map((e) => e.user_id),
  );
  return {
    unique_users: users.size,
    qualified_users: qualified.size,
    as_of: new Date().toISOString(),
  };
}

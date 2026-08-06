export const SESSION_COOKIE = 'climate_learn_session';

export type LaunchPayload = {
  sub: string;
  email: string;
  app_id: string;
};

export type LearnerSession = LaunchPayload & {
  sessionId: string;
};

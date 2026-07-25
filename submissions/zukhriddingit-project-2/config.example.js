window.RELAY_CONFIG = {
  appName: "Relay 65",
  workspaceName: "Hult Cohort",
  cohortLabel: "Summer Pilot 2026",
  cohortCapacity: 65,
  ownerGithubHandle: "zukhriddingit",
  accessMode: "open", // only used by staff starter seeding; Firestore settings/workspace is the live enrollment gate
  demoMode: false,
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  },
  pmPlatform: {
    name: "Winning PM platform",
    baseUrl: "https://YOUR-PM-APP.example",
    boardUrl: "https://YOUR-PM-APP.example/projects/week-2"
  },
  cohortProjectUrl: "https://cohorts.algorithmacy.org/program/phase-1-project-2#overview",
  deadlineIso: "2026-07-26T17:00:00-04:00",
  firebaseSdkVersion: "12.16.0",
  attachmentsEnabled: false
};

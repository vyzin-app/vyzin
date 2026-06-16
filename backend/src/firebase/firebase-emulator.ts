/** Returns true when Firebase Admin should talk to local emulators. */
export function isFirebaseEmulatorEnabled(): boolean {
  return Boolean(
    process.env.FIRESTORE_EMULATOR_HOST ||
      process.env.FIREBASE_AUTH_EMULATOR_HOST,
  );
}

export function resolveFirebaseProjectId(): string {
  return process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID ?? 'vyzin-app';
}

/** Base URL for Identity Toolkit REST (login). Uses Auth emulator when configured. */
export function resolveIdentityToolkitBaseUrl(): string {
  const authEmulator = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  if (authEmulator) {
    return `http://${authEmulator}/identitytoolkit.googleapis.com`;
  }
  return 'https://identitytoolkit.googleapis.com';
}

/** Web API key for signInWithPassword. Emulator accepts any key. */
export function resolveFirebaseWebApiKey(): string | undefined {
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    return process.env.FIREBASE_WEB_API_KEY ?? 'fake-api-key';
  }
  return process.env.FIREBASE_WEB_API_KEY;
}

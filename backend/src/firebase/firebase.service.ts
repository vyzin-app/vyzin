import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import {
  isFirebaseEmulatorEnabled,
  resolveFirebaseProjectId,
} from './firebase-emulator';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  onModuleInit() {
    if (admin.apps.length) {
      return;
    }

    if (isFirebaseEmulatorEnabled()) {
      admin.initializeApp({ projectId: resolveFirebaseProjectId() });
      this.logger.warn(
        `Firebase emulators ativos — Firestore=${process.env.FIRESTORE_EMULATOR_HOST ?? 'off'}, Auth=${process.env.FIREBASE_AUTH_EMULATOR_HOST ?? 'off'}`,
      );
      return;
    }

    admin.initializeApp({
      credential: this.resolveCredential(),
    });
    this.logger.log('Firebase Admin initialized (producao)');
  }

  getFirestore(): admin.firestore.Firestore {
    return admin.firestore();
  }

  getAuth(): admin.auth.Auth {
    return admin.auth();
  }

  private resolveCredential(): admin.credential.Credential {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      return admin.credential.applicationDefault();
    }

    const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (inline) {
      const parsed = JSON.parse(inline) as admin.ServiceAccount;
      return admin.credential.cert(parsed);
    }

    const localPath = path.join(process.cwd(), 'firebase-key.json');
    if (fs.existsSync(localPath)) {
      const raw = fs.readFileSync(localPath, 'utf8');
      const parsed = JSON.parse(raw) as admin.ServiceAccount;
      return admin.credential.cert(parsed);
    }

    throw new Error(
      'Firebase: set GOOGLE_APPLICATION_CREDENTIALS, FIREBASE_SERVICE_ACCOUNT_JSON, or add firebase-key.json under the backend folder. Para desenvolvimento local use os emuladores (npm run emulators).',
    );
  }
}

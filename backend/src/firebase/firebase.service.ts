import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  onModuleInit() {
    if (admin.apps.length) {
      return;
    }
    admin.initializeApp({
      credential: this.resolveCredential(),
    });
    this.logger.log('Firebase Admin initialized');
  }

  getFirestore(): admin.firestore.Firestore {
    return admin.firestore();
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
      'Firebase: set GOOGLE_APPLICATION_CREDENTIALS, FIREBASE_SERVICE_ACCOUNT_JSON, or add firebase-key.json under the backend folder.',
    );
  }
}

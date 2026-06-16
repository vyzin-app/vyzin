import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import {
  resolveFirebaseWebApiKey,
  resolveIdentityToolkitBaseUrl,
} from 'src/firebase/firebase-emulator';
import { SESSION_EXPIRES_MS } from '../constants/session.constants';

interface FirebaseSignInResponse {
  idToken?: string;
  localId?: string;
  error?: { message?: string };
}

@Injectable()
export class AuthSessionService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ sessionCookie: string; expiresIn: number; uid: string }> {
    const idToken = await this.signInWithPassword(email, password);
    const sessionCookie = await this.firebaseService
      .getAuth()
      .createSessionCookie(idToken, { expiresIn: SESSION_EXPIRES_MS / 1000 });

    const decoded = await this.firebaseService
      .getAuth()
      .verifyIdToken(idToken);

    return {
      sessionCookie,
      expiresIn: SESSION_EXPIRES_MS,
      uid: decoded.uid,
    };
  }

  async logout(sessionCookie?: string): Promise<void> {
    if (!sessionCookie) {
      return;
    }

    try {
      const decoded = await this.firebaseService
        .getAuth()
        .verifySessionCookie(sessionCookie);
      await this.firebaseService.getAuth().revokeRefreshTokens(decoded.sub);
    } catch {
      // Cookie already invalid or expired — nothing to revoke.
    }
  }

  private async signInWithPassword(
    email: string,
    password: string,
  ): Promise<string> {
    const apiKey = resolveFirebaseWebApiKey();
    if (!apiKey) {
      throw new InternalServerErrorException(
        'FIREBASE_WEB_API_KEY nao configurada no backend.',
      );
    }

    const baseUrl = resolveIdentityToolkitBaseUrl();
    const response = await fetch(
      `${baseUrl}/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      },
    );

    const data = (await response.json()) as FirebaseSignInResponse;

    if (!response.ok || !data.idToken) {
      throw new UnauthorizedException(this.mapSignInError(data));
    }

    return data.idToken;
  }

  private mapSignInError(data: FirebaseSignInResponse): string {
    const message = data.error?.message ?? '';

    if (
      message.includes('INVALID_PASSWORD') ||
      message.includes('EMAIL_NOT_FOUND') ||
      message.includes('INVALID_LOGIN_CREDENTIALS')
    ) {
      return 'E-mail ou senha incorretos.';
    }
    if (message.includes('USER_DISABLED')) {
      return 'Esta conta foi desativada.';
    }
    if (message.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
      return 'Muitas tentativas. Tente novamente mais tarde.';
    }
    if (message.includes('INVALID_EMAIL')) {
      return 'E-mail invalido.';
    }

    return 'Nao foi possivel entrar. Tente novamente.';
  }
}

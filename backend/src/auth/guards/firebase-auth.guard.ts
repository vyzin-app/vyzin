import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FirebaseService } from 'src/firebase/firebase.service';
import { SESSION_COOKIE_NAME } from '../constants/session.constants';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedRequest } from '../types/authenticated-user';

/** Verifies Firebase session cookie or ID token and attaches the user to the request. */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly firebaseService: FirebaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const sessionCookie = request.cookies?.[SESSION_COOKIE_NAME];
    if (sessionCookie) {
      try {
        const decoded = await this.firebaseService
          .getAuth()
          .verifySessionCookie(sessionCookie, true);
        request.user = {
          uid: decoded.uid,
          email: decoded.email,
          functions: [],
        };
        return true;
      } catch {
        throw new UnauthorizedException('Sessao invalida ou expirada.');
      }
    }

    const token = this.extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Token de autenticacao ausente.');
    }

    try {
      if (process.env.NODE_ENV === 'test' && token.startsWith('test:')) {
        const profileId = token.replace('test:', '').trim();
        request.user = {
          uid: `uid-${profileId}`,
          email: `${profileId}@test.com`,
          profileId,
          functions: [],
        };
        return true;
      }

      const decoded = await this.firebaseService.getAuth().verifyIdToken(token);
      request.user = {
        uid: decoded.uid,
        email: decoded.email,
        functions: [],
      };
      return true;
    } catch {
      throw new UnauthorizedException('Token invalido ou expirado.');
    }
  }

  private extractBearerToken(
    request: AuthenticatedRequest,
  ): string | undefined {
    const header = request.headers.authorization;
    if (!header) {
      return undefined;
    }
    const [type, token] = header.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}

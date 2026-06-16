import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../src/auth/decorators/public.decorator';
import type { AuthenticatedRequest } from '../../src/auth/types/authenticated-user';
import { ALL_FUNCTIONS, AppFunction } from '../../src/auth/functions/app-functions';

/** Parses `Authorization: Bearer test:<profileId>` for automated tests. */
@Injectable()
export class TestAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer test:')) {
      throw new UnauthorizedException('Use Bearer test:<profileId> in tests.');
    }

    const profileId = header.replace('Bearer test:', '').trim();
    const uid = `uid-${profileId}`;

    request.user = {
      uid,
      email: `${profileId}@test.com`,
      profileId,
      functions: profileFunctions(profileId),
    };
    return true;
  }
}

function profileFunctions(profileId: string): AppFunction[] {
  if (profileId === 'admin') {
    return ALL_FUNCTIONS;
  }
  if (profileId === 'doorman') {
    return [
      AppFunction.RESERVATIONS_READ,
      AppFunction.VISITORS_READ,
      AppFunction.VISITORS_MANAGE,
      AppFunction.VISITORS_WORKFLOW,
      AppFunction.ANNOUNCEMENTS_READ,
      AppFunction.INFORMATION_READ,
      AppFunction.USERS_READ,
      AppFunction.USERS_MANAGE,
      AppFunction.REPORTS_READ,
    ];
  }
  return [
    AppFunction.RESERVATIONS_READ,
    AppFunction.RESERVATIONS_MANAGE,
    AppFunction.VISITORS_READ,
    AppFunction.VISITORS_MANAGE,
    AppFunction.ANNOUNCEMENTS_READ,
    AppFunction.INFORMATION_READ,
    AppFunction.REPORTS_READ,
  ];
}

export function authHeader(profileId: string): string {
  return `Bearer test:${profileId}`;
}

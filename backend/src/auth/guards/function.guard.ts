import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProfilesService } from 'src/profiles/services/profiles.service';
import { UsersService } from 'src/users/services/users.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { REQUIRED_FUNCTIONS_KEY } from '../decorators/require-function.decorator';
import { AppFunction } from '../functions/app-functions';
import { AuthenticatedRequest } from '../types/authenticated-user';

/**
 * Resolves the caller's profile from Firestore (users + profiles), attaches
 * functions to the request, and enforces `@RequireFunction`.
 */
@Injectable()
export class FunctionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly profilesService: ProfilesService,
    private readonly usersService: UsersService,
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
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Usuario nao autenticado.');
    }

    try {
      const account = await this.usersService.getUserByIdInternal(user.uid);
      user.profileId = account.profileId;
      const profile = await this.profilesService.get(account.profileId);
      user.functions = profile.functions;
    } catch {
      user.functions = [];
    }

    const required =
      this.reflector.getAllAndOverride<AppFunction[]>(REQUIRED_FUNCTIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (required.length === 0) {
      return true;
    }

    const hasAll = required.every((fn) => user.functions.includes(fn));
    if (!hasAll) {
      throw new ForbiddenException(
        'Seu perfil nao tem permissao para esta acao.',
      );
    }
    return true;
  }
}

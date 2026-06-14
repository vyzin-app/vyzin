import { Controller, Get, UnauthorizedException } from '@nestjs/common';
import { ProfilesService } from 'src/profiles/services/profiles.service';
import { UsersService } from 'src/users/services/users.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { AuthenticatedUser } from '../types/authenticated-user';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly profilesService: ProfilesService,
  ) {}

  /** Returns the logged-in user's profile data + the functions they can perform. */
  @Get('me')
  async me(@CurrentUser() current: AuthenticatedUser | undefined) {
    if (!current) {
      throw new UnauthorizedException();
    }
    const user = await this.usersService.getUserByIdInternal(current.uid);
    const profile = await this.profilesService.get(user.profileId);
    return { user, profile };
  }
}

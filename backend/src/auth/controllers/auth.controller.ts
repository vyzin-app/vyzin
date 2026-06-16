import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ProfilesService } from 'src/profiles/services/profiles.service';
import { UsersService } from 'src/users/services/users.service';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  SESSION_COOKIE_NAME,
} from '../constants/session.constants';
import { LoginDto } from '../dto/login.dto';
import { AuthSessionService } from '../services/auth-session.service';
import type { AuthenticatedUser } from '../types/authenticated-user';
import { ApiSecured } from '../../swagger/api-secured.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly profilesService: ProfilesService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  /** Authenticates via Firebase (server-side) and sets an httpOnly session cookie. */
  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login com e-mail e senha (define cookie vyzin_session)' })
  @ApiOkResponse({ description: 'Usuário, perfil e funções RBAC' })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { sessionCookie, expiresIn, uid } =
      await this.authSessionService.login(body.email, body.password);

    this.setSessionCookie(res, sessionCookie, expiresIn);
    return this.buildMeResponse(uid);
  }

  /** Clears the session cookie and revokes Firebase refresh tokens. */
  @Public()
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Encerra sessão e limpa cookie' })
  @ApiOkResponse({ description: 'Sessão encerrada' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authSessionService.logout(req.cookies?.[SESSION_COOKIE_NAME]);
    this.clearSessionCookie(res);
    return { ok: true };
  }

  /** Returns the logged-in user's profile data + the functions they can perform. */
  @Get('me')
  @ApiSecured()
  @ApiOperation({ summary: 'Dados do usuário logado e perfil' })
  @ApiOkResponse({ description: 'Usuário, perfil e funções RBAC' })
  async me(@CurrentUser() current: AuthenticatedUser | undefined) {
    if (!current) {
      throw new UnauthorizedException();
    }
    return this.buildMeResponse(current.uid);
  }

  private async buildMeResponse(uid: string) {
    const user = await this.usersService.getUserByIdInternal(uid);
    const profile = await this.profilesService.get(user.profileId);
    return { user, profile };
  }

  private setSessionCookie(res: Response, value: string, maxAge: number) {
    res.cookie(SESSION_COOKIE_NAME, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });
  }

  private clearSessionCookie(res: Response) {
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  }
}

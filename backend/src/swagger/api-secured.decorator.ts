import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { SESSION_COOKIE_NAME } from '../auth/constants/session.constants';
import { BEARER_AUTH_SCHEME } from './swagger.constants';

/** Documents that the route accepts session cookie or Bearer token. */
export function ApiSecured() {
  return applyDecorators(
    ApiCookieAuth(SESSION_COOKIE_NAME),
    ApiBearerAuth(BEARER_AUTH_SCHEME),
  );
}

import { SetMetadata } from '@nestjs/common';
import { AppFunction } from '../functions/app-functions';

export const REQUIRED_FUNCTIONS_KEY = 'requiredFunctions';

/**
 * Declares which application functions a route requires. The FunctionGuard
 * grants access when the caller's profile contains ALL listed functions.
 */
export const RequireFunction = (...functions: AppFunction[]) =>
  SetMetadata(REQUIRED_FUNCTIONS_KEY, functions);

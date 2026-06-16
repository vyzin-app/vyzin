import { Request } from 'express';
import { AppFunction } from '../functions/app-functions';

/** Shape attached to `request.user` after the auth + function guards run. */
export interface AuthenticatedUser {
  uid: string;
  email?: string;
  profileId?: string;
  functions: AppFunction[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

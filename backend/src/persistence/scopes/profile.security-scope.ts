import { Injectable } from '@nestjs/common';
import type { Profile } from '../../profiles/entities/profile.entity';
import { OpenSecurityScope } from './open.security-scope';

/** Profiles are admin-managed; RBAC on controllers is sufficient. */
@Injectable()
export class ProfileSecurityScope extends OpenSecurityScope<Profile> {}

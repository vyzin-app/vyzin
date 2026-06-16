import { Injectable } from '@nestjs/common';
import type { Announcement } from '../../mural/entities/announcement.entity';
import { OpenSecurityScope } from './open.security-scope';

/** Bulletin board: all authenticated readers see every announcement. */
@Injectable()
export class AnnouncementSecurityScope extends OpenSecurityScope<Announcement> {}

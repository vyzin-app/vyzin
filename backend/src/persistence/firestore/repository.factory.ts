import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import type { Announcement } from '../../mural/entities/announcement.entity';
import type { CondoInformation } from '../../informacoes/entities/condo-information.entity';
import type { PreAuthorization } from '../../pre-authorizations/entities/pre-authorization.entity';
import type { Profile } from '../../profiles/entities/profile.entity';
import type { Reservation } from '../../reservas/entities/reservations.entity';
import type { User } from '../../users/entities/user.entity';
import type { Visitor } from '../../visitantes/entities/visitor.entity';
import {
  ANNOUNCEMENT_COLLECTION,
  INFORMATION_COLLECTION,
  PRE_AUTHORIZATION_COLLECTION,
  PROFILE_COLLECTION,
  RESERVATION_COLLECTION,
  USER_COLLECTION,
  VISITOR_COLLECTION,
} from '../collections';
import type { AccessContext } from '../interfaces/access-context.interface';
import type { CollectionDefinition } from '../interfaces/collection-definition.interface';
import type { ISecurityScope } from '../interfaces/security-scope.interface';
import { AnnouncementSecurityScope } from '../scopes/announcement.security-scope';
import { PreAuthorizationSecurityScope } from '../scopes/pre-authorization.security-scope';
import { ProfileSecurityScope } from '../scopes/profile.security-scope';
import { ReservationSecurityScope } from '../scopes/reservation.security-scope';
import { UserSecurityScope } from '../scopes/user.security-scope';
import { VisitorSecurityScope } from '../scopes/visitor.security-scope';
import { FirestoreRepository } from './firestore.repository';
import { ScopedRepository } from './scoped.repository';

/**
 * Factory (Abstract Factory pattern) — builds entity-oriented repositories
 * with the correct converter and security scope.
 */
@Injectable()
export class RepositoryFactory {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly reservationScope: ReservationSecurityScope,
    private readonly visitorScope: VisitorSecurityScope,
    private readonly announcementScope: AnnouncementSecurityScope,
    private readonly userScope: UserSecurityScope,
    private readonly profileScope: ProfileSecurityScope,
    private readonly preAuthorizationScope: PreAuthorizationSecurityScope,
  ) {}

  reservations(context: AccessContext): ScopedRepository<Reservation> {
    return this.scoped(RESERVATION_COLLECTION, this.reservationScope, context);
  }

  reservationsUnscoped(): FirestoreRepository<Reservation> {
    return this.unscoped(RESERVATION_COLLECTION);
  }

  visitors(context: AccessContext): ScopedRepository<Visitor> {
    return this.scoped(VISITOR_COLLECTION, this.visitorScope, context);
  }

  visitorsUnscoped(): FirestoreRepository<Visitor> {
    return this.unscoped(VISITOR_COLLECTION);
  }

  announcements(context: AccessContext): ScopedRepository<Announcement> {
    return this.scoped(
      ANNOUNCEMENT_COLLECTION,
      this.announcementScope,
      context,
    );
  }

  announcementsUnscoped(): FirestoreRepository<Announcement> {
    return this.unscoped(ANNOUNCEMENT_COLLECTION);
  }

  users(context: AccessContext): ScopedRepository<User> {
    return this.scoped(USER_COLLECTION, this.userScope, context);
  }

  usersUnscoped(): FirestoreRepository<User> {
    return this.unscoped(USER_COLLECTION);
  }

  profiles(context: AccessContext): ScopedRepository<Profile> {
    return this.scoped(PROFILE_COLLECTION, this.profileScope, context);
  }

  profilesUnscoped(): FirestoreRepository<Profile> {
    return this.unscoped(PROFILE_COLLECTION);
  }

  informationUnscoped(): FirestoreRepository<CondoInformation> {
    return this.unscoped(INFORMATION_COLLECTION);
  }

  preAuthorizations(context: AccessContext): ScopedRepository<PreAuthorization> {
    return this.scoped(
      PRE_AUTHORIZATION_COLLECTION,
      this.preAuthorizationScope,
      context,
    );
  }

  preAuthorizationsUnscoped(): FirestoreRepository<PreAuthorization> {
    return this.unscoped(PRE_AUTHORIZATION_COLLECTION);
  }

  private unscoped<T>(
    definition: CollectionDefinition<T>,
  ): FirestoreRepository<T> {
    return new FirestoreRepository(this.firebaseService, definition);
  }

  private scoped<T>(
    definition: CollectionDefinition<T>,
    scope: ISecurityScope<T>,
    context: AccessContext,
  ): ScopedRepository<T> {
    return new ScopedRepository(
      new FirestoreRepository(this.firebaseService, definition),
      scope,
      context,
    );
  }
}

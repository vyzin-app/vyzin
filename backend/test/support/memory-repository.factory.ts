import { Injectable } from '@nestjs/common';
import type { Announcement } from '../../src/mural/entities/announcement.entity';
import type { CondoInformation } from '../../src/informacoes/entities/condo-information.entity';
import type { PreAuthorization } from '../../src/pre-authorizations/entities/pre-authorization.entity';
import type { Profile } from '../../src/profiles/entities/profile.entity';
import type { Reservation } from '../../src/reservas/entities/reservations.entity';
import type { User } from '../../src/users/entities/user.entity';
import type { Visitor } from '../../src/visitantes/entities/visitor.entity';
import {
  ANNOUNCEMENT_COLLECTION,
  INFORMATION_COLLECTION,
  PRE_AUTHORIZATION_COLLECTION,
  PROFILE_COLLECTION,
  RESERVATION_COLLECTION,
  USER_COLLECTION,
  VISITOR_COLLECTION,
} from '../../src/persistence/collections';
import type { AccessContext } from '../../src/persistence/interfaces/access-context.interface';
import type { CollectionDefinition } from '../../src/persistence/interfaces/collection-definition.interface';
import type { ISecurityScope } from '../../src/persistence/interfaces/security-scope.interface';
import { FirestoreRepository } from '../../src/persistence/firestore/firestore.repository';
import { ScopedRepository } from '../../src/persistence/firestore/scoped.repository';
import { AnnouncementSecurityScope } from '../../src/persistence/scopes/announcement.security-scope';
import { PreAuthorizationSecurityScope } from '../../src/persistence/scopes/pre-authorization.security-scope';
import { ProfileSecurityScope } from '../../src/persistence/scopes/profile.security-scope';
import { ReservationSecurityScope } from '../../src/persistence/scopes/reservation.security-scope';
import { UserSecurityScope } from '../../src/persistence/scopes/user.security-scope';
import { VisitorSecurityScope } from '../../src/persistence/scopes/visitor.security-scope';
import { MemoryFirestoreRepository } from './memory-firestore.repository';

@Injectable()
export class MemoryRepositoryFactory {
  constructor(
    private readonly reservationScope: ReservationSecurityScope,
    private readonly visitorScope: VisitorSecurityScope,
    private readonly announcementScope: AnnouncementSecurityScope,
    private readonly userScope: UserSecurityScope,
    private readonly profileScope: ProfileSecurityScope,
    private readonly preAuthorizationScope: PreAuthorizationSecurityScope,
  ) {}

  reservations(context: AccessContext) {
    return this.scoped(RESERVATION_COLLECTION, this.reservationScope, context);
  }

  reservationsUnscoped() {
    return this.unscoped(RESERVATION_COLLECTION);
  }

  visitors(context: AccessContext) {
    return this.scoped(VISITOR_COLLECTION, this.visitorScope, context);
  }

  visitorsUnscoped() {
    return this.unscoped(VISITOR_COLLECTION);
  }

  announcements(context: AccessContext) {
    return this.scoped(
      ANNOUNCEMENT_COLLECTION,
      this.announcementScope,
      context,
    );
  }

  announcementsUnscoped() {
    return this.unscoped(ANNOUNCEMENT_COLLECTION);
  }

  users(context: AccessContext) {
    return this.scoped(USER_COLLECTION, this.userScope, context);
  }

  usersUnscoped() {
    return this.unscoped(USER_COLLECTION);
  }

  profiles(context: AccessContext) {
    return this.scoped(PROFILE_COLLECTION, this.profileScope, context);
  }

  profilesUnscoped() {
    return this.unscoped(PROFILE_COLLECTION);
  }

  informationUnscoped() {
    return this.unscoped(INFORMATION_COLLECTION);
  }

  preAuthorizations(context: AccessContext) {
    return this.scoped(
      PRE_AUTHORIZATION_COLLECTION,
      this.preAuthorizationScope,
      context,
    );
  }

  preAuthorizationsUnscoped() {
    return this.unscoped(PRE_AUTHORIZATION_COLLECTION);
  }

  private unscoped<T>(definition: CollectionDefinition<T>) {
    return new MemoryFirestoreRepository<T>(definition) as unknown as FirestoreRepository<T>;
  }

  private scoped<T>(
    definition: CollectionDefinition<T>,
    scope: ISecurityScope<T>,
    context: AccessContext,
  ) {
    return new ScopedRepository(
      new MemoryFirestoreRepository<T>(
        definition,
      ) as unknown as FirestoreRepository<T>,
      scope,
      context,
    );
  }
}

import { Global, Module } from '@nestjs/common';
import { RepositoryFactory } from './firestore/repository.factory';
import { AnnouncementSecurityScope } from './scopes/announcement.security-scope';
import { PreAuthorizationSecurityScope } from './scopes/pre-authorization.security-scope';
import { ProfileSecurityScope } from './scopes/profile.security-scope';
import { ReservationSecurityScope } from './scopes/reservation.security-scope';
import { UserSecurityScope } from './scopes/user.security-scope';
import { VisitorSecurityScope } from './scopes/visitor.security-scope';

@Global()
@Module({
  providers: [
    RepositoryFactory,
    ReservationSecurityScope,
    VisitorSecurityScope,
    AnnouncementSecurityScope,
    UserSecurityScope,
    ProfileSecurityScope,
    PreAuthorizationSecurityScope,
  ],
  exports: [RepositoryFactory],
})
export class PersistenceModule {}

import { announcementConverter } from '../mural/mappers/announcement.converter';
import { condoInformationConverter } from '../informacoes/mappers/condo-information.converter';
import { preAuthorizationConverter } from '../pre-authorizations/mappers/pre-authorization.converter';
import { profileConverter } from '../profiles/mappers/profile.converter';
import { reservationConverter } from '../reservas/mappers/reservation.converter';
import { userConverter } from '../users/mappers/user.converter';
import { visitorConverter } from '../visitantes/mappers/visitor.converter';
import type { Announcement } from '../mural/entities/announcement.entity';
import type { CondoInformation } from '../informacoes/entities/condo-information.entity';
import type { PreAuthorization } from '../pre-authorizations/entities/pre-authorization.entity';
import type { Profile } from '../profiles/entities/profile.entity';
import type { Reservation } from '../reservas/entities/reservations.entity';
import type { User } from '../users/entities/user.entity';
import type { Visitor } from '../visitantes/entities/visitor.entity';
import type { CollectionDefinition } from './interfaces/collection-definition.interface';

export const RESERVATION_COLLECTION: CollectionDefinition<Reservation> = {
  name: 'reservations',
  converter: reservationConverter,
  getId: (entity) => entity.id,
};

export const VISITOR_COLLECTION: CollectionDefinition<Visitor> = {
  name: 'visitors',
  converter: visitorConverter,
  getId: (entity) => entity.id,
};

export const ANNOUNCEMENT_COLLECTION: CollectionDefinition<Announcement> = {
  name: 'announcements',
  converter: announcementConverter,
  getId: (entity) => entity.id,
};

export const USER_COLLECTION: CollectionDefinition<User> = {
  name: 'users',
  converter: userConverter,
  getId: (entity) => entity.uid,
};

export const PROFILE_COLLECTION: CollectionDefinition<Profile> = {
  name: 'profiles',
  converter: profileConverter,
  getId: (entity) => entity.id,
};

export const INFORMATION_COLLECTION: CollectionDefinition<CondoInformation> = {
  name: 'condoInformation',
  converter: condoInformationConverter,
  getId: (entity) => entity.id,
};

export const PRE_AUTHORIZATION_COLLECTION: CollectionDefinition<PreAuthorization> =
  {
    name: 'preAuthorizations',
    converter: preAuthorizationConverter,
    getId: (entity) => entity.id,
  };

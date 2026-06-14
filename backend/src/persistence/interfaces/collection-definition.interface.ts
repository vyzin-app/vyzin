import type * as admin from 'firebase-admin';

/** Metadata required to bind an entity type to a Firestore collection. */
export interface CollectionDefinition<T> {
  name: string;
  converter: admin.firestore.FirestoreDataConverter<T>;
  getId: (entity: T) => string;
}

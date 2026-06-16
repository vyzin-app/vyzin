import * as admin from 'firebase-admin';
import { AppFunction } from '../../auth/functions/app-functions';
import { Profile } from '../entities/profile.entity';

/** Bridges the typed `Profile` domain object and the Firestore document. */
export const profileConverter: admin.firestore.FirestoreDataConverter<Profile> =
  {
    toFirestore(
      profile: admin.firestore.WithFieldValue<Profile>,
    ): admin.firestore.DocumentData {
      const data = profile as Profile;
      return {
        name: data.name,
        description: data.description,
        functions: data.functions,
        isSystem: data.isSystem,
      };
    },

    fromFirestore(snapshot: admin.firestore.QueryDocumentSnapshot): Profile {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        name: data.name as string,
        description: (data.description as string) ?? '',
        functions: (data.functions as AppFunction[]) ?? [],
        isSystem: (data.isSystem as boolean) ?? false,
      };
    },
  };

import * as admin from 'firebase-admin';
import { User } from '../entities/user.entity';

/** Bridges the typed `User` and the Firestore document (keyed by uid). */
export const userConverter: admin.firestore.FirestoreDataConverter<User> = {
  toFirestore(
    user: admin.firestore.WithFieldValue<User>,
  ): admin.firestore.DocumentData {
    const data = user as User;
    const document: admin.firestore.DocumentData = {
      name: data.name,
      email: data.email,
      cpf: data.cpf,
      phone: data.phone,
      profileId: data.profileId,
    };
    if (data.apartment !== undefined) {
      document.apartment = data.apartment;
    }
    if (data.block !== undefined) {
      document.block = data.block;
    }
    return document;
  },

  fromFirestore(snapshot: admin.firestore.QueryDocumentSnapshot): User {
    const data = snapshot.data();
    return {
      uid: snapshot.id,
      name: data.name as string,
      email: data.email as string,
      cpf: data.cpf as string,
      phone: data.phone as string,
      apartment: data.apartment as string | undefined,
      block: data.block as string | undefined,
      profileId: data.profileId as string,
    };
  },
};

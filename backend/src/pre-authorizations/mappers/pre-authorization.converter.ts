import * as admin from 'firebase-admin';
import { PreAuthorization } from '../entities/pre-authorization.entity';

export const preAuthorizationConverter: admin.firestore.FirestoreDataConverter<PreAuthorization> =
  {
    toFirestore(
      data: admin.firestore.WithFieldValue<PreAuthorization>,
    ): admin.firestore.DocumentData {
      const item = data as PreAuthorization;
      return {
        name: item.name,
        cpf: item.cpf,
        schedule: item.schedule,
        validUntil: item.validUntil,
        active: item.active,
        createdBy: item.createdBy,
      };
    },

    fromFirestore(snapshot: admin.firestore.QueryDocumentSnapshot): PreAuthorization {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        name: data.name as string,
        cpf: data.cpf as string,
        schedule: data.schedule as string,
        validUntil: data.validUntil as string,
        active: data.active as boolean,
        createdBy: (data.createdBy ?? '') as string,
      };
    },
  };

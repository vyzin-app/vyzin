import * as admin from 'firebase-admin';
import {
  CondoInformation,
  INFORMATION_DOCUMENT_ID,
} from '../entities/condo-information.entity';

export const condoInformationConverter: admin.firestore.FirestoreDataConverter<CondoInformation> =
  {
    toFirestore(
      data: admin.firestore.WithFieldValue<CondoInformation>,
    ): admin.firestore.DocumentData {
      const info = data as CondoInformation;
      return {
        contacts: info.contacts,
        rules: info.rules,
        documents: info.documents,
        address: info.address,
        notice: info.notice ?? '',
      };
    },

    fromFirestore(snapshot: admin.firestore.QueryDocumentSnapshot): CondoInformation {
      const data = snapshot.data();
      return {
        id: snapshot.id || INFORMATION_DOCUMENT_ID,
        contacts: data.contacts as CondoInformation['contacts'],
        rules: data.rules as CondoInformation['rules'],
        documents: data.documents as CondoInformation['documents'],
        address: data.address as CondoInformation['address'],
        notice: (data.notice as string) || undefined,
      };
    },
  };

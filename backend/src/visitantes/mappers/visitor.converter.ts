import * as admin from 'firebase-admin';
import {
  Visitor,
  VisitTypeEnum,
  VisitorStatusEnum,
} from '../entities/visitor.entity';

const { Timestamp } = admin.firestore;

/**
 * Bridges the typed domain `Visitor` and the raw Firestore document.
 * `date` is stored as a `Timestamp`; `id` stays out of the document body
 * (it is the document key) and `exitTime` is omitted while still undefined.
 */
export const visitorConverter: admin.firestore.FirestoreDataConverter<Visitor> =
  {
    toFirestore(
      visitor: admin.firestore.WithFieldValue<Visitor>,
    ): admin.firestore.DocumentData {
      const data = visitor as Visitor;
      const document: admin.firestore.DocumentData = {
        name: data.name,
        cpf: data.cpf,
        phone: data.phone,
        email: data.email,
        purpose: data.purpose,
        date: Timestamp.fromDate(data.date),
        time: data.time,
        notes: data.notes,
        visitType: data.visitType,
        status: data.status,
        authorizedBy: data.authorizedBy,
      };
      if (data.exitTime !== undefined) {
        document.exitTime = data.exitTime;
      }
      return document;
    },

    fromFirestore(snapshot: admin.firestore.QueryDocumentSnapshot): Visitor {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        name: data.name as string,
        cpf: data.cpf as string,
        phone: data.phone as string,
        email: data.email as string,
        purpose: data.purpose as string,
        date: (data.date as admin.firestore.Timestamp).toDate(),
        time: data.time as string,
        notes: data.notes as string,
        visitType: data.visitType as VisitTypeEnum,
        status: data.status as VisitorStatusEnum,
        authorizedBy: data.authorizedBy as string,
        exitTime: data.exitTime as string | undefined,
      };
    },
  };

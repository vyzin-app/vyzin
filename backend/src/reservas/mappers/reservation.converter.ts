import * as admin from 'firebase-admin';
import {
  Reservation,
  ReservationStatusEnum,
} from '../entities/reservations.entity';

const { Timestamp } = admin.firestore;

/**
 * Bridges the typed domain `Reservation` and the raw Firestore document.
 * Firestore stores dates as `Timestamp`, so we convert on both directions
 * and keep `id` out of the document body (it is the document key).
 */
export const reservationConverter: admin.firestore.FirestoreDataConverter<Reservation> =
  {
    toFirestore(
      reservation: admin.firestore.WithFieldValue<Reservation>,
    ): admin.firestore.DocumentData {
      const data = reservation as Reservation;
      return {
        space: data.space,
        date: Timestamp.fromDate(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
        status: data.status,
        createdBy: data.createdBy,
        linkedVisitorIds: data.linkedVisitorIds ?? [],
      };
    },

    fromFirestore(
      snapshot: admin.firestore.QueryDocumentSnapshot,
    ): Reservation {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        space: data.space as string,
        date: (data.date as admin.firestore.Timestamp).toDate(),
        startTime: data.startTime as string,
        endTime: data.endTime as string,
        notes: data.notes as string,
        status: data.status as ReservationStatusEnum,
        createdBy: data.createdBy as string,
        linkedVisitorIds: (data.linkedVisitorIds as string[]) ?? [],
      };
    },
  };

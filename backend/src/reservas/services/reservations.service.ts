import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AppFunction } from '../../auth/functions/app-functions';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { ReservationDTO } from '../dto/reservation.dto';
import { FilterReservationsDTO } from '../dto/filter-reservations.dto';
import { Reservation } from '../entities/reservations.entity';
import { reservationConverter } from '../mappers/reservation.converter';

@Injectable()
export class ReservationsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection(): admin.firestore.CollectionReference<Reservation> {
    return this.firebaseService
      .getFirestore()
      .collection('reservations')
      .withConverter(reservationConverter);
  }

  async getReservations(
    filter: FilterReservationsDTO = {},
  ): Promise<Reservation[]> {
    let query: admin.firestore.Query<Reservation> = this.collection();

    if (filter.status) {
      query = query.where('status', '==', filter.status);
    }

    if (filter.date) {
      const startOfDay = new Date(filter.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filter.date);
      endOfDay.setHours(23, 59, 59, 999);
      query = query
        .where('date', '>=', startOfDay)
        .where('date', '<=', endOfDay);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data());
  }

  async getReservationById(id: string): Promise<Reservation> {
    const snapshot = await this.collection().doc(id).get();
    const reservation = snapshot.data();
    if (!reservation) {
      throw new NotFoundException(`Reservation ${id} not found`);
    }
    return reservation;
  }

  async createReservation(
    dto: ReservationDTO,
    currentUser: AuthenticatedUser,
  ): Promise<string> {
    const reservationRef = this.collection().doc();

    const reservation: Reservation = {
      id: reservationRef.id,
      space: dto.space,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      notes: dto.notes ?? '',
      status: dto.status,
      createdBy: currentUser.uid,
      linkedVisitorIds: dto.linkedVisitorIds ?? [],
    };

    await reservationRef.set(reservation);
    return reservationRef.id;
  }

  async updateReservation(
    id: string,
    dto: ReservationDTO,
    currentUser: AuthenticatedUser,
  ): Promise<Reservation> {
    const existing = await this.getReservationById(id);
    this.assertCanManage(existing, currentUser);

    const updatedReservation: Reservation = {
      ...existing,
      ...dto,
      id: existing.id,
      notes: dto.notes ?? existing.notes,
      createdBy: existing.createdBy,
    };
    await this.collection().doc(id).set(updatedReservation);
    return updatedReservation;
  }

  async deleteReservation(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<void> {
    const existing = await this.getReservationById(id);
    this.assertCanManage(existing, currentUser);
    await this.collection().doc(id).delete();
  }

  /** Owners can manage their own; RESERVATIONS_MANAGE_ALL manages any. */
  private assertCanManage(
    reservation: Reservation,
    currentUser: AuthenticatedUser,
  ): void {
    const isOwner = reservation.createdBy === currentUser.uid;
    const canManageAll = currentUser.functions.includes(
      AppFunction.RESERVATIONS_MANAGE_ALL,
    );
    if (!isOwner && !canManageAll) {
      throw new ForbiddenException(
        'Voce so pode alterar as suas proprias reservas.',
      );
    }
  }
}

import { Reservation } from '../entities/reservations.entity';

/** Reservation payload returned by the API with creator details resolved. */
export interface ReservationResponseDTO extends Reservation {
  createdByName: string;
  createdByEmail: string;
  createdByDisplay: string;
}

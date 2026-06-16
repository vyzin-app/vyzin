export enum ReservationStatusEnum {
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export interface Reservation {
  id: string;
  space: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes: string;
  status: ReservationStatusEnum;
  createdBy: string;
  linkedVisitorIds: string[];
}

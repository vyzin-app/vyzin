export class OperationalReportLinkedVisitorDTO {
  visitorId: string;
  name: string;
  cpf: string;
  status: string;
  visitType: string;
}

export class OperationalReportReservationRowDTO {
  reservationId: string;
  space: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string;
  createdByName: string;
  createdByEmail: string;
  createdByApartment?: string;
  createdByBlock?: string;
  createdByProfileName: string;
  linkedVisitorCount: number;
  linkedVisitors: OperationalReportLinkedVisitorDTO[];
}

export class OperationalReportVisitorRowDTO {
  visitorId: string;
  name: string;
  cpf: string;
  phone: string;
  date: string;
  time: string;
  status: string;
  visitType: string;
  purpose: string;
  authorizedByName: string;
  authorizedByEmail: string;
  authorizedByApartment?: string;
  authorizedByBlock?: string;
  authorizedByProfileName: string;
  reservationId?: string;
  reservationSpace?: string;
  reservationDate?: string;
  reservationStartTime?: string;
  reservationStatus?: string;
  reservationOwnerName?: string;
}

export class OperationalReportSpaceCountDTO {
  space: string;
  count: number;
}

export class OperationalReportSummaryDTO {
  totalReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  totalVisitors: number;
  authorizedVisitors: number;
  waitingVisitors: number;
  exitedVisitors: number;
  deniedVisitors: number;
  reservationGuests: number;
  topSpaces: OperationalReportSpaceCountDTO[];
}

export class OperationalReportDTO {
  summary: OperationalReportSummaryDTO;
  reservations: OperationalReportReservationRowDTO[];
  visitors: OperationalReportVisitorRowDTO[];
  generatedAt: string;
}

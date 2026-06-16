export enum VisitTypeEnum {
  APARTMENT = 'apartment',
  RESERVATION = 'reservation',
}

export enum VisitorStatusEnum {
  AUTHORIZED = 'authorized',
  WAITING = 'waiting',
  EXITED = 'exited',
  DENIED = 'denied',
}

export interface Visitor {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  purpose: string;
  date: Date;
  time: string;
  notes: string;
  visitType: VisitTypeEnum;
  status: VisitorStatusEnum;
  authorizedBy: string;
  exitTime?: string;
}

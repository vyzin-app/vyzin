import { Injectable } from '@nestjs/common';
import { AppFunction } from '../../auth/functions/app-functions';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user';
import type { Reservation } from '../../reservas/entities/reservations.entity';
import { OwnershipSecurityScope } from './ownership.security-scope';

function canViewAllReservations(user: AuthenticatedUser): boolean {
  if (user.functions.includes(AppFunction.RESERVATIONS_MANAGE_ALL)) {
    return true;
  }

  // Porteiro: leitura geral sem gerenciar reservas proprias (RESERVATIONS_MANAGE).
  const canRead = user.functions.includes(AppFunction.RESERVATIONS_READ);
  const canManageOwn = user.functions.includes(AppFunction.RESERVATIONS_MANAGE);
  return canRead && !canManageOwn;
}

@Injectable()
export class ReservationSecurityScope extends OwnershipSecurityScope<Reservation> {
  constructor() {
    super({
      ownerField: 'createdBy',
      getOwnerId: (reservation) => reservation.createdBy,
      canBypassRead: canViewAllReservations,
      canBypassWrite: (user) =>
        user.functions.includes(AppFunction.RESERVATIONS_MANAGE_ALL),
      readDeniedMessage: 'Voce so pode visualizar as suas proprias reservas.',
      writeDeniedMessage: 'Voce so pode alterar as suas proprias reservas.',
    });
  }
}

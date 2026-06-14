import { Injectable } from '@nestjs/common';
import { AppFunction } from '../../auth/functions/app-functions';
import type { Visitor } from '../../visitantes/entities/visitor.entity';
import { OwnershipSecurityScope } from './ownership.security-scope';

@Injectable()
export class VisitorSecurityScope extends OwnershipSecurityScope<Visitor> {
  constructor() {
    super({
      ownerField: 'authorizedBy',
      getOwnerId: (visitor) => visitor.authorizedBy,
      canBypass: (user) =>
        user.functions.includes(AppFunction.VISITORS_WORKFLOW),
      readDeniedMessage:
        'Voce so pode visualizar visitantes autorizados por voce.',
      writeDeniedMessage:
        'Voce so pode alterar visitantes autorizados por voce.',
    });
  }
}

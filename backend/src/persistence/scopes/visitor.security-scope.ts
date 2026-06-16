import { Injectable } from '@nestjs/common';
import { AppFunction } from '../../auth/functions/app-functions';
import type { Visitor } from '../../visitantes/entities/visitor.entity';
import { OwnershipSecurityScope } from './ownership.security-scope';

@Injectable()
export class VisitorSecurityScope extends OwnershipSecurityScope<Visitor> {
  constructor() {
    super({
      // Ownership is the person who registered the visitor, so it survives
      // workflow decisions (authorize/deny) made by the porteiro/admin.
      ownerField: 'createdBy',
      getOwnerId: (visitor) => visitor.createdBy,
      canBypass: (user) =>
        user.functions.includes(AppFunction.VISITORS_WORKFLOW),
      readDeniedMessage:
        'Voce so pode visualizar visitantes cadastrados por voce.',
      writeDeniedMessage:
        'Voce so pode alterar visitantes cadastrados por voce.',
    });
  }
}

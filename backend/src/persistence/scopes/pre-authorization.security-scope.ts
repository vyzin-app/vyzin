import { Injectable } from '@nestjs/common';
import { AppFunction } from '../../auth/functions/app-functions';
import type { PreAuthorization } from '../../pre-authorizations/entities/pre-authorization.entity';
import { OwnershipSecurityScope } from './ownership.security-scope';

@Injectable()
export class PreAuthorizationSecurityScope extends OwnershipSecurityScope<PreAuthorization> {
  constructor() {
    super({
      ownerField: 'createdBy',
      getOwnerId: (item) => item.createdBy,
      canBypassRead: (user) =>
        user.functions.includes(AppFunction.VISITORS_WORKFLOW),
      canBypassWrite: (user) =>
        user.functions.includes(AppFunction.VISITORS_WORKFLOW),
      readDeniedMessage:
        'Voce so pode visualizar pre-autorizados cadastrados por voce.',
      writeDeniedMessage:
        'Voce so pode alterar pre-autorizados cadastrados por voce.',
    });
  }
}

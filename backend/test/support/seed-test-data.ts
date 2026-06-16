import { Injectable } from '@nestjs/common';
import { DEFAULT_CONDO_INFORMATION } from '../../src/informacoes/seed/default-information';
import { INFORMATION_DOCUMENT_ID } from '../../src/informacoes/entities/condo-information.entity';
import { ALL_FUNCTIONS, AppFunction } from '../../src/auth/functions/app-functions';
import { memoryStore } from './memory-store';

export async function seedTestData(): Promise<void> {
  memoryStore.clear();

  memoryStore.set('profiles', 'admin', {
    id: 'admin',
    name: 'Administrador',
    description: '',
    functions: ALL_FUNCTIONS,
    isSystem: true,
  });

  memoryStore.set('profiles', 'doorman', {
    id: 'doorman',
    name: 'Porteiro',
    description: '',
    functions: [
      AppFunction.RESERVATIONS_READ,
      AppFunction.VISITORS_READ,
      AppFunction.VISITORS_MANAGE,
      AppFunction.VISITORS_WORKFLOW,
      AppFunction.ANNOUNCEMENTS_READ,
      AppFunction.INFORMATION_READ,
      AppFunction.USERS_READ,
      AppFunction.USERS_MANAGE,
      AppFunction.REPORTS_READ,
    ],
    isSystem: true,
  });

  memoryStore.set('profiles', 'resident', {
    id: 'resident',
    name: 'Morador',
    description: '',
    functions: [
      AppFunction.RESERVATIONS_READ,
      AppFunction.RESERVATIONS_MANAGE,
      AppFunction.VISITORS_READ,
      AppFunction.VISITORS_MANAGE,
      AppFunction.ANNOUNCEMENTS_READ,
      AppFunction.INFORMATION_READ,
      AppFunction.REPORTS_READ,
    ],
    isSystem: true,
  });

  memoryStore.set('users', 'uid-resident', {
    uid: 'uid-resident',
    name: 'Maria Santos',
    email: 'morador@test.com',
    cpf: '456.789.123-00',
    phone: '(61) 99876-5432',
    apartment: '114',
    block: 'M',
    profileId: 'resident',
  });

  memoryStore.set('users', 'uid-admin', {
    uid: 'uid-admin',
    name: 'Admin Teste',
    email: 'admin@test.com',
    cpf: '111.111.111-11',
    phone: '(61) 90000-0001',
    profileId: 'admin',
  });

  memoryStore.set('users', 'uid-doorman', {
    uid: 'uid-doorman',
    name: 'Porteiro Teste',
    email: 'porteiro@test.com',
    cpf: '222.222.222-22',
    phone: '(61) 90000-0002',
    profileId: 'doorman',
  });

  memoryStore.set('condoInformation', INFORMATION_DOCUMENT_ID, {
    id: INFORMATION_DOCUMENT_ID,
    ...DEFAULT_CONDO_INFORMATION,
  });
}

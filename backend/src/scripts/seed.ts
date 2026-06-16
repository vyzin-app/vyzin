import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ALL_FUNCTIONS, AppFunction } from '../auth/functions/app-functions';
import {
  AnnouncementCategoryEnum,
} from '../mural/entities/announcement.entity';
import { announcementConverter } from '../mural/mappers/announcement.converter';
import {
  ReservationStatusEnum,
} from '../reservas/entities/reservations.entity';
import { reservationConverter } from '../reservas/mappers/reservation.converter';
import {
  VisitTypeEnum,
  VisitorStatusEnum,
} from '../visitantes/entities/visitor.entity';
import { preAuthorizationConverter } from '../pre-authorizations/mappers/pre-authorization.converter';
import { visitorConverter } from '../visitantes/mappers/visitor.converter';
import { InformationService } from '../informacoes/services/information.service';
import { DEFAULT_CONDO_INFORMATION } from '../informacoes/seed/default-information';
import { FirebaseService } from '../firebase/firebase.service';
import { ProfilesService } from '../profiles/services/profiles.service';
import { UsersService } from '../users/services/users.service';

/** Returns a date at noon, offset by N days from today. */
function atNoon(daysFromNow: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(12, 0, 0, 0);
  return date;
}

interface SeedUids {
  admin: string;
  doorman: string;
  resident: string;
}

/**
 * Demo documents with fixed ids (idempotent). Showcases business rules:
 * - Reserva confirmada com visitantes vinculados (tipo reservation)
 * - Reserva cancelada (morador nao pode reutilizar horario facilmente)
 * - Visitante aguardando autorizacao (porteiro usa workflow)
 * - Visitante autorizado / com saida registrada
 * - Avisos fixados e por categoria
 */
async function seedDemoData(
  firebase: FirebaseService,
  uids: SeedUids,
  information: InformationService,
): Promise<void> {
  const db = firebase.getFirestore();
  const today = atNoon(0);
  const partyDate = atNoon(7);

  const visitorParty1Id = 'demo-visitor-party-1';
  const visitorParty2Id = 'demo-visitor-party-2';
  const reservationPartyId = 'demo-reservation-party';

  const visitors = db.collection('visitors').withConverter(visitorConverter);
  const reservations = db
    .collection('reservations')
    .withConverter(reservationConverter);
  const announcements = db
    .collection('announcements')
    .withConverter(announcementConverter);

  await visitors.doc('demo-visitor-waiting').set({
    id: 'demo-visitor-waiting',
    name: 'Ana Paula Santos',
    cpf: '987.654.321-00',
    phone: '(61) 98888-1111',
    email: 'ana.visitante@example.com',
    purpose: 'Visita ao apto 114 — aguardando portaria',
    date: today,
    time: '14:30',
    notes: 'Parente da moradora Maria Santos',
    visitType: VisitTypeEnum.APARTMENT,
    status: VisitorStatusEnum.WAITING,
    createdBy: uids.resident,
    authorizedBy: '',
  });

  await visitors.doc('demo-visitor-authorized').set({
    id: 'demo-visitor-authorized',
    name: 'Carlos Oliveira',
    cpf: '123.456.789-00',
    phone: '(61) 97777-2222',
    email: 'carlos@example.com',
    purpose: 'Entrega de encomenda',
    date: today,
    time: '10:00',
    notes: 'Pacote para bloco M',
    visitType: VisitTypeEnum.APARTMENT,
    status: VisitorStatusEnum.AUTHORIZED,
    createdBy: uids.resident,
    authorizedBy: uids.doorman,
  });

  await visitors.doc('demo-visitor-exited').set({
    id: 'demo-visitor-exited',
    name: 'Roberto Ferreira',
    cpf: '456.789.123-00',
    phone: '(61) 96666-3333',
    email: '',
    purpose: 'Manutenção elétrica',
    date: today,
    time: '09:00',
    notes: 'Serviço concluído',
    visitType: VisitTypeEnum.APARTMENT,
    status: VisitorStatusEnum.EXITED,
    createdBy: uids.resident,
    authorizedBy: uids.doorman,
    exitTime: '11:30',
  });

  await visitors.doc(visitorParty1Id).set({
    id: visitorParty1Id,
    name: 'Fernanda Lima',
    cpf: '321.654.987-00',
    phone: '(61) 95555-4444',
    email: 'fernanda@example.com',
    purpose: 'Convidada — festa de aniversário',
    date: partyDate,
    time: '19:00',
    notes: 'Lista vinculada à reserva do salão',
    visitType: VisitTypeEnum.RESERVATION,
    status: VisitorStatusEnum.AUTHORIZED,
    createdBy: uids.resident,
    authorizedBy: uids.doorman,
  });

  await visitors.doc(visitorParty2Id).set({
    id: visitorParty2Id,
    name: 'Lucas Mendes',
    cpf: '654.321.987-00',
    phone: '(61) 94444-5555',
    email: '',
    purpose: 'Convidado — festa de aniversário',
    date: partyDate,
    time: '19:00',
    notes: 'Acompanhante de Fernanda',
    visitType: VisitTypeEnum.RESERVATION,
    status: VisitorStatusEnum.AUTHORIZED,
    createdBy: uids.resident,
    authorizedBy: uids.doorman,
  });

  await reservations.doc(reservationPartyId).set({
    id: reservationPartyId,
    space: 'Salão de Festas',
    date: partyDate,
    startTime: '19:00',
    endTime: '23:00',
    notes: 'Aniversário apto 114 — convidados vinculados',
    status: ReservationStatusEnum.CONFIRMED,
    createdBy: uids.resident,
    linkedVisitorIds: [visitorParty1Id, visitorParty2Id],
  });

  await reservations.doc('demo-reservation-churrasqueira').set({
    id: 'demo-reservation-churrasqueira',
    space: 'Churrasqueira 2',
    date: atNoon(3),
    startTime: '12:00',
    endTime: '18:00',
    notes: 'Almoço em família',
    status: ReservationStatusEnum.CONFIRMED,
    createdBy: uids.resident,
    linkedVisitorIds: [],
  });

  await reservations.doc('demo-reservation-cancelled').set({
    id: 'demo-reservation-cancelled',
    space: 'Quadra Esportiva',
    date: atNoon(-2),
    startTime: '15:00',
    endTime: '17:00',
    notes: 'Cancelada por chuva',
    status: ReservationStatusEnum.CANCELLED,
    createdBy: uids.resident,
    linkedVisitorIds: [],
  });

  await reservations.doc('demo-reservation-admin').set({
    id: 'demo-reservation-admin',
    space: 'Sala de Reuniões',
    date: atNoon(1),
    startTime: '09:00',
    endTime: '11:00',
    notes: 'Assembleia preparatória — reserva do síndico',
    status: ReservationStatusEnum.CONFIRMED,
    createdBy: uids.admin,
    linkedVisitorIds: [],
  });

  await announcements.doc('demo-announcement-maintenance').set({
    id: 'demo-announcement-maintenance',
    title: 'Manutenção do Elevador Social',
    content:
      'Manutenção preventiva nos dias 15 e 16. Elevador indisponível das 8h às 17h. Use o elevador de serviço.',
    author: 'Síndico — Administrador',
    date: new Date(),
    category: AnnouncementCategoryEnum.MAINTENANCE,
    isPinned: true,
    isImportant: true,
    likes: 12,
    comments: 3,
  });

  await announcements.doc('demo-announcement-event').set({
    id: 'demo-announcement-event',
    title: 'Assembleia Geral Ordinária',
    content:
      'Convocação para assembleia dia 25 às 19h no salão de festas. Pauta: obras e regulamento interno.',
    author: 'Administração',
    date: atNoon(-1),
    category: AnnouncementCategoryEnum.EVENT,
    isPinned: true,
    isImportant: true,
    likes: 28,
    comments: 9,
  });

  await announcements.doc('demo-announcement-general').set({
    id: 'demo-announcement-general',
    title: 'Horário da Piscina — Verão',
    content:
      'A piscina funciona de terça a domingo, das 8h às 20h. Crianças menores de 12 anos devem estar acompanhadas.',
    author: 'Administração',
    date: atNoon(-3),
    category: AnnouncementCategoryEnum.GENERAL,
    isPinned: false,
    isImportant: false,
    likes: 5,
    comments: 1,
  });

  await information.seedInformation(DEFAULT_CONDO_INFORMATION);

  const preAuth = db
    .collection('preAuthorizations')
    .withConverter(preAuthorizationConverter);

  await preAuth.doc('demo-preauth-1').set({
    id: 'demo-preauth-1',
    name: 'Diarista - Joana Souza',
    cpf: '123.987.456-78',
    schedule: 'Toda segunda-feira, 08:00',
    validUntil: '2026-12-31',
    active: true,
    createdBy: uids.resident,
  });

  await preAuth.doc('demo-preauth-2').set({
    id: 'demo-preauth-2',
    name: 'Avó - Dona Maria',
    cpf: '321.654.987-00',
    schedule: 'Livre acesso',
    validUntil: '2026-12-31',
    active: true,
    createdBy: uids.resident,
  });

  Logger.log(
    'Dados demo: 5 visitantes, 4 reservas, 3 avisos, informacoes e pre-autorizados.',
    'Seed',
  );
}

/**
 * Bootstrap seed: perfis RBAC, usuarios Firebase, dados demo com vinculos.
 * Idempotente — pode rodar varias vezes. Execute: `npm run seed`.
 */
async function seed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const profiles = app.get(ProfilesService);
  const users = app.get(UsersService);
  const firebase = app.get(FirebaseService);
  const information = app.get(InformationService);

  await profiles.seedProfile('admin', 'Administrador', ALL_FUNCTIONS, true);
  await profiles.seedProfile(
    'doorman',
    'Porteiro',
    [
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
    false,
  );
  await profiles.seedProfile(
    'resident',
    'Morador',
    [
      AppFunction.RESERVATIONS_READ,
      AppFunction.RESERVATIONS_MANAGE,
      AppFunction.VISITORS_READ,
      AppFunction.VISITORS_MANAGE,
      AppFunction.ANNOUNCEMENTS_READ,
      AppFunction.INFORMATION_READ,
      AppFunction.REPORTS_READ,
    ],
    false,
  );

  const adminUid = await users.ensureSeedUser({
    email: 'admin@vyzin.com',
    password: 'admin123',
    name: 'Oscar Galdino',
    cpf: '123.456.789-00',
    phone: '(61) 98765-4321',
    profileId: 'admin',
    apartment: '301',
    block: 'A',
  });
  const doormanUid = await users.ensureSeedUser({
    email: 'porteiro@vyzin.com',
    password: 'porteiro123',
    name: 'João Silva',
    cpf: '987.654.321-00',
    phone: '(61) 91234-5678',
    profileId: 'doorman',
  });
  const residentUid = await users.ensureSeedUser({
    email: 'morador@vyzin.com',
    password: 'morador123',
    name: 'Maria Santos',
    cpf: '456.789.123-00',
    phone: '(61) 99876-5432',
    profileId: 'resident',
    apartment: '114',
    block: 'M',
  });

  await seedDemoData(firebase, {
    admin: adminUid,
    doorman: doormanUid,
    resident: residentUid,
  }, information);

  Logger.log('Seed concluido. Acesse http://localhost:3001 e faca login.', 'Seed');
  Logger.log('  Admin:    admin@vyzin.com / admin123', 'Seed');
  Logger.log('  Porteiro: porteiro@vyzin.com / porteiro123', 'Seed');
  Logger.log('  Morador:  morador@vyzin.com / morador123', 'Seed');
  await app.close();
}

seed()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('SERVICE_DISABLED') || message.includes('PERMISSION_DENIED')) {
      Logger.error(
        [
          'Firestore nao esta habilitado no projeto Firebase.',
          '1) Abra https://console.firebase.google.com/project/vyzin-app/firestore',
          '2) Clique em "Criar banco de dados" (modo producao ou teste)',
          '3) Aguarde 1-2 minutos e rode novamente: npm run seed',
        ].join('\n'),
        'Seed',
      );
    }
    Logger.error(error, 'Seed');
    process.exit(1);
  });

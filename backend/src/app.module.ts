/**
 * Root NestJS module — wires all domain modules and global config.
 *
 * Modules: Auth, Profiles, Users, Reservations, Visitors, PreAuthorizations,
 * Mural, Information, Reports + Firebase/Persistence infrastructure.
 *
 * @see docs/DOCUMENTACAO_TECNICA.md
 * @see docs/MAPA_DO_CODIGO.md
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FirebaseModule } from './firebase/firebase.module';
import { PersistenceModule } from './persistence/persistence.module';
import { InformationModule } from './informacoes/information.module';
import { PreAuthorizationsModule } from './pre-authorizations/pre-authorizations.module';
import { MuralModule } from './mural/mural.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ReservationsModule } from './reservas/reservations.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';
import { VisitorsModule } from './visitantes/visitors.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FirebaseModule,
    PersistenceModule,
    ProfilesModule,
    UsersModule,
    AuthModule,
    ReservationsModule,
    VisitorsModule,
    MuralModule,
    ReportsModule,
    InformationModule,
    PreAuthorizationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

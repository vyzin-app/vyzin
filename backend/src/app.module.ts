import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FirebaseModule } from './firebase/firebase.module';
import { MuralModule } from './mural/mural.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ReservationsModule } from './reservas/reservations.module';
import { UsersModule } from './users/users.module';
import { VisitorsModule } from './visitantes/visitors.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FirebaseModule,
    ProfilesModule,
    UsersModule,
    AuthModule,
    ReservationsModule,
    VisitorsModule,
    MuralModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

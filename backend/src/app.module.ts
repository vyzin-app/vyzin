import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FirebaseModule } from './firebase/firebase.module';
import { MuralModule } from './mural/mural.module';
import { ReservasModule } from './reservas/reservas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FirebaseModule,
    AuthModule,
    ReservasModule,
    MuralModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './controllers/auth.controller';
import { FunctionsController } from './controllers/functions.controller';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { FunctionGuard } from './guards/function.guard';
import { AuthSessionService } from './services/auth-session.service';

/**
 * Autenticacao (Firebase session cookie / ID token) e autorizacao (RBAC por
 * funcao/perfil no Firestore). Login/logout passam pelo backend — o frontend
 * nao usa o Firebase SDK.
 */
@Module({
  imports: [ProfilesModule, UsersModule],
  controllers: [AuthController, FunctionsController],
  providers: [
    AuthSessionService,
    { provide: APP_GUARD, useClass: FirebaseAuthGuard },
    { provide: APP_GUARD, useClass: FunctionGuard },
  ],
})
export class AuthModule {}

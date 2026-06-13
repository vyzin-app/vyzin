import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './controllers/auth.controller';
import { FunctionsController } from './controllers/functions.controller';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { FunctionGuard } from './guards/function.guard';

/**
 * Autenticacao (Firebase ID token) e autorizacao (RBAC por funcao/perfil).
 * Os dois guards sao globais: FirebaseAuthGuard valida o token e o
 * FunctionGuard resolve o perfil e checa @RequireFunction.
 */
@Module({
  imports: [ProfilesModule, UsersModule],
  controllers: [AuthController, FunctionsController],
  providers: [
    { provide: APP_GUARD, useClass: FirebaseAuthGuard },
    { provide: APP_GUARD, useClass: FunctionGuard },
  ],
})
export class AuthModule {}

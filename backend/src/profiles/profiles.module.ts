import { Module } from '@nestjs/common';
import { ProfilesController } from './controllers/profiles.controller';
import { ProfilesService } from './services/profiles.service';

/** Perfis (tipos de usuario) e suas funcoes — RBAC dinamico. */
@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}

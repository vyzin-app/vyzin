import { Module } from '@nestjs/common';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';

/** Usuarios: dados pessoais + provisionamento no Firebase Auth. */
@Module({
  imports: [ProfilesModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

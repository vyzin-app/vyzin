import { Module } from '@nestjs/common';
import { PreAuthorizationsController } from './controllers/pre-authorizations.controller';
import { PreAuthorizationsService } from './services/pre-authorizations.service';

@Module({
  controllers: [PreAuthorizationsController],
  providers: [PreAuthorizationsService],
})
export class PreAuthorizationsModule {}

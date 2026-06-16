import { Module } from '@nestjs/common';
import { InformationController } from './controllers/information.controller';
import { InformationService } from './services/information.service';

@Module({
  controllers: [InformationController],
  providers: [InformationService],
  exports: [InformationService],
})
export class InformationModule {}

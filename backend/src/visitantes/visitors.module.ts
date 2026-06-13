import { Module } from '@nestjs/common';
import { VisitorsController } from './controllers/visitors.controller';
import { VisitorsService } from './services/visitors.service';

/** Cadastro e controle de visitantes — MVP. */
@Module({
  controllers: [VisitorsController],
  providers: [VisitorsService],
})
export class VisitorsModule {}

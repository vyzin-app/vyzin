import { Module } from '@nestjs/common';
import { AnnouncementsController } from './controllers/announcements.controller';
import { AnnouncementsService } from './services/announcements.service';

/** Mural de avisos e chamados/reclamações — MVP. */
@Module({
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
})
export class MuralModule {}

import { Module } from '@nestjs/common';
import { ReservationsController } from './controllers/reservations.controller';
import { ReservationsService } from './services/reservations.service';

/** Reserva de áreas comuns e regras de negócio — MVP. */
@Module({
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}

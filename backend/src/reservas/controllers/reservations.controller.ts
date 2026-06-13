import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequireFunction } from '../../auth/decorators/require-function.decorator';
import { AppFunction } from '../../auth/functions/app-functions';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { ReservationsService } from '../services/reservations.service';
import { ReservationDTO } from '../dto/reservation.dto';
import { FilterReservationsDTO } from '../dto/filter-reservations.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @RequireFunction(AppFunction.RESERVATIONS_READ)
  async getReservations(@Query() filter: FilterReservationsDTO) {
    return await this.reservationsService.getReservations(filter);
  }

  @Get(':id')
  @RequireFunction(AppFunction.RESERVATIONS_READ)
  async getReservation(@Param('id') id: string) {
    return await this.reservationsService.getReservationById(id);
  }

  @Post()
  @RequireFunction(AppFunction.RESERVATIONS_MANAGE)
  async createReservation(
    @Body() reservation: ReservationDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.reservationsService.createReservation(reservation, user);
  }

  @Put(':id')
  @RequireFunction(AppFunction.RESERVATIONS_MANAGE)
  async updateReservation(
    @Param('id') id: string,
    @Body() reservation: ReservationDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.reservationsService.updateReservation(
      id,
      reservation,
      user,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @RequireFunction(AppFunction.RESERVATIONS_MANAGE)
  async deleteReservation(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.reservationsService.deleteReservation(id, user);
  }
}

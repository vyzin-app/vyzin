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
import { FilterAvailableSlotsDTO } from '../dto/filter-available-slots.dto';
import { ReservationDTO } from '../dto/reservation.dto';
import { FilterReservationsDTO } from '../dto/filter-reservations.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @RequireFunction(AppFunction.RESERVATIONS_READ)
  async getReservations(
    @Query() filter: FilterReservationsDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.reservationsService.getReservations(filter, user);
  }

  @Get('available-slots')
  @RequireFunction(AppFunction.RESERVATIONS_READ)
  async getAvailableSlots(@Query() filter: FilterAvailableSlotsDTO) {
    return await this.reservationsService.getAvailableSlots(filter);
  }

  @Get(':id')
  @RequireFunction(AppFunction.RESERVATIONS_READ)
  async getReservation(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.reservationsService.getReservationById(id, user);
  }

  @Post()
  @RequireFunction(AppFunction.RESERVATIONS_MANAGE)
  async createReservation(
    @Body() reservation: ReservationDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.reservationsService.createReservation(reservation, user);
  }

  @Post(':id/visitors/:visitorId')
  @RequireFunction(AppFunction.VISITORS_MANAGE)
  async linkVisitor(
    @Param('id') id: string,
    @Param('visitorId') visitorId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.reservationsService.linkVisitor(id, visitorId, user);
  }

  @Delete(':id/visitors/:visitorId')
  @HttpCode(204)
  @RequireFunction(AppFunction.VISITORS_MANAGE)
  async unlinkVisitor(
    @Param('id') id: string,
    @Param('visitorId') visitorId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.reservationsService.unlinkVisitor(id, visitorId, user);
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

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
import {
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequireFunction } from '../../auth/decorators/require-function.decorator';
import { AppFunction } from '../../auth/functions/app-functions';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { ReservationsService } from '../services/reservations.service';
import { FilterAvailableSlotsDTO } from '../dto/filter-available-slots.dto';
import { ReservationDTO } from '../dto/reservation.dto';
import { FilterReservationsDTO } from '../dto/filter-reservations.dto';
import { ApiSecured } from '../../swagger/api-secured.decorator';

@ApiTags('Reservations')
@ApiSecured()
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @RequireFunction(AppFunction.RESERVATIONS_READ)
  @ApiOperation({ summary: 'Lista reservas (escopo por perfil)' })
  async getReservations(
    @Query() filter: FilterReservationsDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.reservationsService.getReservations(filter, user);
  }

  @Get('spaces')
  @RequireFunction(AppFunction.RESERVATIONS_READ)
  @ApiOperation({ summary: 'Lista espaços e duração de blocos' })
  getSpaces() {
    return this.reservationsService.getSpaces();
  }

  @Get('available-slots')
  @RequireFunction(AppFunction.RESERVATIONS_READ)
  @ApiOperation({ summary: 'Horários disponíveis por espaço e data' })
  async getAvailableSlots(@Query() filter: FilterAvailableSlotsDTO) {
    return await this.reservationsService.getAvailableSlots(filter);
  }

  @Get(':id')
  @RequireFunction(AppFunction.RESERVATIONS_READ)
  @ApiOperation({ summary: 'Busca reserva por ID' })
  async getReservation(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.reservationsService.getReservationById(id, user);
  }

  @Post()
  @RequireFunction(AppFunction.RESERVATIONS_MANAGE)
  @ApiOperation({ summary: 'Cria reserva (valida slot e data não passada)' })
  async createReservation(
    @Body() reservation: ReservationDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.reservationsService.createReservation(reservation, user);
  }

  @Post(':id/visitors/:visitorId')
  @RequireFunction(AppFunction.VISITORS_MANAGE)
  @ApiOperation({ summary: 'Vincula visitante à reserva' })
  @ApiParam({ name: 'id', description: 'ID da reserva' })
  @ApiParam({ name: 'visitorId', description: 'ID do visitante' })
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
  @ApiOperation({ summary: 'Desvincula visitante da reserva' })
  @ApiNoContentResponse()
  async unlinkVisitor(
    @Param('id') id: string,
    @Param('visitorId') visitorId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.reservationsService.unlinkVisitor(id, visitorId, user);
  }

  @Put(':id')
  @RequireFunction(AppFunction.RESERVATIONS_MANAGE)
  @ApiOperation({ summary: 'Atualiza reserva' })
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
  @ApiOperation({ summary: 'Remove reserva' })
  @ApiNoContentResponse()
  async deleteReservation(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.reservationsService.deleteReservation(id, user);
  }
}

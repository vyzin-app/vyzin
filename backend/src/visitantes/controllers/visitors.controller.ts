import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequireFunction } from '../../auth/decorators/require-function.decorator';
import { AppFunction } from '../../auth/functions/app-functions';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { VisitorsService } from '../services/visitors.service';
import { VisitorDTO } from '../dto/visitor.dto';
import { UpdateVisitorStatusDTO } from '../dto/update-visitor-status.dto';
import { FilterVisitorsDTO } from '../dto/filter-visitors.dto';
import { ApiSecured } from '../../swagger/api-secured.decorator';

@ApiTags('Visitors')
@ApiSecured()
@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Get()
  @RequireFunction(AppFunction.VISITORS_READ)
  @ApiOperation({ summary: 'Lista visitantes (escopo por createdBy)' })
  async getVisitors(
    @Query() filter: FilterVisitorsDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.visitorsService.getVisitors(filter, user);
  }

  @Get(':id')
  @RequireFunction(AppFunction.VISITORS_READ)
  @ApiOperation({ summary: 'Busca visitante por ID' })
  async getVisitor(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.visitorsService.getVisitorById(id, user);
  }

  @Post()
  @RequireFunction(AppFunction.VISITORS_MANAGE)
  @ApiOperation({ summary: 'Cadastra visitante (data/horário não podem ser passados)' })
  async createVisitor(
    @Body() visitor: VisitorDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.visitorsService.createVisitor(visitor, user);
  }

  @Put(':id')
  @RequireFunction(AppFunction.VISITORS_MANAGE)
  @ApiOperation({ summary: 'Atualiza visitante' })
  async updateVisitor(
    @Param('id') id: string,
    @Body() visitor: VisitorDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.visitorsService.updateVisitor(id, visitor, user);
  }

  @Patch(':id/status')
  @RequireFunction(AppFunction.VISITORS_WORKFLOW)
  @ApiOperation({ summary: 'Workflow portaria: authorized | denied | exited' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateVisitorStatusDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.visitorsService.updateStatus(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequireFunction(AppFunction.VISITORS_MANAGE)
  @ApiOperation({ summary: 'Remove visitante' })
  @ApiNoContentResponse()
  async deleteVisitor(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.visitorsService.deleteVisitor(id, user);
  }
}

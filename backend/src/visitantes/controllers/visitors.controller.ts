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
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequireFunction } from '../../auth/decorators/require-function.decorator';
import { AppFunction } from '../../auth/functions/app-functions';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { VisitorsService } from '../services/visitors.service';
import { VisitorDTO } from '../dto/visitor.dto';
import { UpdateVisitorStatusDTO } from '../dto/update-visitor-status.dto';
import { FilterVisitorsDTO } from '../dto/filter-visitors.dto';

@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Get()
  @RequireFunction(AppFunction.VISITORS_READ)
  async getVisitors(@Query() filter: FilterVisitorsDTO) {
    return await this.visitorsService.getVisitors(filter);
  }

  @Get(':id')
  @RequireFunction(AppFunction.VISITORS_READ)
  async getVisitor(@Param('id') id: string) {
    return await this.visitorsService.getVisitorById(id);
  }

  @Post()
  @RequireFunction(AppFunction.VISITORS_MANAGE)
  async createVisitor(
    @Body() visitor: VisitorDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.visitorsService.createVisitor(visitor, user);
  }

  @Put(':id')
  @RequireFunction(AppFunction.VISITORS_MANAGE)
  async updateVisitor(@Param('id') id: string, @Body() visitor: VisitorDTO) {
    return await this.visitorsService.updateVisitor(id, visitor);
  }

  @Patch(':id/status')
  @RequireFunction(AppFunction.VISITORS_WORKFLOW)
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
  async deleteVisitor(@Param('id') id: string) {
    await this.visitorsService.deleteVisitor(id);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequireFunction } from '../../auth/decorators/require-function.decorator';
import { AppFunction } from '../../auth/functions/app-functions';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { FilterOperationalReportDTO } from '../dto/filter-operational-report.dto';
import { ReportsService } from '../services/reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Relatorio operacional com joins:
   * reserva → morador (user + perfil) → visitantes vinculados
   * visitante → autorizador (user + perfil) → reserva vinculada
   */
  @Get('operational')
  @RequireFunction(AppFunction.REPORTS_READ)
  async getOperationalReport(
    @Query() filter: FilterOperationalReportDTO,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.reportsService.getOperationalReport(filter, user);
  }
}

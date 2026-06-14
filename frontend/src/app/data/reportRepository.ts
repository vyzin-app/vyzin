import {
  OperationalReport,
  OperationalReportFilter,
} from '../domain/report'
import { buildQueryString } from '../infra/http/queryParams'
import { apiClient } from '../infra/http/api'

export interface ReportRepository {
  getOperationalReport(
    filter?: OperationalReportFilter,
  ): Promise<OperationalReport>
}

class HttpReportRepository implements ReportRepository {
  getOperationalReport(
    filter: OperationalReportFilter = {},
  ): Promise<OperationalReport> {
    const query = buildQueryString({
      from: filter.from,
      to: filter.to,
      reservationStatus: filter.reservationStatus,
      space: filter.space,
      visitorStatus: filter.visitorStatus,
      visitType: filter.visitType,
      search: filter.search,
    })
    return apiClient.get<OperationalReport>(`/reports/operational${query}`)
  }
}

export const reportRepository: ReportRepository = new HttpReportRepository()

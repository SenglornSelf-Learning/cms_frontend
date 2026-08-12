import type { ResponseBody } from '@/types/cms-api'
import type { DashboardSummary } from '@/types/dashboard'
import { getHttpClient } from './http-client'

export class DashboardService {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await getHttpClient().get<ResponseBody<DashboardSummary>>('/api/dashboard')
    return data.data as DashboardSummary
  }
}

export const dashboardService = new DashboardService()

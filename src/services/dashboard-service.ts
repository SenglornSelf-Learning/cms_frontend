import type { DashboardSummary } from '@/types/dashboard'
import { getHttpClient } from './http-client'

/** API envelope matching backend ResponseBody<T>. */
interface ResponseBody<T> {
  status: boolean
  statusCode: number
  message: string
  data: T
}

export class DashboardService {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await getHttpClient().get<ResponseBody<DashboardSummary>>('/api/dashboard')
    return data.data
  }
}

export const dashboardService = new DashboardService()

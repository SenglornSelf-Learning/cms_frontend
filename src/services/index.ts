export { createHttpClient, getHttpClient } from './http-client'
export { CategoryService, getCategoryService } from './category-service'
export type { CategoryListItem, CreateCategoryPayload } from './category-service'
export { ContentService, getContentService } from './content-service'
export type { ContentListItem } from './content-service'
export { DashboardService, dashboardService } from './dashboard-service'

import { createHttpClient } from './http-client'

/** Call once at app `initializeServices`. */
export function initializeServices(): void {
  createHttpClient()
}

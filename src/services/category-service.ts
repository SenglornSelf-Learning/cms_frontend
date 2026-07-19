import type { Category } from '@/types/category'
import { getHttpClient } from './http-client'

/** Category list row (mapped from API wire shape). */
export interface CategoryListItem {
  id: number
  no: number
  name: string
  statusLabel: string
  isDeleted: boolean
}

/** Display helper: null/empty → "-" */
function toDisplay(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value).trim()
  return s === '' ? '-' : s
}

function formatStatusLabel(isDeleted: boolean | null | undefined): string {
  return isDeleted ? 'Deleted' : 'Active'
}

function rawToListItem(raw: Category, index: number, totalCount: number): CategoryListItem {
  return {
    id: raw.id ?? 0,
    no: Math.max(1, totalCount - index),
    name: toDisplay(raw.name),
    statusLabel: formatStatusLabel(raw.isDeleted),
    isDeleted: Boolean(raw.isDeleted),
  }
}

const CATEGORIES_LIST = '/api/categories/list'
const CATEGORY_DETAIL = (id: number) => `/api/categories/getById/${id}`
const CATEGORIES_CREATE = '/api/categories/create'

/**
 * Category API — replaces direct `fetch` / old `api/categories` module.
 */
export class CategoryService {
  private get client() {
    return getHttpClient()
  }

  async getCategories(): Promise<{
    categories: CategoryListItem[]
    totalCount: number
  }> {
    const { data } = await this.client.get<Category[]>(CATEGORIES_LIST)
    const rows = data ?? []
    const totalCount = rows.length
    const categories = rows.map((raw, index) => rawToListItem(raw, index, totalCount))
    return { categories, totalCount }
  }

  async getCategoryById(id: number): Promise<Category> {
    const { data } = await this.client.get<Category>(CATEGORY_DETAIL(id))
    return data
  }

  async createCategory(payload: Pick<Category, 'name'>): Promise<Category> {
    const { data } = await this.client.post<Category>(CATEGORIES_CREATE, payload)
    return data
  }
}

let serviceInstance: CategoryService | null = null

export function getCategoryService(): CategoryService {
  if (!serviceInstance) {
    serviceInstance = new CategoryService()
  }
  return serviceInstance
}

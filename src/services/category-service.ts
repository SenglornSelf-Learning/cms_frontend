import type { Category } from '@/types/category'
import { getHttpClient } from './http-client'

/** API envelope matching backend ResponseBody<T>. */
interface ResponseBody<T> {
  status: boolean
  statusCode: number
  message: string
  data: T
}

/** Paginated list matching backend PageResponse<T>. */
interface PageResponse<T> {
  items: T[]
  totalCount: number
  pageIndex: number
  pageSize: number
  totalPages: number
}

export interface CategoryListParams {
  pageIndex?: number
  pageSize?: number
  orderBy?: string
  name?: string
}

/** Payload for POST /api/categories (matches CategoryRequest). Active = N, Inactive = Y */
export interface CreateCategoryPayload {
  name: string
  status: 'N' | 'Y'
}

/** Category list row (mapped from API wire shape). */
export interface CategoryListItem {
  id: number
  no: number
  name: string
  status: 'Y' | 'N'
  deletedYn: string
  createdAt: string | null
}

/** Display helper: null/empty → "-" */
function toDisplay(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value).trim()
  return s === '' ? '-' : s
}

function rawToListItem(
  raw: Category,
  index: number,
  totalCount: number,
  pageIndex: number,
  pageSize: number,
): CategoryListItem {
  const status: 'Y' | 'N' = raw.status === 'Y' ? 'Y' : 'N'
  const rowSet = (pageIndex - 1) * pageSize + index
  return {
    id: raw.id ?? 0,
    no: Math.max(1, totalCount - rowSet),
    name: toDisplay(raw.name),
    status,
    deletedYn: raw.deletedYn === 'Y' ? 'Y' : 'N',
    createdAt: raw.createdAt ?? null,
  }
}

const CATEGORIES_LIST = '/api/categories/list'
const CATEGORY_DETAIL = (id: number) => `/api/categories/getById/${id}`
const CATEGORIES_CREATE = '/api/categories'
const CATEGORY_DELETE = (id: number) => `/api/categories/delete/${id}`
const CATEGORY_UPDATE = (id: number) => `/api/categories/update/${id}`

/**
 * Category API — replaces direct `fetch` / old `api/categories` module.
 */
export class CategoryService {
  private get client() {
    return getHttpClient()
  }

  // get categories as list
  async getCategories(params: CategoryListParams = {}): Promise<{
    categories: CategoryListItem[]
    totalCount: number
    pageIndex: number
    pageSize: number
    totalPages: number
  }> {
    const pageIndex = params.pageIndex ?? 1
    const pageSize = params.pageSize ?? 10
    const orderBy = params.orderBy ?? 'createdAt,DESC'
    const name = params.name?.trim() || undefined

    const { data } = await this.client.get<ResponseBody<PageResponse<Category>>>(
      CATEGORIES_LIST,
      { params: { pageIndex, pageSize, orderBy, ...(name ? { name } : {}) } },
    )
    const page = data?.data
    const rows = page?.items ?? []
    const totalCount = page?.totalCount ?? rows.length
    const categories = rows.map((raw, index) =>
      rawToListItem(raw, index, totalCount, pageIndex, pageSize),
    )
    return {
      categories,
      totalCount,
      pageIndex: page?.pageIndex ?? pageIndex,
      pageSize: page?.pageSize ?? pageSize,
      totalPages: page?.totalPages ?? 0,
    }
  }

  // get category by id
  async getCategoryById(id: number): Promise<Category> {
    const { data } = await this.client.get<ResponseBody<Category>>(CATEGORY_DETAIL(id))
    return data.data
  }

  // create category
  async createCategory(payload: CreateCategoryPayload): Promise<Category> {
    const { data } = await this.client.post<ResponseBody<Category>>(CATEGORIES_CREATE, payload)
    return data.data
  }

  // update category by id
  async updateCategoryById(id: number, payload: CreateCategoryPayload): Promise<Category> {
    const { data } = await this.client.put<ResponseBody<Category>>(CATEGORY_UPDATE(id), payload)
    return data.data
  }

  // delete category
  async deleteCategory(id: number): Promise<void> {
    await this.client.delete<ResponseBody<null>>(CATEGORY_DELETE(id))
  }
}

let serviceInstance: CategoryService | null = null

export function getCategoryService(): CategoryService {
  if (!serviceInstance) {
    serviceInstance = new CategoryService()
  }
  return serviceInstance
}

import type { PageResponse, ResponseBody } from '@/types/cms-api'
import type {
  CategoryFields,
  CategoryListItem,
  CreateCategoryPayload,
} from '@/types/category'
import { getHttpClient } from './http-client'

export interface CategoryListParams {
  pageIndex?: number
  pageSize?: number
  orderBy?: string
  name?: string
}

/** Display helper: null/empty → "-" */
function toDisplay(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value).trim()
  return s === '' ? '-' : s
}

function rawToListItem(
  raw: CategoryFields,
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

    const { data } = await this.client.get<ResponseBody<PageResponse<CategoryFields>>>(
      CATEGORIES_LIST,
      { params: { pageIndex, pageSize, orderBy, ...(name ? { name } : {}) } },
    )

    const page = data?.data
    const rows = page?.payload ?? []
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
  async getCategoryById(id: number): Promise<CategoryFields> {
    const { data } = await this.client.get<ResponseBody<CategoryFields>>(CATEGORY_DETAIL(id))
    return data.data as CategoryFields
  }

  // create category
  async createCategory(payload: CreateCategoryPayload): Promise<CategoryFields> {
    const { data } = await this.client.post<ResponseBody<CategoryFields>>(CATEGORIES_CREATE, payload)
    return data.data as CategoryFields
  }

  // update category by id
  async updateCategoryById(id: number, payload: CreateCategoryPayload): Promise<CategoryFields> {
    const { data } = await this.client.put<ResponseBody<CategoryFields>>(CATEGORY_UPDATE(id), payload)
    return data.data as CategoryFields
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

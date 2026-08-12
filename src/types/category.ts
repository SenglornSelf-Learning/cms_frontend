export interface CategoryFields {
  id?: number
  name: string
  status?: string | null
  deletedYn?: string | null
  createdAt?: string | null
}

/** Payload for POST /api/categories (matching CategoryRequest). Active = N, Inactive = Y */
export interface CreateCategoryPayload {
  name: string
  status: 'N' | 'Y'
}

/** Category list row (matching API). */
export interface CategoryListItem {
  id: number
  no: number
  name: string
  status: 'Y' | 'N'
  deletedYn: string
  createdAt: string | null
}

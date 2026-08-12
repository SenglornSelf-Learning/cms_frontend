export interface ContentFields {
  id?: number
  uuid?: string
  slug?: string
  keyword?: string
  title: string
  description?: string
  thumbnail?: string
  editor?: string
  deletedYn?: string | null
  createdAt?: string
  categoryId?: number | null
}

export type CreateContentPayload = Pick<
  ContentFields,
  'title' | 'slug' | 'keyword' | 'description' | 'thumbnail' | 'editor' | 'categoryId'
>

/** Content list row (matching API). */
export interface ContentListItem {
  id: number
  no: number
  title: string
  editor: string
  slug: string
  keyword: string
  categoryId: number | null
  createdAt: string | null
}

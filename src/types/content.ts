export interface CmsContent {
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
  CmsContent,
  'title' | 'slug' | 'keyword' | 'description' | 'thumbnail' | 'editor' | 'categoryId'
>

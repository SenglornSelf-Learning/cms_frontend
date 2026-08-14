export interface ContentThumbnail {
  id: number
  originalFileName: string
  contentType?: string
  fileSize: number
  url: string
}

export interface ContentFields {
  id?: number
  uuid?: string
  slug?: string
  keyword?: string
  title: string
  description?: string
  thumbnails?: ContentThumbnail[]
  editor?: string
  deletedYn?: string | null
  createdAt?: string
  categoryId?: number | null
}

export type CreateContentPayload = Pick<
  ContentFields,
  'title' | 'slug' | 'keyword' | 'description' | 'editor' | 'categoryId'
> & {
  files?: File[]
  deletedThumbnailIds?: number[]
}

/** Content list row (matching API). */
export interface ContentListItem {
  id: number
  no: number
  title: string
  editor: string
  slug: string
  keyword: string
  thumbnails: ContentThumbnail[]
  categoryId: number | null
  createdAt: string | null
}

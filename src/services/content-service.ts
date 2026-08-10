import type { CmsContent, CreateContentPayload } from '@/types/content'
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
  payload: T[]
  totalCount: number
  pageIndex: number
  pageSize: number
  totalPages: number
}

export interface ContentListParams {
  pageIndex?: number
  pageSize?: number
  orderBy?: string
  title?: string
  editor?: string
}

/** Content list row (mapped from API wire shape). */
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

/** Display helper: null/empty → "-" */
function toDisplay(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value).trim()
  return s === '' ? '-' : s
}

/** convert raw data to list item */
function rawToListItem(
  raw: CmsContent,
  index: number,
  totalCount: number,
  pageIndex: number,
  pageSize: number,
): ContentListItem {
  const rowSet = (pageIndex - 1) * pageSize + index
  return {
    id: raw.id ?? 0,
    no: Math.max(1, totalCount - rowSet),
    title: toDisplay(raw.title),
    editor: toDisplay(raw.editor),
    slug: toDisplay(raw.slug),
    keyword: toDisplay(raw.keyword),
    categoryId: raw.categoryId ?? null,
    createdAt: raw.createdAt ?? null,
  }
}

const CONTENTS_LIST = '/api/contents/list'
const CONTENT_DETAIL = (id: number) => `/api/contents/getById/${id}`
const CONTENTS_CREATE = '/api/contents'

/**
 * Content API — Planfit-style service: raw DTO → list mapping + lazy singleton.
 */
export class ContentService {
  private get client() {
    return getHttpClient()
  }

  // get contents list
  async getContents(params: ContentListParams = {}): Promise<{
    contents: ContentListItem[]
    totalCount: number
    pageIndex: number
    pageSize: number
    totalPages: number
  }> {
    const pageIndex = params.pageIndex ?? 1
    const pageSize = params.pageSize ?? 10
    const orderBy = params.orderBy ?? 'createdAt,DESC'
    const title = params.title?.trim() || undefined
    const editor = params.editor?.trim() || undefined

    const { data } = await this.client.get<ResponseBody<PageResponse<CmsContent>>>(CONTENTS_LIST, {
      params: {
        pageIndex,
        pageSize,
        orderBy,
        ...(title ? { title } : {}),
        ...(editor ? { editor } : {}),
      },
    })

    console.log('data', data) 
    const page = data?.data
    const rows = page?.payload ?? []
    const totalCount = page?.totalCount ?? rows.length
    const contents = rows.map((raw, index) =>
      rawToListItem(raw, index, totalCount, pageIndex, pageSize),
    )

    return {
      contents,
      totalCount,
      pageIndex: page?.pageIndex ?? pageIndex,
      pageSize: page?.pageSize ?? pageSize,
      totalPages: page?.totalPages ?? 0,
    }
  }

  // get content by id
  async getContentById(id: number): Promise<CmsContent> {
    const { data } = await this.client.get<ResponseBody<CmsContent>>(CONTENT_DETAIL(id))
    return data.data
  }

  // create content
  async createContent(payload: CreateContentPayload): Promise<CmsContent> {
    const { data } = await this.client.post<ResponseBody<CmsContent>>(CONTENTS_CREATE, payload)
    return data.data
  }
}

let serviceInstance: ContentService | null = null

export function getContentService(): ContentService {
  if (!serviceInstance) {
    serviceInstance = new ContentService()
  }
  return serviceInstance
}

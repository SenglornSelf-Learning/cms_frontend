import type { PageResponse, ResponseBody } from '@/types/cms-api'
import type {
  ContentFields,
  ContentListItem,
  CreateContentPayload,
} from '@/types/content'
import { getHttpClient } from './http-client'

export interface ContentListParams {
  pageIndex?: number
  pageSize?: number
  orderBy?: string
  title?: string
  editor?: string
}

/** Display helper: null/empty → "-" */
function toDisplay(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value).trim()
  return s === '' ? '-' : s
}

/** convert raw data to list item */
function rawToListItem(
  raw: ContentFields,
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
    thumbnail: toDisplay(raw.thumbnail),
    categoryId: raw.categoryId ?? null,
    createdAt: raw.createdAt ?? null,
  }
}

const CONTENTS_LIST = '/api/contents/list'
const CONTENT_DETAIL = (id: number) => `/api/contents/getById/${id}`
const CONTENTS_CREATE = '/api/contents'
const CONTENTS_UPDATE = (id: number) => `/api/contents/update/${id}`
const CONTENT_DELETE = (id: number) => `/api/contents/delete/${id}`

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

    const { data } = await this.client.get<ResponseBody<PageResponse<ContentFields>>>(CONTENTS_LIST, {
      params: {
        pageIndex,
        pageSize,
        orderBy,
        ...(title ? { title } : {}),
        ...(editor ? { editor } : {}),
      },
    })

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
  async getContentById(id: number): Promise<ContentFields> {
    const { data } = await this.client.get<ResponseBody<ContentFields>>(CONTENT_DETAIL(id))
    return data.data as ContentFields
  }

  // create content
  async createContent(payload: CreateContentPayload): Promise<ContentFields> {
    const { data } = await this.client.post<ResponseBody<ContentFields>>(CONTENTS_CREATE, payload)
    return data.data as ContentFields
  }

  // update content
  async updateContent(id: number, payload: CreateContentPayload): Promise<ContentFields> {
    const { data } = await this.client.put<ResponseBody<ContentFields>>(CONTENTS_UPDATE(id), payload)
    return data.data as ContentFields
  }

  // delete content
  async deleteContent(id: number): Promise<void> {
    await this.client.delete<ResponseBody<null>>(CONTENT_DELETE(id))
  }
}

let serviceInstance: ContentService | null = null

export function getContentService(): ContentService {
  if (!serviceInstance) {
    serviceInstance = new ContentService()
  }
  return serviceInstance
}

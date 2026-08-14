import type { PageResponse, ResponseBody } from '@/types/cms-api'
import type {
  ContentFields,
  ContentListItem,
  CreateContentPayload,
} from '@/types/content'
import { getCmsApiBaseUrl } from '@/config'
import { getHttpClient } from './http-client'
import { toRaw } from 'vue'

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

function toCreateJsonBody(payload: CreateContentPayload) {
  return {
    title: payload.title,
    slug: payload.slug ?? '',
    keyword: payload.keyword ?? '',
    description: payload.description ?? '',
    editor: payload.editor ?? '',
    categoryId: payload.categoryId,
  }
}

function toCreateFormData(payload: CreateContentPayload): FormData {
  const formData = new FormData()
  const body = toCreateJsonBody(payload)

  formData.append('title', body.title)
  if (body.slug) formData.append('slug', body.slug)
  if (body.keyword) formData.append('keyword', body.keyword)
  if (body.description) formData.append('description', body.description)
  if (body.editor) formData.append('editor', body.editor)
  if (body.categoryId != null) formData.append('categoryId', String(body.categoryId))

  for (const deletedId of payload.deletedThumbnailIds ?? []) {
    formData.append('deletedThumbnailIds', String(deletedId))
  }
  for (const file of payload.files ?? []) {
    const rawFile = toRaw(file)
    if (rawFile instanceof File && rawFile.size > 0) {
      formData.append('thumbnails', rawFile, rawFile.name)
    }
  }
  return formData
}

export function resolveThumbnailUrl(url?: string | null): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  const base = getCmsApiBaseUrl().replace(/\/$/, '')
  return base ? `${base}${url}` : url
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
    thumbnails: raw.thumbnails ?? [],
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
    const { data } = await this.client.post<ResponseBody<ContentFields>>(
      CONTENTS_CREATE,
      toCreateFormData(payload),
    )
    return data.data as ContentFields
  }

  // update content
  async updateContent(id: number, payload: CreateContentPayload): Promise<ContentFields> {
    const { data } = await this.client.put<ResponseBody<ContentFields>>(
      CONTENTS_UPDATE(id),
      toCreateFormData(payload),
    )
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

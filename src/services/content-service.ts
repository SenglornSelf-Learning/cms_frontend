import type { CmsContent, CreateContentPayload } from '@/types/content'
import { getHttpClient } from './http-client'

/** API envelope matching backend ResponseBody<T>. */
interface ResponseBody<T> {
  status: boolean
  statusCode: number
  message: string
  data: T
}

/** Content list row (mapped from API wire shape). */
export interface ContentListItem {
  id: number
  no: number
  title: string
  slug: string
  statusLabel: string
  isDeleted: boolean
}

function isDeletedYn(deletedYn: string | null | undefined): boolean {
  return deletedYn === 'Y'
}

/** Display helper: null/empty → "-" */
function toDisplay(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value).trim()
  return s === '' ? '-' : s
}

function formatStatusLabel(deleted: boolean): string {
  return deleted ? 'Deleted' : 'Active'
}

function rawToListItem(raw: CmsContent, index: number, totalCount: number): ContentListItem {
  const deleted = isDeletedYn(raw.deletedYn)
  return {
    id: raw.id ?? 0,
    no: Math.max(1, totalCount - index),
    title: toDisplay(raw.title),
    slug: toDisplay(raw.slug),
    statusLabel: formatStatusLabel(deleted),
    isDeleted: deleted,
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

  async getContents(): Promise<{
    contents: ContentListItem[]
    totalCount: number
  }> {
    const { data } = await this.client.get<ResponseBody<CmsContent[]>>(CONTENTS_LIST)
    const rows = data?.data ?? []
    const totalCount = rows.length
    const contents = rows.map((raw, index) => rawToListItem(raw, index, totalCount))
    return { contents, totalCount }
  }

  async getContentById(id: number): Promise<CmsContent> {
    const { data } = await this.client.get<ResponseBody<CmsContent>>(CONTENT_DETAIL(id))
    return data.data
  }

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

/** Matching API with backend ResponseBody<T>. */
export interface ResponseBody<T = unknown> {
  status: boolean
  statusCode: number
  message: string
  data?: T
}

/** Paginated list (matching API). */
export interface PageResponse<T> {
  status: boolean
  statusCode: number
  message: string
  payload: T[]
  totalCount: number
  pageIndex: number
  pageSize: number
  totalPages: number
}

/** Matching with responseOk(message, data). */
export function responseOk<T>(message: string, data: T): ResponseBody<T> {
  return {
    status: true,
    statusCode: 200,
    message,
    data,
  }
}

/** Matching with responseError(httpStatus, message). */
export function responseError(statusCode: number, message: string): ResponseBody {
  return {
    status: false,
    statusCode,
    message,
  }
}

export interface PagePaging {
  totalCount?: number
  pageIndex?: number
  pageSize?: number
  totalPages?: number
}

/** Matching with PageResponse.ok(message, payload) with optional paging overrides. */
export function pageOk<T>(
  message: string,
  payload: T[],
  paging?: PagePaging,
): PageResponse<T> {
  const totalCount = paging?.totalCount ?? payload.length
  const pageIndex = paging?.pageIndex ?? 0
  const pageSize = paging?.pageSize ?? payload.length
  const totalPages = paging?.totalPages ?? (payload.length === 0 ? 0 : 1)

  return {
    status: true,
    statusCode: 200,
    message,
    payload,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
  }
}

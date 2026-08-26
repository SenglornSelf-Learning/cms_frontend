import type { PageResponse, ResponseBody } from '@/types/cms-api'
import type { CreateUserPayload, UpdateAccountPayload, UserFields, UserListItem } from '@/types/user'
import { getHttpClient } from './http-client'

export interface UserListParams {
  pageIndex?: number
  pageSize?: number
  orderBy?: string
  username?: string
  email?: string
  phone?: string
}

/** Display helper: null/empty → "-" */
function toDisplay(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value).trim()
  return s === '' ? '-' : s
}

function formatRoles(roles: UserFields['roles']): string {
  const labels = (roles ?? [])
    .map((role) => role?.roleType?.trim())
    .filter((roleType): roleType is string => Boolean(roleType))
  return labels.length > 0 ? labels.join(', ') : '-'
}

function rawToListItem(
  raw: UserFields,
  index: number,
  totalCount: number,
  pageIndex: number,
  pageSize: number,
): UserListItem {
  const rowSet = (pageIndex - 1) * pageSize + index
  return {
    id: raw.id ?? 0,
    no: Math.max(1, totalCount - rowSet),
    username: toDisplay(raw.username),
    email: toDisplay(raw.email),
    phone: toDisplay(raw.phone),
    role: formatRoles(raw.roles),
    createdAt: raw.createdAt ?? null,
  }
}

const USERS_LIST = '/api/users/list'
const USER_ACCOUNT = '/api/users/account'
const USER_DETAIL = (id: number) => `/api/users/${id}`
const USERS_CREATE = '/api/users'
const USER_UPDATE = (id: number) => `/api/users/update/${id}`
const USER_DELETE = (id: number) => `/api/users/delete/${id}`

/**
 * User API — list mapping + lazy singleton.
 */
export class UserService {
  private get client() {
    return getHttpClient()
  }

  // get users to list
  async getUsers(params: UserListParams = {}): Promise<{
    users: UserListItem[]
    totalCount: number
    pageIndex: number
    pageSize: number
    totalPages: number
  }> {
    const pageIndex = params.pageIndex ?? 1
    const pageSize = params.pageSize ?? 10
    const orderBy = params.orderBy ?? 'createdAt,DESC'
    const username = params.username?.trim() || undefined
    const email = params.email?.trim() || undefined
    const phone = params.phone?.trim() || undefined

    const { data } = await this.client.get<ResponseBody<PageResponse<UserFields>>>(USERS_LIST, {
      params: {
        pageIndex,
        pageSize,
        orderBy,
        ...(username ? { username } : {}),
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
      },
    })

    const page = data?.data
    const rows = page?.payload ?? []
    const totalCount = page?.totalCount ?? rows.length
    const users = rows.map((raw, index) =>
      rawToListItem(raw, index, totalCount, pageIndex, pageSize),
    )

    return {
      users,
      totalCount,
      pageIndex: page?.pageIndex ?? pageIndex,
      pageSize: page?.pageSize ?? pageSize,
      totalPages: page?.totalPages ?? 0,
    }
  }

  // get signed-in account
  async getAccount(options?: { skipAuthRedirect?: boolean }): Promise<UserFields> {
    const { data } = await this.client.get<ResponseBody<UserFields>>(USER_ACCOUNT, {
      skipAuthRedirect: options?.skipAuthRedirect,
    })
    return data.data as UserFields
  }

  // get user by id
  async getUserById(id: number): Promise<UserFields> {
    const { data } = await this.client.get<ResponseBody<UserFields>>(USER_DETAIL(id))
    return data.data as UserFields
  }

  // create user
  async createUser(payload: CreateUserPayload): Promise<UserFields> {
    const { data } = await this.client.post<ResponseBody<UserFields>>(USERS_CREATE, payload)
    return data.data as UserFields
  }

  // update user
  async updateUserById(id: number, payload: CreateUserPayload | UpdateAccountPayload): Promise<UserFields> {
    const { data } = await this.client.put<ResponseBody<UserFields>>(USER_UPDATE(id), payload)
    return data.data as UserFields
  }

  // delete user
  async deleteUserById(id: number): Promise<void> {
    await this.client.delete<ResponseBody<null>>(USER_DELETE(id))
  }
}

let serviceInstance: UserService | null = null

export function getUserService(): UserService {
  if (!serviceInstance) {
    serviceInstance = new UserService()
  }
  return serviceInstance
}

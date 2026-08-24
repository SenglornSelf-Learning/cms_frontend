import type { ResponseBody } from '@/types/cms-api'
import type { RoleFields } from '@/types/role'
import { getHttpClient } from './http-client'

const ROLES_LIST = '/api/roles/list'

export class RoleService {
  private get client() {
    return getHttpClient()
  }

  async getRoles(): Promise<RoleFields[]> {
    const { data } = await this.client.get<ResponseBody<RoleFields[]>>(ROLES_LIST)
    return data.data ?? []
  }
}

let serviceInstance: RoleService | null = null

export function getRoleService(): RoleService {
  if (!serviceInstance) {
    serviceInstance = new RoleService()
  }
  return serviceInstance
}

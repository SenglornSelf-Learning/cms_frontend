export interface UserRole {
  id: number
  roleType: string
}

/** Raw user row (matching UserResponse). */
export interface UserFields {
  id?: number
  username?: string | null
  email?: string | null
  phone?: string | null
  roles?: UserRole[] | null
  deletedYn?: string | null
  createdAt?: string | null
}

/** User list row (matching API). */
export interface UserListItem {
  id: number
  no: number
  username: string
  email: string
  phone: string
  role: string
  createdAt: string | null
}

/** Payload for POST create and update user (matching UserRequest). */
export interface CreateUserPayload {
  username: string
  email: string
  phone?: string
  password?: string
  roles?: { roleType: string }[]
}

/** Payload for the signed-in account settings form (roles are left unchanged). */
export interface UpdateAccountPayload {
  username: string
  email: string
  phone?: string
  password?: string
  oldPassword?: string
}

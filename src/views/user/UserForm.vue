<template>
  <MasterContentLayout :title="isEdit ? 'Edit user' : 'Create user'" col-class="col-lg-8">
    <form @submit.prevent="onSubmit">
      <FormRows
        label="Username"
        required
        input-id="username"
        v-model="form.username"
        :error="fieldErrors.username"
        @update:modelValue="clearFieldError('username')"
      />
      
      <FormRows
        label="Email"
        required
        input-id="email"
        v-model="form.email"
        :error="fieldErrors.email"
        @update:modelValue="clearFieldError('email')"
      />

      <FormRows
        label="Password"
        :required="!isEdit"
        type="password"
        input-id="password"
        v-model="form.password"
        :placeholder="isEdit ? 'Leave blank to keep current password' : ''"
        :error="fieldErrors.password"
        @update:modelValue="clearFieldError('password')"
      />

      <FormRows
        label="Phone"
        input-id="phone"
        v-model="form.phone"
        :error="fieldErrors.phone"
        @update:modelValue="clearFieldError('phone')"
      />

      <FormRows
        label="Role"
        input-id="role"
        :disabled="isLoading"
      >
        <div class="role_checkboxes">
          <label
            v-for="role in roles"
            :key="role.id"
            class="role_checkbox"
          >
            <input
              type="checkbox"
              :value="role.roleType"
              :disabled="isLoading"
              v-model="form.roleTypes"
            />
            <span>{{ role.roleType }}</span>
          </label>
          <p v-if="!isLoading && roles.length === 0" class="role_empty">No roles available</p>
        </div>
      </FormRows>

      <div class="form_actions">
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Saving…' : 'Save' }}
        </button>
        <RouterLink to="/users" class="btn btn-light ml-2">Cancel</RouterLink>
      </div>
    </form>
  </MasterContentLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MasterContentLayout from '@/components/layout/content-layout/MasterContentLayout.vue'
import FormRows from '@/components/common/FormRows.vue'
import { getRoleService, getUserService } from '@/services'
import type { RoleFields } from '@/types/role'
import type { CreateUserPayload } from '@/types/user'

const router = useRouter()
const route = useRoute()
const roles = ref<RoleFields[]>([])
const isLoading = ref(false)
const submitting = ref(false)

type FieldErrors = Partial<Record<'username' | 'password' | 'email' | 'phone', string>>
const fieldErrors = ref<FieldErrors>({})

const form = ref({
  username: '',
  password: '',
  email: '',
  phone: '',
  roleTypes: [] as string[],
})

function resetForm() {
  form.value = {
    username: '',
    password: '',
    email: '',
    phone: '',
    roleTypes: [],
  }
  fieldErrors.value = {}
  submitting.value = false
}

const isUserEditRoute = computed(() => route.name === 'userEdit')
const isEdit = computed(() => isUserEditRoute.value)
const userEditId = computed(() => {
  if (!isUserEditRoute.value) return undefined
  return route.params.id
})
const userId = Number(userEditId.value)

function clearFieldError(field: keyof FieldErrors) {
  if (!fieldErrors.value[field]) return
  fieldErrors.value = { ...fieldErrors.value, [field]: undefined }
}

function checkingServerFieldError(err: unknown) {
  const message = err instanceof Error ? err.message.trim() : ''
  if (!message) return

  const lower = message.toLowerCase()
  if (lower.includes('username')) {
    fieldErrors.value = { ...fieldErrors.value, username: message }
  } else if (lower.includes('email')) {
    fieldErrors.value = { ...fieldErrors.value, email: message }
  }
}

function validateForm(): boolean {
  fieldErrors.value = {}
  const username = form.value.username.trim()
  const password = form.value.password
  const email = form.value.email.trim()
  const phone = form.value.phone.trim()

  if (!username) {
    fieldErrors.value.username = 'Username is required'
    return false
  } else if (username.length > 50) {
    fieldErrors.value.username = 'Username must be at most 50 characters'
    return false
  }

  if (!isEdit.value && !password) {
    fieldErrors.value.password = 'Password is required'
    return false
  } else if (password.length > 100) {
    fieldErrors.value.password = 'Password must be at most 100 characters'
    return false
  }

  if (!email) {
    fieldErrors.value.email = 'Email is required'
    return false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.value.email = 'Email format is invalid'
    return false
  } else if (email.length > 100) {
    fieldErrors.value.email = 'Email must be at most 100 characters'
    return false
  }

  if (phone && !/^\d+$/.test(phone)) {
    fieldErrors.value.phone = 'Phone must be a number'
    return false
  } else if (phone && phone.length > 15) {
    fieldErrors.value.phone = 'Phone must be at most 15 characters'
    return false
  }

  return true
}

function buildUserPayload(): CreateUserPayload {
  const phone = form.value.phone.trim()
  const payload: CreateUserPayload = {
    username: form.value.username.trim(),
    email: form.value.email.trim(),
    roles: form.value.roleTypes.map((roleType) => ({ roleType })),
  }
  if (phone) {
    payload.phone = phone
  }
  const password = form.value.password
  if (password) {
    payload.password = password
  }
  return payload
}

async function fetchRoles() {
  isLoading.value = true
  try {
    roles.value = await getRoleService().getRoles()
  } catch (err) {
    console.error('Failed to load roles', err)
  } finally {
    isLoading.value = false
  }
}

async function fetchUserDetail() {
  if (!isEdit.value) return
  if (!Number.isFinite(userId)) return

  try {
    const user = await getUserService().getUserById(userId)
    form.value = {
      username: user.username ?? '',
      password: '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      roleTypes: (user.roles ?? [])
        .map((role) => role.roleType)
        .filter((roleType): roleType is string => Boolean(roleType)),
    }
  } catch (err) {
    console.error('Failed to fetch user detail', err)
  }
}

async function onSubmit() {
  if (!validateForm()) return
  const payload = buildUserPayload()
  submitting.value = true

  try {
    if (isEdit.value) {
      await getUserService().updateUserById(userId, payload)
    } else {
      await getUserService().createUser(payload)
    }
    await router.push('/users')
    resetForm()
  } catch (err) {
    console.error('Failed to save user', err)
    checkingServerFieldError(err)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await fetchRoles()
  await fetchUserDetail()
})
</script>

<style scoped>
.form_actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding: 0 0.8rem;
}

.role_checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  padding-top: 0.45rem;
}

.role_checkbox {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0;
  cursor: pointer;
  font-weight: 400;
}

.role_checkbox input {
  margin: 0;
}

.role_empty {
  margin: 0;
  color: #6c757d;
}
</style>

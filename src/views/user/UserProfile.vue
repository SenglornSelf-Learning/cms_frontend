<template>
  <div class="bg-white border rounded">
    <div class="row no-gutters">
      <div class="col-lg-4 col-xl-3">
        <div class="profile-content-left profile-left-spacing pt-5 pb-3 px-3 px-xl-5">
          <div class="card text-center widget-profile px-0 border-0">
            <div class="card-img mx-auto rounded-circle">
              <img :src="avatarSrc" alt="user image" />
            </div>
            <div class="card-body">
              <h4 class="py-2 text-dark">{{ displayName }}</h4>
              <p>{{ displayEmail }}</p>
            </div>
          </div>

          <hr class="w-100" />

          <div class="contact-info pt-4">
            <h5 class="text-dark mb-1">Contact Information</h5>
            <p class="text-dark font-weight-medium pt-4 mb-2">Email address</p>
            <p>{{ displayEmail }}</p>
            <p class="text-dark font-weight-medium pt-4 mb-2">Phone Number</p>
            <p>{{ displayPhone }}</p>
            <p class="text-dark font-weight-medium pt-4 mb-2">Role</p>
            <p>{{ formatRoles(user?.roles) }}</p>
            <p class="text-dark font-weight-medium pt-4 mb-2">Created At</p>
            <p><FormattedNumber :value="user?.createdAt" fallback="-" /></p>
          </div>
        </div>
      </div>

      <div class="col-lg-8 col-xl-9">
        <div class="profile-content-right profile-right-spacing py-5">
          <ul class="nav nav-tabs px-3 px-xl-5 nav-style-border" role="tablist">
            <li class="nav-item">
              <a class="nav-link active" role="tab">Settings</a>
            </li>
          </ul>

          <div class="tab-content px-3 px-xl-5">
            <div class="tab-pane-content mt-5">
              <p v-if="loading" class="text-muted">Loading account…</p>
              <p v-if="error" class="text-danger">{{ error }}</p>
              <p v-if="success" class="text-success">{{ success }}</p>

              <form v-if="user" @submit.prevent="onSubmit">
                <div class="row mb-2">
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label for="username">User name</label>
                      <input
                        id="username"
                        v-model="form.username"
                        type="text"
                        class="form-control"
                        @input="clearFieldError('username')"
                      />
                      <span v-if="fieldErrors.username" class="text-danger d-block mt-1">
                        {{ fieldErrors.username }}
                      </span>
                    </div>
                  </div>

                  <div class="col-lg-6">
                    <div class="form-group">
                      <label for="email">Email</label>
                      <input
                        id="email"
                        v-model="form.email"
                        type="email"
                        class="form-control"
                        @input="clearFieldError('email')"
                      />
                      <span v-if="fieldErrors.email" class="text-danger d-block mt-1">
                        {{ fieldErrors.email }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="form-group mb-4">
                  <label for="phone">Phone</label>
                  <input
                    id="phone"
                    v-model="form.phone"
                    type="text"
                    class="form-control"
                    @input="clearFieldError('phone')"
                  />
                  <span v-if="fieldErrors.phone" class="text-danger d-block mt-1">
                    {{ fieldErrors.phone }}
                  </span>
                </div>

                <div class="form-group mb-4">
                  <label for="newPassword">New password</label>
                  <input
                    id="newPassword"
                    v-model="form.password"
                    type="password"
                    class="form-control"
                    autocomplete="new-password"
                    @input="clearFieldError('password')"
                  />
                  <span class="d-block mt-1 text-muted">Leave blank to keep the current password.</span>
                  <span v-if="fieldErrors.password" class="text-danger d-block mt-1">
                    {{ fieldErrors.password }}
                  </span>
                </div>

                <div class="form-group mb-4">
                  <label for="conPassword">Confirm password</label>
                  <input
                    id="conPassword"
                    v-model="form.confirmPassword"
                    type="password"
                    class="form-control"
                    autocomplete="new-password"
                    @input="clearFieldError('confirmPassword')"
                  />
                  <span v-if="fieldErrors.confirmPassword" class="text-danger d-block mt-1">
                    {{ fieldErrors.confirmPassword }}
                  </span>
                </div>

                <div class="d-flex justify-content-end mt-5">
                  <button type="submit" class="btn btn-primary mb-2 btn-pill" :disabled="submitting">
                    {{ submitting ? 'Updating…' : 'Update Profile' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import FormattedNumber from '@/components/common/FormattedNumber.vue'
import { getUserService } from '@/services'
import { useAuthStore } from '@/stores/auth'
import type { UpdateAccountPayload, UserFields, UserRole } from '@/types/user'

const auth = useAuthStore()

const user = ref<UserFields | null>(null)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const loading = ref(false)
const submitting = ref(false)

type FieldErrors = Partial<Record<'username' | 'email' | 'phone' | 'password' | 'confirmPassword', string>>
const fieldErrors = ref<FieldErrors>({})

const form = ref({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const displayName = computed(() => user.value?.username?.trim() || '-')
const displayEmail = computed(() => user.value?.email?.trim() || '-')
const displayPhone = computed(() => user.value?.phone?.trim() || '-')
const avatarSrc = '/theme/assets/img/user/user.png'

function formatRoles(roles: UserRole[] | null | undefined): string {
  const labels = (roles ?? [])
    .map((role) => role?.roleType?.trim())
    .filter((roleType): roleType is string => Boolean(roleType))
  return labels.length > 0 ? labels.join(', ') : '-'
}

function clearFieldError(field: keyof FieldErrors) {
  if (!fieldErrors.value[field]) return
  fieldErrors.value = { ...fieldErrors.value, [field]: undefined }
}

function applyUser(account: UserFields) {
  user.value = account
  form.value = {
    username: account.username ?? '',
    email: account.email ?? '',
    phone: account.phone ?? '',
    password: '',
    confirmPassword: '',
  }
  auth.setCurrentUser(account)
}

async function fetchAccount() {
  loading.value = true
  error.value = null
  success.value = null
  try {
    const account = await getUserService().getAccount()
    applyUser(account)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load account'
  } finally {
    loading.value = false
  }
}

function validateForm(): boolean {
  fieldErrors.value = {}
  const username = form.value.username.trim()
  const email = form.value.email.trim()
  const phone = form.value.phone.trim()
  const password = form.value.password
  const confirmPassword = form.value.confirmPassword

  if (!username) {
    fieldErrors.value.username = 'Username is required'
    return false
  }
  if (username.length > 50) {
    fieldErrors.value.username = 'Username must be at most 50 characters'
    return false
  }

  if (!email) {
    fieldErrors.value.email = 'Email is required'
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.value.email = 'Email format is invalid'
    return false
  }
  if (email.length > 100) {
    fieldErrors.value.email = 'Email must be at most 100 characters'
    return false
  }

  if (phone && !/^\d+$/.test(phone)) {
    fieldErrors.value.phone = 'Phone must be a number'
    return false
  }
  if (phone && phone.length > 15) {
    fieldErrors.value.phone = 'Phone must be at most 15 characters'
    return false
  }

  if (password || confirmPassword) {
    if (password.length > 100) {
      fieldErrors.value.password = 'Password must be at most 100 characters'
      return false
    }
    if (password !== confirmPassword) {
      fieldErrors.value.confirmPassword = 'Passwords do not match'
      return false
    }
    if (!password) {
      fieldErrors.value.password = 'New password is required'
      return false
    }
  }

  return true
}

async function onSubmit() {
  if (!user.value?.id || !validateForm()) return
  if (submitting.value) return

  submitting.value = true
  error.value = null
  success.value = null

  const payload: UpdateAccountPayload = {
    username: form.value.username.trim(),
    email: form.value.email.trim(),
    phone: form.value.phone.trim(),
  }
  const password = form.value.password
  if (password) {
    payload.password = password
  }

  try {
    const updated = await getUserService().updateUserById(user.value.id, payload)
    auth.updateCredentials(payload.username, payload.password)
    applyUser(updated)
    success.value = 'Profile updated successfully.'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update profile'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void fetchAccount()
})
</script>

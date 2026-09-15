<template>
  <div class="profile-page bg-white border rounded" :class="{ 'is-loading': isBusy }">
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
            <p class="text-dark font-weight-medium pt-4 mb-2">Email Address</p>
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
              <p v-if="error" class="text-danger">{{ error }}</p>

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
                        :class="{ 'is-invalid': fieldErrors.username }"
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
                        :class="{ 'is-invalid': fieldErrors.email }"
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
                    :class="{ 'is-invalid': fieldErrors.phone }"
                    @input="clearFieldError('phone')"
                  />
                  <span v-if="fieldErrors.phone" class="text-danger d-block mt-1">
                    {{ fieldErrors.phone }}
                  </span>
                </div>

                <div class="form-group mb-4">
                  <label for="oldPassword">Old password</label>
                  <input
                    id="oldPassword"
                    v-model="form.oldPassword"
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': fieldErrors.oldPassword }"
                    autocomplete="current-password"
                    @input="clearFieldError('oldPassword')"
                  />
                  <span class="d-block mt-1 text-muted">
                    Leave all password fields blank to keep the current password.
                  </span>
                  <span v-if="fieldErrors.oldPassword" class="text-danger d-block mt-1">
                    {{ fieldErrors.oldPassword }}
                  </span>
                </div>

                <div class="row mb-2">
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label for="newPassword">New password</label>
                      <input
                        id="newPassword"
                        v-model="form.password"
                        type="password"
                        class="form-control"
                        :class="{ 'is-invalid': fieldErrors.password }"
                        autocomplete="new-password"
                        @input="clearFieldError('password')"
                      />
                      <span v-if="fieldErrors.password" class="text-danger d-block mt-1">
                        {{ fieldErrors.password }}
                      </span>
                    </div>
                  </div>

                  <div class="col-lg-6">
                    <div class="form-group">
                      <label for="confirmPassword">Confirm password</label>
                      <input
                        id="confirmPassword"
                        v-model="form.confirmPassword"
                        type="password"
                        class="form-control"
                        :class="{ 'is-invalid': fieldErrors.confirmPassword }"
                        autocomplete="new-password"
                        @input="clearFieldError('confirmPassword')"
                      />
                      <span v-if="fieldErrors.confirmPassword" class="text-danger d-block mt-1">
                        {{ fieldErrors.confirmPassword }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-end mt-5">
                  <button type="submit" class="btn btn-primary mb-2 btn-pill" :disabled="isBusy">
                    {{ submitting ? 'Updating…' : 'Update Profile' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isBusy" class="loading-overlay" aria-busy="true" aria-live="polite">
      <ProgressSpinner style="width: 50px; height: 50px" stroke-width="4" />
      <div class="loading-text">{{ submitting ? 'Updating…' : 'Loading…' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import FormattedNumber from '@/components/common/FormattedNumber.vue'
import ProgressSpinner from '@/components/common/ProgressSpinner.vue'
import { getUserService } from '@/services'
import { useAuthStore } from '@/stores/auth'
import { showErrorToast, showSuccessToast } from '@/theme/toastr'
import type { UpdateAccountPayload, UserFields, UserRole } from '@/types/user'

const auth = useAuthStore()

const user = ref<UserFields | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)
const submitting = ref(false)
const isBusy = computed(() => loading.value || submitting.value)

type FieldErrors = Partial<Record<'username' | 'email' | 'phone' | 'oldPassword' | 'password' | 'confirmPassword', string>>
const fieldErrors = ref<FieldErrors>({})

const form = ref({
  username: '',
  email: '',
  phone: '',
  oldPassword: '',
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
    oldPassword: '',
    password: '',
    confirmPassword: '',
  }
  auth.setCurrentUser(account)
}

function checkingServerFieldError(err: unknown) {
  const message = err instanceof Error ? err.message.trim() : ''
  if (!message) return

  const lower = message.toLowerCase()
  if (lower.includes('old password')) {
    fieldErrors.value = { ...fieldErrors.value, oldPassword: message }
  } else if (lower.includes('username')) {
    fieldErrors.value = { ...fieldErrors.value, username: message }
  } else if (lower.includes('email')) {
    fieldErrors.value = { ...fieldErrors.value, email: message }
  } else if (lower.includes('phone')) {
    fieldErrors.value = { ...fieldErrors.value, phone: message }
  } else if (lower.includes('password')) {
    fieldErrors.value = { ...fieldErrors.value, password: message }
  }
}

async function fetchAccount() {
  loading.value = true
  error.value = null
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
  const errors: FieldErrors = {}
  const username = form.value.username.trim()
  const email = form.value.email.trim()
  const phone = form.value.phone.trim()
  const oldPassword = form.value.oldPassword
  const password = form.value.password
  const confirmPassword = form.value.confirmPassword
  const changingPassword = Boolean(oldPassword || password || confirmPassword)

  if (!username) {
    errors.username = 'Username is required'
  } else if (username.length > 50) {
    errors.username = 'Username must be at most 50 characters'
  }

  if (!email) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Email format is invalid'
  } else if (email.length > 100) {
    errors.email = 'Email must be at most 100 characters'
  }

  if (phone && !/^\d+$/.test(phone)) {
    errors.phone = 'Phone must be a number'
  } else if (phone && phone.length > 15) {
    errors.phone = 'Phone must be at most 15 characters'
  }

  if (changingPassword) {
    if (!oldPassword) {
      errors.oldPassword = 'Old password is required'
    }
    if (!password) {
      errors.password = 'New password is required'
    } else if (password.length > 100) {
      errors.password = 'Password must be at most 100 characters'
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required'
    } else if (password && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
  }

  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function onSubmit() {
  if (!user.value?.id || !validateForm()) return
  if (submitting.value) return

  submitting.value = true
  error.value = null
  fieldErrors.value = {}

  const payload: UpdateAccountPayload = {
    username: form.value.username.trim(),
    email: form.value.email.trim(),
    phone: form.value.phone.trim(),
  }

  const password = form.value.password
  if (password) {
    payload.password = password
    payload.oldPassword = form.value.oldPassword
  }

  try {
    const updated = await getUserService().updateUserById(user.value.id, payload)
    auth.updateCredentials(payload.username, payload.password)

    try {
      const account = await getUserService().getAccount()
      applyUser(account)
    } catch {
      applyUser(updated)
    }

    showSuccessToast('Profile updated successfully.', 'Success!')
  } catch (err) {
    checkingServerFieldError(err)
    showErrorToast('Failed to update profile.', 'Error!')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void fetchAccount()
})
</script>

<style scoped>
.profile-page {
  position: relative;
}

.profile-page.is-loading {
  min-height: 12rem;
  pointer-events: none;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);
}

.loading-text {
  color: #666;
  font-size: 0.875rem;
}
</style>

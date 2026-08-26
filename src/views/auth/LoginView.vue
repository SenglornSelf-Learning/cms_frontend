<template>
  <div class="container d-flex align-items-center justify-content-center vh-100">
    <div class="row justify-content-center">
      <div class="col-lg-7 col-md-10">
        <div class="card">
          <div class="card-header bg-primary">
            <div class="app-brand">
              <span class="brand-link">
                <svg
                  class="brand-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid"
                  width="30"
                  height="33"
                  viewBox="0 0 30 33"
                >
                  <g fill="none" fill-rule="evenodd">
                    <path class="logo-fill-blue" fill="#7DBCFF" d="M0 4v25l8 4V0zM22 4v25l8 4V0z" />
                    <path class="logo-fill-white" fill="#FFF" d="M11 4v25l8 4V0z" />
                  </g>
                </svg>
                <span class="brand-name">Content Management System</span>
              </span>
            </div>
          </div>

          <div class="card-body p-5">
            <h4 class="text-dark mb-5">Sign In</h4>

            <form @submit.prevent="onSubmit">
              <div class="row">
                <div class="form-group col-md-12 mb-4">
                  <input
                    v-model="username"
                    type="text"
                    class="form-control input-lg"
                    id="username"
                    placeholder="Username"
                    autocomplete="username"
                  />
                </div>

                <div class="form-group col-md-12">
                  <input
                    v-model="password"
                    type="password"
                    class="form-control input-lg"
                    id="password"
                    placeholder="Password"
                    autocomplete="current-password"
                  />
                </div>

                <div class="col-md-12">
                  <p v-if="error" class="text-danger mb-3">{{ error }}</p>

                  <div class="d-flex my-2 justify-content-between">
                    <div class="d-inline-block mr-3">
                      <label class="control control-checkbox">
                        Remember me
                        <input v-model="remember" type="checkbox" />
                        <div class="control-indicator"></div>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    class="btn btn-lg btn-primary btn-block mb-4"
                    :disabled="submitting"
                  >
                    {{ submitting ? 'Signing in…' : 'Sign In' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const ADMIN_BODY_CLASS = 'header-fixed sidebar-fixed sidebar-dark header-light'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const remember = ref(false)
const error = ref<string | null>(null)
const submitting = ref(false)

function safeRedirect(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return '/'
  }
  return value
}

async function onSubmit() {
  error.value = null
  const nextUsername = username.value.trim()
  if (!nextUsername || !password.value) {
    error.value = 'Username and password are required.'
    return
  }
  if (submitting.value) return

  submitting.value = true
  try {
    await auth.login(nextUsername, password.value, remember.value)
    await router.replace(safeRedirect(route.query.redirect))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Invalid username or password.'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  document.body.className = ''
})

onUnmounted(() => {
  document.body.className = ADMIN_BODY_CLASS
})
</script>

<style scoped>
.app-brand,
.brand-link {
  width: 100%;
}

.brand-link {
  display: flex;
  align-items: center;
  color: inherit;
}

.app-brand .brand-name {
  max-width: none;
  flex: 1;
  width: 100%;
}
</style>

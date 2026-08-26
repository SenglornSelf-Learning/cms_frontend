<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const { currentUser } = storeToRefs(auth)

const displayName = computed(() => currentUser.value?.username?.trim() || 'User')
const displayEmail = computed(() => currentUser.value?.email?.trim() || '')
const avatarSrc = '/theme/assets/img/user/user.png'

async function onLogout() {
  await auth.logout()
}
</script>

<template>
  <div class="navbar-right">
    <ul class="nav navbar-nav">
      <li class="dropdown user-menu">
        <button type="button" class="dropdown-toggle nav-link" data-toggle="dropdown">
          <img :src="avatarSrc" class="user-image" alt="User Image" />
          <span class="d-none d-lg-inline-block">{{ displayName }}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-right">
          <li class="dropdown-header">
            <img :src="avatarSrc" class="img-circle" alt="User Image" />
            <div class="d-inline-block">
              {{ displayName }}
              <small class="pt-1">{{ displayEmail }}</small>
            </div>
          </li>
          <li>
            <RouterLink :to="{ name: 'userProfile' }">
              <i class="mdi mdi-account"></i> My Profile
            </RouterLink>
          </li>
          <li class="dropdown-footer">
            <a href="#" @click.prevent="onLogout">
              <i class="mdi mdi-logout"></i> Log Out
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

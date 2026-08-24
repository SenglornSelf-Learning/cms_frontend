<template>
  <MasterContentLayout title="User Detail" col-class="col-lg-8">
    <DeleteModel
      :isOpen="deleteConfirmOpen"
      title="Delete"
      :message="deleteMessage"
      :loading="isDeleting"
      @close="closeDeleteConfirm"
      @confirm="confirmDelete"
    />

    <p v-if="error" class="text-danger mb-3">{{ error }}</p>

    <template v-if="user">
      <DataRows>
        <template #colgroup>
          <colgroup>
            <col style="width: 25%" />
            <col style="width: 75%" />
          </colgroup>
        </template>
        <tr>
          <th>Username</th>
          <td>{{ user.username || '-' }}</td>
        </tr>
        <tr>
          <th>Email</th>
          <td>{{ user.email || '-' }}</td>
        </tr>
        <tr>
          <th>Phone</th>
          <td>{{ user.phone || '-' }}</td>
        </tr>
        <tr>
          <th>Role</th>
          <td>{{ formatRoles(user.roles) }}</td>
        </tr>
        <tr>
          <th>Status</th>
          <td>{{ user.deletedYn === 'Y' ? 'Inactive' : 'Active' }}</td>
        </tr>
        <tr>
          <th>Created At</th>
          <td><FormattedNumber :value="user.createdAt" /></td>
        </tr>
      </DataRows>
    </template>

    <div class="mt-3 d-flex justify-content-end">
      <RouterLink to="/users" class="btn btn-secondary ml-2">Back to list</RouterLink>
      <RouterLink
        v-if="user"
        :to="{ name: 'userEdit', params: { id: user.id } }"
        class="btn btn-primary ml-2"
      >
        Edit
      </RouterLink>
      <button
        v-if="user"
        type="button"
        class="btn btn-danger ml-2"
        :disabled="isDeleting"
        @click="openDeleteConfirm"
      >
        {{ isDeleting ? 'Deleting…' : 'Delete' }}
      </button>
    </div>
  </MasterContentLayout>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import MasterContentLayout from '@/components/layout/content-layout/MasterContentLayout.vue'
import DataRows from '@/components/common/DataRows.vue'
import DeleteModel from '@/components/common/DeleteModel.vue'
import FormattedNumber from '@/components/common/FormattedNumber.vue'
import { getUserService } from '@/services'
import type { UserFields, UserRole } from '@/types/user'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const idRef = toRef(props, 'id')
const user = ref<UserFields | null>(null)
const error = ref<string | null>(null)
const isDeleting = ref(false)
const deleteConfirmOpen = ref(false)
const deleteMessage = computed(
  () => `Are you sure want to delete user "${user.value?.username ?? ''}"?`,
)

function openDeleteConfirm() {
  const id = Number(idRef.value)
  if (!Number.isFinite(id) || !user.value) return
  deleteConfirmOpen.value = true
}

function closeDeleteConfirm() {
  deleteConfirmOpen.value = false
}

function formatRoles(roles: UserRole[] | null | undefined): string {
  const labels = (roles ?? [])
    .map((role) => role?.roleType?.trim())
    .filter((roleType): roleType is string => Boolean(roleType))
  return labels.length > 0 ? labels.join(', ') : '-'
}

async function fetchUserDetail() {
  user.value = null
  error.value = null
  const id = Number(idRef.value)
  if (!Number.isFinite(id)) {
    error.value = 'Invalid user id'
    return
  }
  try {
    user.value = await getUserService().getUserById(id)
  } catch (err) {
    console.error('Failed to fetch user detail', err)
    error.value = err instanceof Error ? err.message : 'Failed to load user'
  }
}

async function confirmDelete() {
  const id = Number(idRef.value)
  if (!Number.isFinite(id) || !user.value) return
  if (isDeleting.value) return

  isDeleting.value = true
  error.value = null
  try {
    await getUserService().deleteUserById(id)
    deleteConfirmOpen.value = false
    await router.push('/users')
  } catch (err) {
    console.error('Failed to delete user', err)
    error.value = err instanceof Error ? err.message : 'Failed to delete user'
  } finally {
    isDeleting.value = false
  }
}

watch(idRef, () => {
  void fetchUserDetail()
}, { immediate: true })
</script>

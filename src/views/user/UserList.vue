<template>
  <MasterContentLayout title="User Management" actionTo="/users/create" actionLabel="Create New User">
    <TableTop
      :showKeywordSearch="true"
      :showKeywordSearchSelect="true"
      :keywordSearchOptions="keywordSearchOptions"
      :search-placeholder="'search keyword...'"
      v-model:keywordSearchValue="searchField"
      v-model:keywordTextValue="searchKeyword"
      :showSearchButton="true"
      :showResetButton="true"
      :showPage="true"
      :pageSize="itemsPerPage"
      @updatePageSize="onPageSizeChange"
      @searchFilter="handleSearch"
      @resetFilter="handleReset"
    />

    <div class="table-results-area" :class="{ 'is-loading': isLoading }">
      <p v-if="error" class="text-danger mb-3">{{ error }}</p>

      <TableList
        :columns="columns"
        :data="tableData"
        empty-text="No user found"
      >
        <template #role="{ row }">
          <span v-if="row.role" class="role-buttons">
            <button
              v-for="role in roleLabels(row.role)"
              :key="role"
              type="button"
              class="btn btn-square btn-sm"
              :class="roleButtonClass(role)"
            >
              {{ role }}
            </button>
          </span>
        </template>
      </TableList>

      <Pagination
        :total="totalItems"
        :limit="itemsPerPage"
        :current="currentPage"
        @change="onPageChange"
      />

      <div v-if="isLoading" class="loading-overlay" aria-busy="true" aria-live="polite">
        <ProgressSpinner style="width: 50px; height: 50px" stroke-width="4" />
        <div class="loading-text">Loading…</div>
      </div>
    </div>
  </MasterContentLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MasterContentLayout from '@/components/layout/content-layout/MasterContentLayout.vue'
import TableTop, { type SelectOption } from '@/components/common/TableTop.vue'
import TableList, { type TableColumn, type TableRow } from '@/components/common/TableList.vue'
import Pagination from '@/components/common/Pagination.vue'
import ProgressSpinner from '@/components/common/ProgressSpinner.vue'
import { getUserService } from '@/services'
import type { UserListItem } from '@/types/user'

type UserSearchField = 'username' | 'email' | 'phone'

const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const tableData = ref<TableRow[]>([])
const error = ref<string | null>(null)
const isLoading = ref(false)
const searchKeyword = ref('')
const searchField = ref<UserSearchField>()
const keywordSearchOptions: SelectOption[] = [
  { label: 'All', value: '' },
  { label: 'Username', value: 'username' },
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
]

const columns = computed<TableColumn[]>(() => [
  { key: 'no', label: 'No', width: '6%' },
  { key: 'username', label: 'Username' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'role', label: 'Role' },
])

function handleSearch(keyword: string) {
  searchKeyword.value = keyword
  currentPage.value = 1
  void fetchUsers()
}

function handleReset() {
  searchKeyword.value = ''
  currentPage.value = 1
  void fetchUsers()
}

function roleLabels(role: unknown): string[] {
  if (typeof role !== 'string' || role.trim() === '' || role === '-') return []
  return role.split(',').map((label) => label.trim()).filter(Boolean)
}

function roleButtonClass(role: string): string {
  const roleType = role.toUpperCase()
  if (roleType === 'ADMIN') return 'btn-primary'
  if (roleType === 'EDITOR') return 'btn-success'
  return 'btn-secondary'
}

function mapUserToRow(item: UserListItem, index: number, totalCount: number): TableRow {
  const rowOffset = itemsPerPage.value * (currentPage.value - 1) + index
  return {
    id: item.id,
    no: totalCount - rowOffset,
    username: {
      type: 'link',
      value: item.username,
      to: { name: 'userDetail', params: { id: item.id } },
    },
    email: item.email,
    phone: item.phone,
    role: item.role,
  }
}

async function fetchUsers() {
  isLoading.value = true
  error.value = null
  try {
    const keyword = searchKeyword.value.trim() || undefined
    const result = await getUserService().getUsers({
      pageIndex: currentPage.value,
      pageSize: itemsPerPage.value,
      orderBy: 'createdAt,DESC',
      username: searchField.value === 'username' ? keyword : undefined,
      email: searchField.value === 'email' ? keyword : undefined,
      phone: searchField.value === 'phone' ? keyword : undefined,
    })
    tableData.value = result.users.map((item, index) =>
      mapUserToRow(item, index, result.totalCount),
    )
    totalItems.value = result.totalCount
  } catch (err) {
    console.error('Failed to load users', err)
    tableData.value = []
    totalItems.value = 0
    error.value = err instanceof Error ? err.message : 'Failed to load users'
  } finally {
    isLoading.value = false
  }
}

function onPageSizeChange(size: number) {
  itemsPerPage.value = size
  currentPage.value = 1
  void fetchUsers()
}

function onPageChange(page: number) {
  currentPage.value = page
  void fetchUsers()
}

onMounted(() => {
  void fetchUsers()
})
</script>

<style scoped>
.table-results-area {
  position: relative;
}

.table-results-area.is-loading {
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

.role-buttons {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}




</style>

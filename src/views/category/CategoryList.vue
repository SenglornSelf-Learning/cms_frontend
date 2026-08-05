<template>
  <MasterContentLayout title="Category Management">
    <TableTop
      :show-search-category="false"
      :show-keyword-search="false"
      :show-search-button="false"
      :show-reset-button="false"
      :show-page="true"
      :page-size="itemsPerPage"
      @update:page-size="onPageSizeChange"
    >
      <template #right>
        <RouterLink class="btn btn-primary btn-sm" to="/categories/new">
          Create New Category
        </RouterLink>
      </template>
    </TableTop>

    <div class="table-results-area" :class="{ 'is-loading': isLoading }">
      <p v-if="error" class="text-danger mb-3">{{ error }}</p>

      <NewTable
        :columns="columns"
        :data="tableData"
        empty-text="No categories"
      >
        <template #status="{ row }">
          <button
            type="button"
            class="btn-square btn-sm"
            :class="row.statusLabel === 'Inactive' ? 'btn-secondary' : 'btn-success'"
          >
            {{ row.statusLabel }}
          </button>
        </template>
        <template #action="{ row }">
          <RouterLink
            v-if="row.id"
            class="text-success mr-2"
            :to="`/categories/${row.id}`"
          >
            View
          </RouterLink>
          <span class="text-muted ml-2 btn-square btn-sm btn-danger">Delete</span>
        </template>
      </NewTable>

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
import TableTop from '@/components/common/TableTop.vue'
import NewTable, { type TableColumn, type TableRow } from '@/components/common/NewTable.vue'
import Pagination from '@/components/common/Pagination.vue'
import ProgressSpinner from '@/components/common/ProgressSpinner.vue'
import { getCategoryService, type CategoryListItem } from '@/services'

const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const tableData = ref<TableRow[]>([])
const error = ref<string | null>(null)
const isLoading = ref(false)

const columns = computed<TableColumn[]>(() => [
  { key: 'no', label: '#', width: '6%' },
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status', width: '12%' },
  { key: 'action', label: 'Action', width: '18%' },
])

function mapCategoryToRow(item: CategoryListItem): TableRow {
  return {
    id: item.id,
    no: item.no,
    name: item.name,
    statusLabel: item.statusLabel,
    status: item.status,
    action: '',
  }
}

async function fetchCategories() {
  isLoading.value = true
  error.value = null
  try {
    const result = await getCategoryService().getCategories({
      pageIndex: currentPage.value,
      pageSize: itemsPerPage.value,
    })
    tableData.value = result.categories.map(mapCategoryToRow)
    totalItems.value = result.totalCount
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load categories'
    tableData.value = []
    totalItems.value = 0
  } finally {
    isLoading.value = false
  }
}

function onPageSizeChange(size: number) {
  itemsPerPage.value = size
  currentPage.value = 1
  void fetchCategories()
}

function onPageChange(page: number) {
  currentPage.value = page
  void fetchCategories()
}

onMounted(() => {
  void fetchCategories()
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
</style>

<template>
  <MasterContentLayout title="Category Management" actionTo="/categories/create" actionLabel="Create New Category">
    <TableTop
      :showKeywordSearch="true"
      search-placeholder="Search category name…"
      v-model:keywordTextValue="searchKeyword"
      
      :showSearchButton="true"
      :showResetButton="true"
      :showPage="true"
      :pageSize="itemsPerPage"
      @updatePageSize="onPageSizeChange"
      @searchFilter="handleSearch"
      @resetFilter="handleReset"
    >
    </TableTop>

    <div class="table-results-area" :class="{ 'is-loading': isLoading }">
      <p v-if="error" class="text-danger mb-3">{{ error }}</p>

      <NewTable
        :columns="columns"
        :data="tableData"
        empty-text="No category found"
      >
        <template #status="{ row }">
          <button
            type="button"
            class="btn-square btn-sm"
            :class="row.status === 'Inactive' ? 'btn-secondary' : 'btn-success'"
          >
            {{ row.status }}
          </button>
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
const searchKeyword = ref('')

const columns = computed<TableColumn[]>(() => [
  { key: 'no', label: 'No', width: '6%' },
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status', width: '12%' },
])

/** Active = N, Inactive = Y (matches API status). */
function formatStatusLabel(status: CategoryListItem['status']): string {
  return status === 'Y' ? 'Inactive' : 'Active'
}

function handleSearch(keyword: string) {
  searchKeyword.value = keyword
  currentPage.value = 1
  void fetchCategories()
}

function handleReset() {
  searchKeyword.value = ''
  currentPage.value = 1
  void fetchCategories()
}

function mapCategoryToRow(item: CategoryListItem, index: number, totalCount: number): TableRow {
  const rowOffset = itemsPerPage.value * (currentPage.value - 1) + index
  return {
    id: item.id,
    no: totalCount - rowOffset,
    name: {
      type: 'link',
      value: item.name,
      to: `/categories/detail/${item.id}`,
    },
    status: formatStatusLabel(item.status),
  }
}

async function fetchCategories() {
  isLoading.value = true
  error.value = null
  try {
    const result = await getCategoryService().getCategories({
      pageIndex: currentPage.value,
      pageSize: itemsPerPage.value,
      orderBy: 'createdAt,DESC',
      name: searchKeyword.value.trim() || undefined,
    })
    tableData.value = result.categories.map((item, index) =>
      mapCategoryToRow(item, index, result.totalCount),
    )
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

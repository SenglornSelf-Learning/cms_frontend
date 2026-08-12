<template>
  <MasterContentLayout title="Content Management" actionTo="/contents/create" actionLabel="Create New Content">
    <TableTop
      :showKeywordSearch="true"
      search-placeholder="Search content title…"
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
        empty-text="No content found"
      />

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
import TableList, { type TableColumn, type TableRow } from '@/components/common/TableList.vue'
import Pagination from '@/components/common/Pagination.vue'
import ProgressSpinner from '@/components/common/ProgressSpinner.vue'
import { getContentService } from '@/services'
import type { ContentListItem } from '@/types/content'

const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const tableData = ref<TableRow[]>([])
const error = ref<string | null>(null)
const isLoading = ref(false)
const searchKeyword = ref('')

const columns = computed<TableColumn[]>(() => [
  { key: 'no', label: 'No', width: '6%' },
  { key: 'title', label: 'Title' },
  { key: 'editor', label: 'Editor' },
  { key: 'slug', label: 'Slug' },
  { key: 'categoryId', label: 'Category', width: '12%' },
])

function handleSearch(keyword: string) {
  searchKeyword.value = keyword
  currentPage.value = 1
  void fetchContents()
}

function handleReset() {
  searchKeyword.value = ''
  currentPage.value = 1
  void fetchContents()
}

function mapContentToRow(item: ContentListItem, index: number, totalCount: number): TableRow {
  const rowOffset = itemsPerPage.value * (currentPage.value - 1) + index
  return {
    id: item.id,
    no: totalCount - rowOffset,
    title: {
      type: 'link',
      value: item.title,
      to: { name: 'contentDetail', params: { id: item.id } },
    },
    editor: item.editor,
    slug: item.slug,
    categoryId: item.categoryId ?? '-',
  }
}

async function fetchContents() {
  isLoading.value = true
  error.value = null
  try {
    const result = await getContentService().getContents({
      pageIndex: currentPage.value,
      pageSize: itemsPerPage.value,
      orderBy: 'createdAt,DESC',
      title: searchKeyword.value.trim() || undefined,
    })

    tableData.value = result.contents.map((item, index) =>
      mapContentToRow(item, index, result.totalCount),
    )
    totalItems.value = result.totalCount
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load contents'
    tableData.value = []
    totalItems.value = 0
  } finally {
    isLoading.value = false
  }
}

function onPageSizeChange(size: number) {
  itemsPerPage.value = size
  currentPage.value = 1
  void fetchContents()
}

function onPageChange(page: number) {
  currentPage.value = page
  void fetchContents()
}

onMounted(() => {
  void fetchContents()
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

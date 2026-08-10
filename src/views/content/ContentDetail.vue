<template>
  <MasterContentLayout title="content Detail" col-class="col-lg-8">
    <template v-if="content">
      <RowTable>
        <template #colgroup>
          <colgroup>
            <col style="width: 25%" />
            <col style="width: 75%" />
          </colgroup>
        </template>
        <tr>
          <th>Title</th>
          <td>{{ content.title }}</td>
        </tr>
        <tr>
          <th>Editor</th>
          <td>{{ content.editor }}</td>
        </tr>
        <tr>
          <th>Thumbnail</th>
          <td>{{ content.thumbnail }}</td>
        </tr>
        <tr>
          <th>Keyword</th>
          <td>{{ content.keyword }}</td>
        </tr>
        <tr>
          <th>Description</th>
          <td>{{ content.description }}</td>
        </tr>
        <tr>
          <th>Category</th>
          <td>{{ content.categoryId }}</td>
        </tr>
        <tr>
          <th>Created At</th>
          <td>{{ content.createdAt }}</td>
        </tr>
      </RowTable>
    </template>
    <div class="mt-3 d-flex justify-content-end">
      <RouterLink to="/categories" class="btn btn-secondary ml-2">Back to list</RouterLink>
      <RouterLink
        v-if="content"
        :to="{ name: 'contentEdit', params: { id: content.id } }"
        class="btn btn-primary ml-2"
      >
        Edit
      </RouterLink>
      <button
        v-if="content"
        type="button"
        class="btn btn-danger ml-2"
        :disabled="deleting"
        @click="deletecontent"
      >
        {{ deleting ? 'Deleting…' : 'Delete' }}
      </button>
    </div>
  </MasterContentLayout>
</template>

<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import MasterContentLayout from '@/components/layout/content-layout/MasterContentLayout.vue'
import RowTable from '@/components/common/RowTable.vue'
import { getContentService } from '@/services/content-service'
import { getCategoryService } from '@/services/category-service'

import type { CmsContent } from '@/types/content'
import type { Category } from '@/types/category'

const props = defineProps<{
  id: string
}>()

const idRef = toRef(props, 'id')
const content = ref<CmsContent | null>(null)
const error = ref<string | null>(null)
const loading = ref(true)
const category = ref<Category | null>(null)

async function fetchContentDetail() {
  loading.value = true
  error.value = null
  content.value = null
  const numericId = Number(idRef.value)
  if (!Number.isFinite(numericId)) {
    error.value = 'Invalid id'
    loading.value = false
    return
  }
  try {
    content.value = await getContentService().getContentById(numericId)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Not found'
  } finally {
    loading.value = false
  }
}

async function fetchCategoryDetail() {
  loading.value = true
  error.value = null
  category.value = null
  const id = Number(idRef.value)
  if (!Number.isFinite(id)) {
    error.value = 'Invalid id'
    loading.value = false
    return
  }
  try {
    category.value = await getCategoryService().getCategoryById(id)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Not found'
  } finally {
    loading.value = false
  }
}

watch(idRef, () => {
  void fetchContentDetail()
}, { immediate: true })
</script>

<style scoped>
.content-editor {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>

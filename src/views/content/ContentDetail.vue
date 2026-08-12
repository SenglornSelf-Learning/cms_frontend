<template>
  <MasterContentLayout title="Content Detail" col-class="col-lg-8">
    <template v-if="content">
      <DataRows>
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
          <td>{{ categoryDetail?.name || 'N/A' }}</td>
        </tr>
        <tr>
          <th>Created At</th>
          <td>{{ content.createdAt }}</td>
        </tr>
      </DataRows>
    </template>
    <div class="mt-3 d-flex justify-content-end">
      <RouterLink to="/contents" class="btn btn-secondary ml-2">Back to list</RouterLink>
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
        :disabled="isDeleting"
        @click="deleteContent"
      >
        {{ isDeleting ? 'Deleting…' : 'Delete' }}
      </button>
    </div>
  </MasterContentLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MasterContentLayout from '@/components/layout/content-layout/MasterContentLayout.vue'
import DataRows from '@/components/common/DataRows.vue'
import { getContentService } from '@/services/content-service'
import { getCategoryService } from '@/services/category-service'

import type { ContentFields } from '@/types/content'
import type { CategoryFields } from '@/types/category'

const props = defineProps<{
  id: number
}>()
const contentId = props.id
const router = useRouter()
const content = ref<ContentFields | null>(null)
const categoryDetail = ref<CategoryFields | null>(null)
const isError = ref<string | null>(null)
const isLoading = ref(true)
const isDeleting = ref(false)

async function fetchContentDetail() {
  isLoading.value = true
  isError.value = null
 
  if (!Number.isFinite(contentId)) {
    isError.value = 'Invalid id'
    isLoading.value = false
    return
  }

  try {
    content.value = await getContentService().getContentById(contentId)
    await fetchCategoryDetail()
  } catch (e) {
    isError.value = e instanceof Error ? e.message : 'Not found'
  } finally {
    isLoading.value = false
  }
}

async function fetchCategoryDetail() {
  const categoryId = content.value?.categoryId
  if (!categoryId) {
    categoryDetail.value = null
    return
  }

  try {
    categoryDetail.value = await getCategoryService().getCategoryById(categoryId)
  } catch (e) {
    isError.value = e instanceof Error ? e.message : 'Category not found'
  }
}

async function deleteContent() {
  if (!Number.isFinite(props.id) || !content.value) return
  if (!confirm(`Delete content "${content.value.title}"?`)) return

  isDeleting.value = true
  isError.value = null
  try {
    await getContentService().deleteContent(props.id)
    await router.push('/contents')
  } catch (e) {
    isError.value = e instanceof Error ? e.message : 'Delete failed'
  } finally {
    isDeleting.value = false
  }
}

watch(
  () => props.id,
  () => {
    void fetchContentDetail()
  },
  { immediate: true },
)
</script>

<style scoped>
.content-editor {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>

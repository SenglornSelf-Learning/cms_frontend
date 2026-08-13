<template>
  <MasterContentLayout title="Content Detail" col-class="col-lg-8">
    <!-- delete confirm modal -->
    <DeleteModel
      :isOpen="deleteConfirmOpen"
      title="Delete"
      :message="deleteMessage"
      :loading="isDeleting"
      @close="closeDeleteConfirm"
      @confirm="confirmDelete"
    />

    <!-- content details -->
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
          <td><FormattedNumber :value="content.createdAt" /></td>
        </tr>
      </DataRows>
    </template>

    <!-- action buttons -->
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
        @click="openDeleteConfirm"
      >
        {{ isDeleting ? 'Deleting…' : 'Delete' }}
      </button>
    </div>
  </MasterContentLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MasterContentLayout from '@/components/layout/content-layout/MasterContentLayout.vue'
import DataRows from '@/components/common/DataRows.vue'
import DeleteModel from '@/components/common/DeleteModel.vue'
import FormattedNumber from '@/components/common/FormattedNumber.vue'
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
const isLoading = ref(true)

const isDeleting = ref(false)
const deleteConfirmOpen = ref(false)
const deleteMessage = computed(
  () => `Are you sure want to delete content "${content.value?.title ?? ''}"?`,
)

function openDeleteConfirm() {
  if (!Number.isFinite(props.id) || !content.value) return
  deleteConfirmOpen.value = true
}

function closeDeleteConfirm() {
  deleteConfirmOpen.value = false
}

async function fetchContentDetail() {
  isLoading.value = true
 
  if (!Number.isFinite(contentId)) {
    console.error('Invalid id', contentId)
    isLoading.value = false
    return
  }

  try {
    content.value = await getContentService().getContentById(contentId)
    await fetchCategoryDetail()
  } catch (err) {
    console.error('Failed to fetch content detail', err)
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
  } catch (err) {
    console.error('Failed to fetch category detail', err)
  }
}

// confirm delete
async function confirmDelete() {
  if (!Number.isFinite(props.id) || !content.value) return
  if (isDeleting.value) return

  isDeleting.value = true
  try {
    await getContentService().deleteContent(props.id)
    deleteConfirmOpen.value = false
    await router.push('/contents')
  } catch (err) {
    console.error('Failed to delete content', err)
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

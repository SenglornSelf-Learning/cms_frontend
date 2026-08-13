<template>
  <MasterContentLayout title="Category Detail" col-class="col-lg-8">
    <DeleteModel
      :isOpen="deleteConfirmOpen"
      title="Delete"
      :message="deleteMessage"
      :loading="isDeleting"
      @close="closeDeleteConfirm"
      @confirm="confirmDelete"
    />

    <template v-if="category">
      <DataRows>
        <template #colgroup>
          <colgroup>
            <col style="width: 25%" />
            <col style="width: 75%" />
          </colgroup>
        </template>
        <tr>
          <th>Name</th>
          <td>{{ category.name }}</td>
        </tr>
        <tr>
          <th>Status</th>
          <td>{{ category.status === 'Y' ? 'Inactive' : 'Active' }}</td>
        </tr>
        <tr>
          <th>Created At</th>
          <td><FormattedNumber :value="category.createdAt" /></td>
        </tr>
      </DataRows>
    </template>
    <div class="mt-3 d-flex justify-content-end">
      <RouterLink to="/categories" class="btn btn-secondary ml-2">Back to list</RouterLink>
      <RouterLink
        v-if="category"
        :to="{ name: 'categoryEdit', params: { id: category.id } }"
        class="btn btn-primary ml-2"
      >
        Edit
      </RouterLink>
      <button
        v-if="category"
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
import { getCategoryService } from '@/services'
import type { CategoryFields } from '@/types/category'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const idRef = toRef(props, 'id')
const category = ref<CategoryFields | null>(null)
const isLoading = ref(true)
const isDeleting = ref(false)
const deleteConfirmOpen = ref(false)
const deleteMessage = computed(
  () => `Are you sure want to delete category "${category.value?.name ?? ''}"?`,
)

function openDeleteConfirm() {
  const id = Number(idRef.value)
  if (!Number.isFinite(id) || !category.value) return
  deleteConfirmOpen.value = true
}

function closeDeleteConfirm() {
  deleteConfirmOpen.value = false
}

async function fetchCategoryDetail() {
  isLoading.value = true
  category.value = null
  const id = Number(idRef.value)
  if (!Number.isFinite(id)) {
    console.error('Invalid id', id)
    isLoading.value = false
    return
  }
  try {
    category.value = await getCategoryService().getCategoryById(id)
  } catch (err) {
    console.error('Failed to fetch category detail', err)
  } finally {
    isLoading.value = false
  }
}

async function confirmDelete() {
  const id = Number(idRef.value)
  if (!Number.isFinite(id) || !category.value) return
  if (isDeleting.value) return

  isDeleting.value = true
  try {
    await getCategoryService().deleteCategory(id)
    deleteConfirmOpen.value = false
    await router.push('/categories')
  } catch (err) {
    console.error('Failed to delete category', err)
  } finally {
    isDeleting.value = false
  }
}

watch(idRef, () => {
  void fetchCategoryDetail()
}, { immediate: true })
</script>

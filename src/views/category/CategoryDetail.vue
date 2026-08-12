<template>
  <MasterContentLayout title="Category Detail" col-class="col-lg-8">
    <template v-if="category">
      <DataRows>
        <template #colgroup>
          <colgroup>
            <col style="width: 25%" />
            <col style="width: 75%" />
          </colgroup>
        </template>
        <tr>
          <th>Id</th>
          <td>{{ category.id }}</td>
        </tr>
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
          <td>{{ category.createdAt }}</td>
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
        @click="deleteCategory"
      >
        {{ isDeleting ? 'Deleting…' : 'Delete' }}
      </button>
    </div>
  </MasterContentLayout>
</template>

<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import MasterContentLayout from '@/components/layout/content-layout/MasterContentLayout.vue'
import DataRows from '@/components/common/DataRows.vue'
import { getCategoryService } from '@/services'
import type { CategoryFields } from '@/types/category'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const idRef = toRef(props, 'id')
const category = ref<CategoryFields | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(true)
const isDeleting = ref(false)

async function fetchCategoryDetail() {
  isLoading.value = true
  error.value = null
  category.value = null
  const id = Number(idRef.value)
  if (!Number.isFinite(id)) {
    error.value = 'Invalid id'
    isLoading.value = false
    return
  }
  try {
    category.value = await getCategoryService().getCategoryById(id)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Not found'
  } finally {
    isLoading.value = false
  }
}

async function deleteCategory() {
  const id = Number(idRef.value)
  if (!Number.isFinite(id) || !category.value) return
  if (!confirm(`Delete category "${category.value.name}"?`)) return

  isDeleting.value = true
  error.value = null
  try {
    await getCategoryService().deleteCategory(id)
    await router.push('/categories')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Delete failed'
  } finally {
    isDeleting.value = false
  }
}

watch(idRef, () => {
  void fetchCategoryDetail()
}, { immediate: true })
</script>

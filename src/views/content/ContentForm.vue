<template>
  <MasterContentLayout title="Create content" col-class="col-lg-8">
    <form @submit.prevent="onSubmit">
      <FormRows
        label="Title"
        required
        input-id="title"
        v-model="form.title"
        :error="fieldErrors.title"
        @update:modelValue="clearFieldError('title')"
      />

      <FormRows
        label="Slug"
        input-id="slug"
        v-model="form.slug"
        :error="fieldErrors.slug"
        @update:modelValue="clearFieldError('slug')"
      />

      <FormRows
        label="Category"
        required
        type="select"
        input-id="category"
        v-model="form.categoryId"
        :options="categoryOptions"
        :disabled="isLoading"
        :error="fieldErrors.categoryId"
        @update:modelValue="clearFieldError('categoryId')"
      />

      <FormRows
        label="Keyword"
        input-id="keyword"
        v-model="form.keyword"
        :error="fieldErrors.keyword"
        @update:modelValue="clearFieldError('keyword')"
      />

      <FormRows
        label="Description"
        type="textarea"
        input-id="description"
        :rows="3"
        v-model="form.description"
        :error="fieldErrors.description"
        @update:modelValue="clearFieldError('description')"
      />

      <FormRows
        label="Thumbnail URL"
        input-id="thumbnail"
        v-model="form.thumbnail"
        :error="fieldErrors.thumbnail"
        @update:modelValue="clearFieldError('thumbnail')"
      />

      <FormRows
        label="Content"
        type="textarea"
        input-id="editor"
        :rows="8"
        v-model="form.editor"
        :error="fieldErrors.editor"
        @update:modelValue="clearFieldError('editor')"
      />

      <div class="form_actions">
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Submitting…' : 'Save' }}
        </button>
        <RouterLink to="/contents" class="btn btn-light ml-2">Cancel</RouterLink>
      </div>
    </form>
  </MasterContentLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MasterContentLayout from '@/components/layout/content-layout/MasterContentLayout.vue'
import FormRows, { type FormRowOption } from '@/components/common/FormRows.vue'
import { getCategoryService, getContentService } from '@/services'
import type { CategoryListItem } from '@/types/category'
import type { CreateContentPayload } from '@/types/content'

const router = useRouter()
const route = useRoute()
const categories = ref<CategoryListItem[]>([])
const isLoading = ref(true)
const submitting = ref(false)

type FieldErrors = Partial<Record<'title' | 'slug' | 'keyword' | 'description' | 'thumbnail' | 'editor' | 'categoryId', string>>
const fieldErrors = ref<FieldErrors>({})

function clearFieldError(field: keyof FieldErrors) {
  if (!fieldErrors.value[field]) return
  fieldErrors.value = { ...fieldErrors.value, [field]: undefined }
}

const form = ref<CreateContentPayload>({
  title: '',
  slug: '',
  keyword: '',
  description: '',
  thumbnail: '',
  editor: '',
  categoryId: null as number | null,
})

const categoryOptions = computed<FormRowOption[]>(() => [
  { label: 'No category', value: null },
  ...categories.value.map((category) => ({
    label: category.name,
    value: category.id ?? null,
  })),
])

function resetForm() {
  form.value = {
    title: '',
    slug: '',
    keyword: '',
    description: '',
    thumbnail: '',
    editor: '',
    categoryId: null as number | null,
  }
  fieldErrors.value = {}
  submitting.value = false
}

function createContentPayload(): CreateContentPayload {
  return {
    title: form.value.title.trim(),
    slug: form.value.slug?.trim(),
    keyword: form.value.keyword?.trim(),
    description: form.value.description?.trim(),
    thumbnail: form.value.thumbnail?.trim(),
    editor: form.value.editor?.trim(),
    categoryId: form.value.categoryId,
  }
}

function validateForm(): boolean {
  if (!form.value.title.trim()) {
    fieldErrors.value.title = 'Title is required'
    return false
  }
  if (!form.value.categoryId) {
    fieldErrors.value.categoryId = 'Category is required'
    return false
  }
  return true
}

async function fetchCategories() {
  isLoading.value = true
  try {
    const { categories: rows } = await getCategoryService().getCategories({
      pageIndex: 1,
      pageSize: 1000,
      orderBy: 'createdAt,DESC',
    })
    categories.value = rows
  } catch (err) {
    console.error('Failed to load categories', err)
  } finally {
    isLoading.value = false
  }
}

// checking for edit route
const isContentEditRoute = computed(() => route.name === 'contentEdit')
const isEdit = computed(() => isContentEditRoute.value)
const contentEditId = computed(() => {
  if (!isContentEditRoute.value) return undefined
  return route.params.id
})

async function fetchContentDetail() {
  if (!isEdit.value) return
  const id = Number(contentEditId.value)
  if (!Number.isFinite(id)) return

  try {
    const content = await getContentService().getContentById(id)
    const categoryId = content.categoryId != null &&
      categories.value.some((c) => c.id === content.categoryId) ? content.categoryId : null

    form.value = {
      title: content.title ?? '',
      slug: content.slug ?? '',
      keyword: content.keyword ?? '',
      description: content.description ?? '',
      thumbnail: content.thumbnail ?? '',
      editor: content.editor ?? '',
      categoryId,
    }
  } catch (err) {
    console.error('Failed to fetch content detail', err)
  }
}
// edit finished

async function onSubmit() {
  if (!validateForm()) return
  const payload = createContentPayload()
  submitting.value = true

  try {
    if(isEdit.value) {
      await getContentService().updateContent(Number(contentEditId.value), payload)
    } else {
      await getContentService().createContent(payload)
    }
  } catch (err) {
    console.error('Failed to save content', err)
  } finally {
    submitting.value = false
    await router.push('/contents')
    resetForm()
  }
}

onMounted(async () => {
  await fetchCategories()
  await fetchContentDetail()
})
</script>

<style scoped>
.form_actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding: 0 0.8rem;
}
</style>

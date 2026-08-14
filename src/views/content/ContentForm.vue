<template>
  <MasterContentLayout :title="isEdit ? 'Edit content' : 'Create content'" col-class="col-lg-8">
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
        label="Thumbnails"
        type="file"
        input-id="thumbnails"
        multiple
        accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
        hint="Images only (jpg, jpeg, png, gif, webp). Max 5 MB each."
        :files="filesForDisplay"
        :error="fieldErrors.thumbnail"
        @file-change="onFileChange"
        @file-remove="onFileRemove"
        @file-mark-delete="onFileMarkDelete"
        @file-unmark-delete="onFileUnmarkDelete"
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
import FormRows, { type FormFileItem, type FormRowOption } from '@/components/common/FormRows.vue'
import { getCategoryService, getContentService } from '@/services'
import type { CategoryListItem } from '@/types/category'
import type { ContentThumbnail, CreateContentPayload } from '@/types/content'

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp'])
const ALLOWED_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
const MAX_FILE_BYTES = 5 * 1024 * 1024

const router = useRouter()
const route = useRoute()
const categories = ref<CategoryListItem[]>([])
const isLoading = ref(true)
const submitting = ref(false)
const selectedFiles = ref<File[]>([])
const existingThumbnails = ref<ContentThumbnail[]>([])
const deletedThumbnailIds = ref<number[]>([])

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

const filesForDisplay = computed<FormFileItem[]>(() => [
  ...existingThumbnails.value.map((thumbnail) => ({
    name: thumbnail.originalFileName,
    size: thumbnail.fileSize,
    pendingDelete: deletedThumbnailIds.value.includes(thumbnail.id),
  })),
  ...selectedFiles.value.map((file) => ({
    name: file.name,
    size: file.size,
  })),
])

function resetForm() {
  form.value = {
    title: '',
    slug: '',
    keyword: '',
    description: '',
    editor: '',
    categoryId: null as number | null,
  }
  selectedFiles.value = []
  existingThumbnails.value = []
  deletedThumbnailIds.value = []
  fieldErrors.value = {}
  submitting.value = false
}

function fileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.')
  if (dot < 0 || dot === fileName.length - 1) return ''
  return fileName.slice(dot + 1).toLowerCase()
}

function normalizeContentType(contentType: string): string {
  const normalized = contentType.trim().toLowerCase().split(';')[0] ?? ''
  return normalized === 'image/jpg' ? 'image/jpeg' : normalized
}

function validateSelectedFiles(files: File[]): string | undefined {
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return 'The selected file exceeds the maximum file size of 5 MB.'
    }
    const extension = fileExtension(file.name)
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return `The ${extension ? extension.toUpperCase() : 'missing'} file extension is not allowed. Allowed: jpg, jpeg, png, gif, webp.`
    }
    if (file.type) {
      const contentType = normalizeContentType(file.type)
      if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
        return 'The file type is not allowed. Allowed: jpg, jpeg, png, gif, webp.'
      }
    }
  }
  return undefined
}

function onFileChange(files: File[]) {
  if (!files.length) return

  const error = validateSelectedFiles(files)
  if (error) {
    fieldErrors.value.thumbnail = error
    return
  }
  selectedFiles.value = [...selectedFiles.value, ...files]
  clearFieldError('thumbnail')
}

function onFileRemove(index: number) {
  const existingCount = existingThumbnails.value.length
  if (index < existingCount) return
  selectedFiles.value.splice(index - existingCount, 1)
  clearFieldError('thumbnail')
}

function onFileMarkDelete(index: number) {
  const thumbnail = existingThumbnails.value[index]
  if (!thumbnail) return
  if (!deletedThumbnailIds.value.includes(thumbnail.id)) {
    deletedThumbnailIds.value = [...deletedThumbnailIds.value, thumbnail.id]
  }
  clearFieldError('thumbnail')
}

function onFileUnmarkDelete(index: number) {
  const thumbnail = existingThumbnails.value[index]
  if (!thumbnail) return
  deletedThumbnailIds.value = deletedThumbnailIds.value.filter((id) => id !== thumbnail.id)
}

function createContentPayload(): CreateContentPayload {
  return {
    title: form.value.title.trim(),
    slug: form.value.slug?.trim(),
    keyword: form.value.keyword?.trim(),
    description: form.value.description?.trim(),
    editor: form.value.editor?.trim(),
    categoryId: form.value.categoryId,
    files: selectedFiles.value,
    deletedThumbnailIds: deletedThumbnailIds.value,
  }
}

function validateForm(): boolean {
  fieldErrors.value = {}
  if (!form.value.title.trim()) {
    fieldErrors.value.title = 'Title is required'
    return false
  }
  if (!form.value.categoryId) {
    fieldErrors.value.categoryId = 'Category is required'
    return false
  }
  const fileError = validateSelectedFiles(selectedFiles.value)
  if (fileError) {
    fieldErrors.value.thumbnail = fileError
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
      editor: content.editor ?? '',
      categoryId,
    }
    existingThumbnails.value = content.thumbnails ?? []
    deletedThumbnailIds.value = []
    selectedFiles.value = []
  } catch (err) {
    console.error('Failed to fetch content detail', err)
  }
}

async function onSubmit() {
  if (!validateForm()) return
  const payload = createContentPayload()
  submitting.value = true

  try {
    if (isEdit.value) {
      await getContentService().updateContent(Number(contentEditId.value), payload)
    } else {
      await getContentService().createContent(payload)
    }
    await router.push('/contents')
    resetForm()
  } catch (err) {
    console.error('Failed to save content', err)
    fieldErrors.value.thumbnail = err instanceof Error ? err.message : 'Failed to save content'
  } finally {
    submitting.value = false
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

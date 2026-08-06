<template>
  <MasterContentLayout title="Create category" col-class="col-lg-8">
    <p v-if="error" class="text-danger">{{ error }}</p>
    <form @submit.prevent="onSubmit">
      <div class="form-group">
        <label for="name">Name <span class="text-danger">*</span></label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': fieldErrors.name }"
          autocomplete="off"
          @input="clearFieldError('name')"
        />
        <div v-if="fieldErrors.name" class="invalid-feedback d-block">
          {{ fieldErrors.name }}
        </div>
      </div>

      <div class="form-group">
        <label class="d-block">Status</label>
        <div class="d-flex align-items-center" style="gap: 1.5rem">
          <label class="mb-0" style="cursor: pointer">
            <input v-model="form.status" type="radio" name="status" value="N" class="mr-1" />
            Active
          </label>
          <label class="mb-0" style="cursor: pointer">
            <input v-model="form.status" type="radio" name="status" value="Y" class="mr-1" />
            Inactive
          </label>
        </div>
      </div>

      <div class="d-flex justify-content-end">
        <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Saving…' : 'Save' }}
      </button>
      <RouterLink to="/categories" class="btn btn-secondary ml-2">Cancel</RouterLink>
      </div>
    </form>
  </MasterContentLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MasterContentLayout from '@/components/layout/content-layout/MasterContentLayout.vue'
import { getCategoryService, type CreateCategoryPayload } from '@/services'

const router = useRouter()
const route = useRoute()
const submitting = ref(false)
const error = ref<string | null>(null)

/** Active = N, Inactive = Y */
type CategoryStatus = 'N' | 'Y'

type FieldErrors = Partial<Record<'name', string>>
const fieldErrors = ref<FieldErrors>({})

const form = ref({
  name: '',
  status: 'N' as CategoryStatus,
})

function clearFieldError(field: keyof FieldErrors) {
  if (!fieldErrors.value[field]) return
  fieldErrors.value = { ...fieldErrors.value, [field]: undefined }
}

function validateForm(): boolean {
  const errors: FieldErrors = {}
  if (!form.value.name.trim()) {
    errors.name = 'Name is required'
  }

  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

function resetForm() {
  form.value = { name: '', status: 'N' }
  fieldErrors.value = {}
  error.value = null
  submitting.value = false
}

/** Build payload matching CategoryRequest. */
function buildCategoryPayload(): CreateCategoryPayload {
  return {
    name: form.value.name.trim(),
    status: form.value.status,
  }
}

const isCategoryEditRoute = computed(() => route.name === 'categoryEdit')
const isEdit = computed(() => isCategoryEditRoute.value)
const categoryEditId = computed(() => {
  if (!isCategoryEditRoute.value) return undefined
  return route.params.id
})


async function fetchCategoryDetail() {
  if (!isEdit.value) return
  const id = Number(categoryEditId.value)
  try {
    const category = await getCategoryService().getCategoryById(id)
    form.value = {
      name: category.name,
      status: category.status as CategoryStatus,
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch category detail'
  }
}

async function onSubmit() {
  error.value = null
  if (!validateForm()) return

  const payload = buildCategoryPayload()
  submitting.value = true
  try {
    if (isEdit.value) {
      const id = Number(categoryEditId.value)
      await getCategoryService().updateCategoryById(id, payload)
    } else {
      await getCategoryService().createCategory(payload)
    }
    resetForm()
    await router.push('/categories')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Save failed'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void fetchCategoryDetail()
})
</script>

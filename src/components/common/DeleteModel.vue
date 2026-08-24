<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-dark" :id="titleId">{{ title }}</h5>
            <button
              type="button"
              class="close"
              aria-label="Close"
              :disabled="loading"
              @click="emit('close')"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div class="modal-body text-dark">
            {{ message }}
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-primary btn-pill"
              :disabled="loading"
              @click="emit('close')"
            >
              {{ cancelLabel }}
            </button>
            <button
              type="button"
              class="btn btn-danger btn-pill"
              :disabled="loading"
              @click="emit('confirm')"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isOpen" class="modal-backdrop fade show" @click="onBackdropClick" />
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    title?: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    loading?: boolean
  }>(),
  {
    title: 'Delete',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    loading: false,
  },
)

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const titleId = computed(() => 'delete-model-title')

function onBackdropClick() {
  if (props.loading) return
  emit('close')
}
</script>

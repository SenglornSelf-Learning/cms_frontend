<template>
  <div
    v-if="total > 0"
    class="d-flex flex-wrap align-items-center justify-content-between mt-3"
  >
    <div class="text-muted mb-2 mb-md-0">
      Total {{ total.toLocaleString() }}
      (Page {{ current.toLocaleString() }} / {{ totalPages.toLocaleString() }})
    </div>

    <nav aria-label="Table pagination">
      <ul class="pagination pagination-flat mb-0">
        <li class="page-item" :class="{ disabled: current <= 1 }">
          <button
            type="button"
            class="page-link"
            :disabled="current <= 1"
            aria-label="Previous"
            @click="changePage(current - 1)"
          >
            <span aria-hidden="true" class="mdi mdi-chevron-left" />
            <span class="sr-only">Previous</span>
          </button>
        </li>

        <li
          v-for="page in pageList"
          :key="page"
          class="page-item"
          :class="{ active: current === page }"
        >
          <button type="button" class="page-link" @click="changePage(page)">
            {{ page }}
          </button>
        </li>

        <li class="page-item" :class="{ disabled: current >= totalPages }">
          <button
            type="button"
            class="page-link"
            :disabled="current >= totalPages"
            aria-label="Next"
            @click="changePage(current + 1)"
          >
            <span aria-hidden="true" class="mdi mdi-chevron-right" />
            <span class="sr-only">Next</span>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    total?: number
    limit?: number
    current?: number
    displayPageCount?: number
  }>(),
  {
    total: 0,
    limit: 10,
    current: 1,
    displayPageCount: 5,
  },
)

const emit = defineEmits<{
  (e: 'change', page: number): void
}>()

const totalPages = computed(() => Math.ceil(props.total / props.limit) || 1)

const pageList = computed(() => {
  const start =
    Math.floor((props.current - 1) / props.displayPageCount) * props.displayPageCount + 1
  const end = Math.min(start + props.displayPageCount - 1, totalPages.value)
  const pages: number[] = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

function changePage(page: number) {
  if (page < 1 || page > totalPages.value || page === props.current) return
  emit('change', page)
}
</script>

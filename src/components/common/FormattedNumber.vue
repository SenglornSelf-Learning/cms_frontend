<template>
  <span>{{ formatted }}</span>
</template>

<script lang="ts">
/** ISO-like `2026-08-13T15:10:12.44818` → `2026-08-13 15:10:12` */
export function formatDateTime(value: string | number | null | undefined): string {
  if (value == null || value === '') return ''
  return String(value).replace('T', ' ').slice(0, 19)
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value?: string | number | null
    fallback?: string
  }>(),
  {
    value: null,
    fallback: '',
  },
)

const formatted = computed(() => formatDateTime(props.value) || props.fallback)
</script>

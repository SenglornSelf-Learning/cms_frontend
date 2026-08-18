<template>
  <div v-if="isEmpty" class="ck_editor_empty">-</div>
  <div v-else class="ck-content ck_editor_content" v-html="html" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import 'ckeditor5/ckeditor5-content.css'

const props = defineProps<{
  html?: string | null
}>()

const isEmpty = computed(() => {
  const raw = props.html?.trim() ?? ''
  if (!raw) return true
  const text = raw.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim()
  return !text
})
</script>

<style scoped>
.ck_editor_content {
  max-width: 100%;
  overflow-x: auto;
}

.ck_editor_content :deep(ol),
.ck_editor_content :deep(ul) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.ck_editor_content :deep(img) {
  max-width: 100%;
  height: auto;
}

.ck_editor_content :deep(figure) {
  margin: 0.75em 0;
}

.ck_editor_content :deep(h1),
.ck_editor_content :deep(h2),
.ck_editor_content :deep(h3),
.ck_editor_content :deep(h4) {
  margin: 0.75em 0 0.4em;
  font-weight: 600;
  line-height: 1.3;
  color: #222;
}

.ck_editor_content :deep(h1:first-child),
.ck_editor_content :deep(h2:first-child),
.ck_editor_content :deep(h3:first-child),
.ck_editor_content :deep(h4:first-child),
.ck_editor_content :deep(p:first-child),
.ck_editor_content :deep(ol:first-child),
.ck_editor_content :deep(ul:first-child),
.ck_editor_content :deep(blockquote:first-child) {
  margin-top: 0;
}

.ck_editor_content :deep(a) {
  color: #4c84ff;
}
</style>

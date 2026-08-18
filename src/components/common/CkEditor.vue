<template>
  <div class="ck_editor_wrap">
    <Ckeditor
      v-model="html"
      :editor="ClassicEditor"
      :config="editorConfig"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Autoformat,
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  HorizontalLine,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  Paragraph,
  PasteFromOffice,
  Strikethrough,
  Table,
  TableToolbar,
  Underline,
} from 'ckeditor5'
import { Ckeditor } from '@ckeditor/ckeditor5-vue'

import 'ckeditor5/ckeditor5.css'

defineProps<{
  disabled?: boolean
}>()

const html = defineModel<string>({ default: '' })

const editorConfig = {
  licenseKey: 'GPL',
  plugins: [
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Link,
    List,
    Indent,
    IndentBlock,
    BlockQuote,
    HorizontalLine,
    Table,
    TableToolbar,
    Autoformat,
    PasteFromOffice,
  ],
  toolbar: [
    'undo',
    'redo',
    '|',
    'heading',
    '|',
    'bold',
    'italic',
    'underline',
    'strikethrough',
    '|',
    'link',
    'blockQuote',
    'insertTable',
    'horizontalLine',
    '|',
    'bulletedList',
    'numberedList',
    'outdent',
    'indent',
  ],
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
  },
}
</script>

<style scoped>
.ck_editor_wrap :deep(.ck-editor__editable) {
  min-height: 16rem;
}

:global(.form_row.has_error .ck.ck-editor__main > .ck-editor__editable) {
  border-color: #dc3545;
}
</style>

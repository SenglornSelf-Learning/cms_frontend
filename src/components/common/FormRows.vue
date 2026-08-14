<template>
  <div
    class="form_row"
    :class="{ has_error: !!error, is_field_disabled: disabled }"
  >
    <label class="form_label" :class="{ required }" :for="resolvedId">{{ label }}</label>
    <div class="form_content">
      <template v-if="$slots.default">
        <slot />
      </template>

      <textarea
        v-else-if="type === 'textarea'"
        :id="resolvedId"
        class="form-control"
        :class="{ 'is-invalid': !!error }"
        :value="stringValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows"
        @input="onTextInput"
      />

      <select
        v-else-if="type === 'select'"
        :id="resolvedId"
        class="form-control"
        :class="{ 'is-invalid': !!error }"
        :value="selectValue"
        :disabled="disabled"
        @change="onSelectChange"
      >
        <option
          v-for="(opt, index) in options"
          :key="`${opt.value ?? 'null'}-${index}`"
          :value="opt.value === null || opt.value === undefined ? '' : String(opt.value)"
        >
          {{ opt.label }}
        </option>
      </select>

      <div v-else-if="type === 'file'" class="file_wrap">
        <input
          :id="resolvedId"
          ref="fileInputRef"
          type="file"
          class="form_file_hidden"
          :multiple="multiple"
          :accept="accept"
          :disabled="disabled"
          @change="onFileChange"
        />
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          :disabled="disabled"
          @click="fileInputRef?.click()"
        >
          Select files
        </button>
        <p v-if="hint" class="form_hint">{{ hint }}</p>
        <ul v-if="files?.length" class="file_preview_list">
          <li
            v-for="(file, index) in files"
            :key="`${file.name}-${index}`"
            class="file_preview_item"
            :class="{ pending_delete: file.pendingDelete }"
          >
            <span class="file_preview_name">{{ file.name }}</span>
            <span v-if="file.size != null" class="file_preview_size">{{ formatFileSize(file.size) }}</span>
            <template v-if="file.pendingDelete === true">
              <span class="file_pending_msg">Will be removed on save</span>
              <button type="button" class="file_cancel_btn" @click="emit('file-unmark-delete', index)">
                Undo
              </button>
            </template>
            <template v-else-if="file.pendingDelete === false">
              <button type="button" class="file_remove_btn" @click="emit('file-mark-delete', index)">
                Remove
              </button>
            </template>
            <template v-else>
              <button type="button" class="file_remove_btn" @click="emit('file-remove', index)">✕</button>
            </template>
          </li>
        </ul>
      </div>

      <input
        v-else
        :id="resolvedId"
        type="text"
        class="form-control"
        :class="{ 'is-invalid': !!error }"
        :value="stringValue"
        :placeholder="placeholder"
        :disabled="disabled"
        autocomplete="off"
        @input="onTextInput"
      />

      <p v-if="error" class="form_error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

export interface FormRowOption {
  label: string
  value: string | number | null
}

export interface FormFileItem {
  name: string
  size?: number
  pendingDelete?: boolean
}

const props = withDefaults(
  defineProps<{
    label: string
    required?: boolean
    type?: 'text' | 'textarea' | 'select' | 'file'
    modelValue?: string | number | null
    options?: FormRowOption[]
    placeholder?: string
    disabled?: boolean
    error?: string
    rows?: number
    inputId?: string
    multiple?: boolean
    accept?: string
    hint?: string
    files?: FormFileItem[]
  }>(),
  {
    required: false,
    type: 'text',
    modelValue: '',
    options: () => [],
    placeholder: '',
    disabled: false,
    error: '',
    rows: 3,
    inputId: '',
    multiple: false,
    accept: '',
    hint: '',
    files: () => [],
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
  (e: 'file-change', files: File[]): void
  (e: 'file-remove', index: number): void
  (e: 'file-mark-delete', index: number): void
  (e: 'file-unmark-delete', index: number): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)

const resolvedId = computed(
  () => props.inputId || `form-row-${props.label.toLowerCase().replace(/\s+/g, '-')}`,
)

const stringValue = computed(() =>
  props.modelValue == null ? '' : String(props.modelValue),
)

const selectValue = computed(() =>
  props.modelValue == null ? '' : String(props.modelValue),
)

function onTextInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement | HTMLTextAreaElement).value)
}

function onSelectChange(event: Event) {
  const raw = (event.target as HTMLSelectElement).value
  if (raw === '') {
    emit('update:modelValue', null)
    return
  }
  const matched = props.options.find((opt) => String(opt.value) === raw)
  emit('update:modelValue', matched ? matched.value : raw)
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? []).filter((file) => file.size > 0)
  emit('file-change', files)
  input.value = ''
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
</script>

<style scoped>
.form_row {
  display: flex;
  gap: 0 1.5rem;
  margin-bottom: 1rem;
  min-width: 0;
}
.form_label {
  flex-shrink: 0;
  width: 10rem;
  margin-bottom: 0;
  padding-top: 0.45rem;
  font-size: inherit;
  font-weight: 400;
  color: #333;
  line-height: 1.5;
}
.form_label.required::after {
  content: '*';
  margin-left: 0.25rem;
  color: #dc3545;
}
.form_row.has_error .form_label {
  color: #dc3545;
}
.form_content {
  flex: 1;
  min-width: 0;
}
.form_row.is_field_disabled .form_content {
  cursor: not-allowed;
}
.form_error {
  display: block;
  margin-top: 0.25rem;
  font-size: 80%;
  color: #dc3545;
}
.form_hint {
  margin: 0.35rem 0 0;
  font-size: 80%;
  color: #6c757d;
}
.form_file_hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.file_wrap {
  position: relative;
}
.file_preview_list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0.6rem 0 0;
  padding: 0;
  list-style: none;
}
.file_preview_item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid #e8ecf0;
  border-radius: 0.25rem;
  background: #f8f9fc;
}
.file_preview_name {
  overflow: hidden;
  flex: 1;
  min-width: 0;
  color: #444;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file_preview_size {
  font-size: 80%;
  color: #aaa;
}
.file_remove_btn,
.file_cancel_btn {
  margin-left: auto;
  padding: 0.15rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.2rem;
  background: none;
  font-size: 80%;
  color: #666;
  cursor: pointer;
}
.file_remove_btn:hover,
.file_cancel_btn:hover {
  background: #eee;
}
.file_preview_item.pending_delete .file_preview_name {
  color: #999;
  text-decoration: line-through;
}
.file_pending_msg {
  font-size: 80%;
  color: #dc3545;
}
</style>

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

      <slot name="hint">
        <small v-if="hint" class="form-text text-muted">{{ hint }}</small>
      </slot>
      <p v-if="error" class="form_error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface FormRowOption {
  label: string
  value: string | number | null
}

const props = withDefaults(
  defineProps<{
    label: string
    required?: boolean
    type?: 'text' | 'textarea' | 'select'
    modelValue?: string | number | null
    options?: FormRowOption[]
    placeholder?: string
    disabled?: boolean
    error?: string
    hint?: string
    rows?: number
    inputId?: string
  }>(),
  {
    required: false,
    type: 'text',
    modelValue: '',
    options: () => [],
    placeholder: '',
    disabled: false,
    error: '',
    hint: '',
    rows: 3,
    inputId: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
}>()

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
.form-text {
  display: block;
  margin-top: 0.25rem;
}
</style>

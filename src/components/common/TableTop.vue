<template>
  <div class="d-flex flex-wrap align-items-end justify-content-between mb-3" v-bind="$attrs">
    <div v-if="showLeftArea" class="d-flex flex-wrap align-items-end mb-2 mb-md-0">
      <div v-if="showPage" class="form-group mb-0 mr-2">
        <label for="tableTopPageSize" class="sr-only">Page size</label>
        <select
          id="tableTopPageSize"
          class="form-control form-control-sm"
          :value="pageSize"
          @change="onPageSizeChange"
        >
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="30">30</option>
          <option :value="50">50</option>
        </select>
      </div>

      <!-- search category -->
      <div
        v-if="showSearchCategory && searchCategoryOptions.length > 0"
        class="form-group mb-0 mr-2"
      >
        <label
          v-if="searchCategoryLabel"
          for="tableTopSearchCategory"
          class="mb-1"
        >{{ searchCategoryLabel }}</label>
        <select
          id="tableTopSearchCategory"
          class="form-control form-control-sm"
          :value="searchCategoryValue"
          :disabled="searchCategoryDisabled"
          @change="onSearchCategoryChange"
        >
          <option
            v-for="option in searchCategoryOptions"
            :key="String(option.value)"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- search type -->
      <div v-if="showTypeSelect && typeOptions.length > 0" class="form-group mb-0 mr-2">
        <label v-if="typeSelectLabel" for="tableTopTypeSelect" class="mb-1">
          {{ typeSelectLabel }}
        </label>
        <select
          id="tableTopTypeSelect"
          class="form-control form-control-sm"
          :value="typeValue"
          @change="onTypeChange"
        >
          <option
            v-for="option in typeOptions"
            :key="String(option.value)"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <slot name="left" />

      <!-- search keyword -->
      <div v-if="showKeywordSearch" class="form-group mb-0 mr-2">
        <label v-if="keywordSearchLabel" for="tableTopKeyword" class="mb-1">
          {{ keywordSearchLabel }}
        </label>
        <div class="d-flex flex-wrap align-items-center">
          <select
            v-if="showKeywordSearchSelect && keywordSearchOptions.length > 0"
            class="form-control form-control-sm mr-2"
            style="width: auto; min-width: 8rem"
            :value="keywordSearchValue"
            @change="onKeywordSearchTypeChange"
          >
            <option
              v-for="option in keywordSearchOptions"
              :key="String(option.value)"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <input
            id="tableTopKeyword"
            v-model="searchKeyword"
            type="text"
            class="form-control form-control-sm"
            style="min-width: 10rem"
            :placeholder="searchPlaceholder || 'Search…'"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>

      <div
        v-if="showButtonWrap && (showSearchButton || showResetButton || $slots.button)"
        class="d-flex align-items-center mb-0"
      >
        <button
          v-if="showSearchButton"
          type="button"
          class="btn btn-primary btn-sm mr-2"
          @click="handleSearch"
        >
          Search
        </button>
        <button
          v-if="showResetButton"
          type="button"
          class="btn btn-secondary btn-sm mr-2"
          @click="handleReset"
        >
          Reset
        </button>
        <slot name="button" />
      </div>
    </div>

    <div v-if="showRightArea && $slots.right" class="d-flex flex-wrap align-items-end ml-auto">
      <div class="d-flex align-items-center">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

defineOptions({ inheritAttrs: false })

export interface SelectOption {
  label: string
  value: string | number
}

const props = withDefaults(
  defineProps<{
    showSearchCategory?: boolean
    searchCategoryOptions?: SelectOption[]
    searchCategoryLabel?: string
    searchCategoryValue?: string | number
    searchCategoryDisabled?: boolean
    showTypeSelect?: boolean
    typeOptions?: SelectOption[]
    typeSelectLabel?: string
    typeValue?: string | number
    showKeywordSearch?: boolean
    showKeywordSearchSelect?: boolean
    keywordSearchOptions?: SelectOption[]
    keywordSearchValue?: string | number
    keywordTextValue?: string
    keywordSearchLabel?: string
    searchPlaceholder?: string
    showSearchButton?: boolean
    showResetButton?: boolean
    showButtonWrap?: boolean
    showPage?: boolean
    pageSize?: number
    showLeftArea?: boolean
    showRightArea?: boolean
  }>(),
  {
    showSearchCategory: false,
    searchCategoryOptions: () => [],
    searchCategoryLabel: '',
    searchCategoryValue: '',
    searchCategoryDisabled: false,
    showTypeSelect: false,
    typeOptions: () => [],
    typeSelectLabel: '',
    typeValue: '',
    showKeywordSearch: false,
    showKeywordSearchSelect: false,
    keywordSearchOptions: () => [],
    keywordSearchValue: '',
    keywordTextValue: undefined,
    keywordSearchLabel: '',
    searchPlaceholder: '',
    showSearchButton: true,
    showResetButton: true,
    showButtonWrap: true,
    showPage: false,
    pageSize: 10,
    showLeftArea: true,
    showRightArea: true,
  },
)

const emit = defineEmits<{
  (e: 'searchFilter', keyword: string): void
  (e: 'resetFilter'): void
  (e: 'updatePageSize', value: number): void
  (e: 'update:keywordTextValue', value: string): void
  (e: 'update:keywordSearchValue', value: string | number): void
  (e: 'update:searchCategoryValue', value: string | number): void
  (e: 'update:typeValue', value: string | number): void
}>()

const searchKeyword = ref(props.keywordTextValue ?? '')

watch(
  () => props.keywordTextValue,
  (value) => {
    if (value !== undefined) {
      searchKeyword.value = value
    }
  },
)

watch(searchKeyword, (value) => {
  emit('update:keywordTextValue', value)
})

function onSearchCategoryChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:searchCategoryValue', target.value)
}

function onTypeChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:typeValue', target.value)
}

function onKeywordSearchTypeChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:keywordSearchValue', target.value)
}

function onPageSizeChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('updatePageSize', Number(target.value))
}

function handleSearch() {
  emit('searchFilter', searchKeyword.value)
}

function handleReset() {
  searchKeyword.value = ''
  emit('update:keywordTextValue', '')
  emit('resetFilter')
}
</script>

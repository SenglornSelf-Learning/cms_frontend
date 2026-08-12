<template>
  <div class="table-responsive">
    <table class="table table-hover">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            :style="colStyle(col)"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="data.length === 0">
          <td :colspan="columns.length" class="text-center text-muted py-4">
            {{ emptyText }}
          </td>
        </tr>
        <tr v-for="(row, rowIndex) in data" :key="rowKey(row, rowIndex)">
          <td
            v-for="col in columns"
            :key="col.key"
            :data-label="col.label"
            :style="col.align ? { textAlign: col.align } : undefined"
          >
            <slot
              v-if="$slots[col.key]"
              :name="col.key"
              :row="row"
              :value="row[col.key]"
              :index="rowIndex"
            />
            <template v-else>
              <template v-if="isCellData(row[col.key])">
                <RouterLink
                  v-if="(row[col.key] as CellData).type === 'link'"
                  :to="(row[col.key] as CellData).to || ''"
                  class="text-primary"
                  v-bind="routerLinkTargetAttrs(row[col.key] as CellData)"
                >
                  {{ (row[col.key] as CellData).value }}
                </RouterLink>

                <button
                  v-else-if="(row[col.key] as CellData).type === 'button'"
                  type="button"
                  class="btn btn-sm btn-outline-primary"
                  :class="(row[col.key] as CellData).class"
                  @click="handleAction(row[col.key] as CellData, row)"
                >
                  {{ (row[col.key] as CellData).value }}
                </button>

                <span
                  v-else-if="(row[col.key] as CellData).type === 'label'"
                  class="badge"
                  :class="(row[col.key] as CellData).class || 'badge-secondary'"
                  :style="(row[col.key] as CellData).style"
                  @click="handleAction(row[col.key] as CellData, row)"
                >
                  {{ (row[col.key] as CellData).value }}
                </span>

                <span v-else :class="(row[col.key] as CellData).class">
                  {{ formatValue((row[col.key] as CellData).value) }}
                </span>
              </template>
              <template v-else>
                {{ formatValue(row[col.key]) }}
              </template>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

export interface TableColumn {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface CellData {
  type?: 'text' | 'link' | 'button' | 'image' | 'label'
  value?: string | number
  to?: RouteLocationRaw
  target?: string
  src?: string
  alt?: string
  class?: string
  action?: string
  style?: Record<string, string>
}

export type TableRow = Record<string, string | number | CellData | undefined>

const props = withDefaults(
  defineProps<{
    columns: TableColumn[]
    data: TableRow[]
    emptyText?: string
  }>(),
  {
    emptyText: 'No data',
  },
)

const emit = defineEmits<{
  (e: 'action', actionName: string, row: TableRow): void
}>()

function colStyle(col: TableColumn): Record<string, string> | undefined {
  if (!col.width && !col.align) return undefined
  return {
    ...(col.width ? { width: col.width } : {}),
    ...(col.align ? { textAlign: col.align } : {}),
  }
}

function rowKey(row: TableRow, index: number): string | number {
  const id = row.id
  if (typeof id === 'string' || typeof id === 'number') return id
  return index
}

function isCellData(data: unknown): data is CellData {
  return typeof data === 'object' && data !== null && ('type' in data || 'value' in data)
}

function routerLinkTargetAttrs(cell: CellData): Record<string, string> {
  const t = cell.target?.trim()
  if (!t || t === '_self') return {}
  if (t === '_blank') return { target: '_blank', rel: 'noopener noreferrer' }
  return { target: t }
}

function formatValue(val: unknown): string | number {
  if (val == null) return ''
  if (typeof val === 'number') return val
  return String(val)
}

function handleAction(cell: CellData, row: TableRow) {
  if (cell.action) {
    emit('action', cell.action, row)
  }
}
</script>

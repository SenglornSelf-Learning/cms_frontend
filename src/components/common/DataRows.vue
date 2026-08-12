<template>
  <div class="row_table_wrap">
    <table class="row_table">
      <slot name="colgroup">
        <colgroup>
          <col />
          <col />
        </colgroup>
      </slot>
      <tbody>
        <slot></slot>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
// For detailed information display.
// Usage: <DataRows><tr><th>Title</th><td>Content</td></tr>...</DataRows>
</script>

<style scoped>
.row_table{width:100%}
.row_table :deep(th),
.row_table :deep(td){padding:.8rem 1rem;border-bottom:1px solid #ddd; color:#333;}
.row_table :deep(th){ color:#333; font-weight: 500;}
.row_table :deep(tr:first-child) th,
.row_table :deep(tr:first-child) td{border-top:1px solid #ddd}
.row_table :deep(tr:last-child) th,
.row_table :deep(tr:last-child) td{border-bottom:1px solid #ddd}
:deep(.required)::after{content:'*';margin-left:4px;color:var(--danger)}
:deep(.cell_link){color:var(--primary);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
</style>
<style>
.row_table td > p{display:flex;gap:.2rem;color:#666;line-height:125%;font-size:1.3rem}
.row_table td > p:before{content:'*';padding-top:.3rem}
.row_table td > p:nth-of-type(1){margin-top:4px}
</style>

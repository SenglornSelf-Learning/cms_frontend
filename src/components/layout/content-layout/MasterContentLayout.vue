<template>
  <div class="row">
    <div :class="colClass">
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center flex-wrap mb-3">
            <h1 v-if="title" class="h4 mb-0 text-dark">{{ title }}</h1>

            <div class="d-flex align-items-center flex-wrap">
              <RouterLink
                v-if="actionTo"
                class="btn btn-primary btn-sm"
                :to="actionTo"
              >
                {{ actionLabel }}
              </RouterLink>

              <slot name="actions" />
            </div>
          </div>

          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    colClass?: string
    actionTo?: string
    actionLabel?: string
  }>(),
  { colClass: 'col-12', actionTo: '', actionLabel: '' },
)
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import MasterContentLayout from '@/components/layout/content-layout/MasterContentLayout.vue'
import { dashboardService } from '@/services'
import type { DashboardSummary } from '@/types/dashboard'

const data = ref<DashboardSummary | null>(null)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    data.value = await dashboardService.getSummary()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load dashboard'
  }
})
</script>

<template>
  <MasterContentLayout title="Dashboard">
    <p v-if="error" class="text-danger">{{ error }}</p>
    <template v-else-if="data">
      <p class="lead mb-1">{{ data.title }}</p>
      <p class="text-muted mb-0">{{ data.description }}</p>
    </template>
    <p v-else class="text-muted mb-0">Loading…</p>
  </MasterContentLayout>
</template>

<template>
  <svg
    class="progress-spinner"
    viewBox="25 25 50 50"
    role="status"
    aria-label="Loading"
  >
    <circle
      class="progress-spinner__path"
      cx="50"
      cy="50"
      r="20"
      fill="none"
      :stroke-width="strokeWidth"
      stroke-miterlimit="10"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Circle stroke width (PrimeVue-compatible). */
    strokeWidth?: string | number
  }>(),
  {
    strokeWidth: 4,
  },
)
</script>

<style scoped>
.progress-spinner {
  width: 50px;
  height: 50px;
  display: inline-block;
  animation: progress-spinner-rotate 2s linear infinite;
  transform-origin: center center;
}

.progress-spinner__path {
  stroke: var(--primary, #4c84ff);
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  animation: progress-spinner-dash 1.5s ease-in-out infinite;
}

@keyframes progress-spinner-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes progress-spinner-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>

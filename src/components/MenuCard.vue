<script setup lang="ts">
defineProps<{
  title: string
  description: string
  to: string
}>()
</script>

<template>
  <RouterLink
    :to="to"
    class="group flex flex-col gap-3 rounded-2xl border border-brand-border bg-brand-card p-5 hover:border-brand-green/50 transition-colors"
  >
    <div
      class="h-10 w-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green group-hover:bg-brand-green/20 transition-colors"
    >
      <slot name="icon" />
    </div>
    <div>
      <h3 class="text-sm font-semibold text-brand-text">{{ title }}</h3>
      <p class="text-xs text-brand-muted mt-1">{{ description }}</p>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
defineProps<{ role: string }>()

const colors: Record<string, string> = {
    Developer: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    SuperAdmin: 'bg-grand-green/15 text-brand-green border-brand-green/30',
    Admin: 'bg-sky-500/15 text-sky-400 border-sky-500/30'
}
</script>

<template>
  <span
    class="text-xs font-medium px-2.5 py-1 rounded-full border"
    :class="colors[role] ?? 'bg-brand-border text-brand-muted border-brand-border'"
  >
    {{ role }}
  </span>
</template>
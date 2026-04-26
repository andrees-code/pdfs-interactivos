<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    active?: 'layout' | 'typography' | 'assets' | 'code' | 'settings'
    projectName?: string
  }>(),
  {
    active: 'assets',
    projectName: 'Q2 Product Narrative'
  }
)

const items = [
  { key: 'layout', label: 'Layout', icon: 'grid_view' },
  { key: 'typography', label: 'Typography', icon: 'format_size' },
  { key: 'assets', label: 'Assets', icon: 'inventory_2' },
  { key: 'code', label: 'Code', icon: 'code' },
  { key: 'settings', label: 'Settings', icon: 'settings' }
] as const
</script>

<template>
  <aside class="glass-panel flex h-full w-[280px] flex-col rounded-none border-l-0 border-y-0 border-r border-surface-line/70">
    <div class="border-b border-white/10 p-4">
      <div class="aspect-video rounded-card bg-gradient-to-br from-primary-900/60 via-primary-700/30 to-slate-900"></div>
      <p class="mt-3 text-sm font-semibold text-white">{{ props.projectName }}</p>
      <p class="text-xs text-slate-400">Last edited 6m ago</p>
    </div>

    <div class="space-y-1 p-3">
      <button
        type="button"
        v-for="item in items"
        :key="item.key"
        class="flex w-full items-center gap-3 rounded-card px-3 py-2 text-left text-sm transition-all duration-200"
        :class="props.active === item.key ? 'bg-primary-500/20 text-primary-100 ring-1 ring-primary-400/50' : 'text-slate-300 hover:bg-white/5 hover:text-white'"
      >
        <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </button>
    </div>

    <div class="mt-auto border-t border-white/10 p-3">
      <button type="button" class="mb-2 flex w-full items-center gap-3 rounded-card px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
        <span class="material-symbols-outlined text-lg">help</span>
        Help
      </button>
      <button type="button" class="mb-3 flex w-full items-center gap-3 rounded-card px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
        <span class="material-symbols-outlined text-lg">chat</span>
        Feedback
      </button>
      <button type="button" class="w-full rounded-pill bg-gradient-to-r from-primary-500 to-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-glow">
        Publish
      </button>
    </div>
  </aside>
</template>

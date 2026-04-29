<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    active?: 'landing' | 'projects' | 'templates' | 'editor' | 'marketplace' | 'none'
    searchPlaceholder?: string
    searchAlign?: 'left' | 'center'
    showSearch?: boolean
  }>(),
  {
    active: 'none',
    searchPlaceholder: 'Buscar proyectos, plantillas y creadores...',
    searchAlign: 'center',
    showSearch: true
  }
)

const links = [
  { key: 'projects', label: 'Proyectos', to: '/devpresent/projects' },
  { key: 'templates', label: 'Plantillas', to: '/devpresent/templates' }
] as const
</script>

<template>
  <nav class="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
    <div class="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 lg:px-8">
      <RouterLink to="/devpresent/projects" class="flex items-center gap-2 text-white">
        <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500/20 text-primary-200">
          <span class="material-symbols-outlined text-lg">view_in_ar</span>
        </span>
        <span class="font-display text-lg">DevPresent</span>
      </RouterLink>

      <div class="hidden gap-5 md:flex md:items-center md:pl-4">
        <RouterLink
          v-for="item in links"
          :key="item.key"
          :to="item.to"
          class="text-sm font-medium transition-colors duration-200"
          :class="props.active === item.key ? 'text-primary-200 underline decoration-primary-500 underline-offset-8' : 'text-slate-300 hover:text-white'"
        >
          {{ item.label }}
        </RouterLink>
      </div>

      <div
        v-if="props.showSearch"
        class="hidden md:flex"
        :class="props.searchAlign === 'center' ? 'mx-auto w-full max-w-xl' : 'ml-6 mr-auto w-full max-w-md'"
      >
        <label class="relative block w-full">
          <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            type="search"
            :placeholder="props.searchPlaceholder"
            aria-label="Buscar"
            class="w-full rounded-pill border border-white/10 bg-surface-raised/70 py-2 pl-10 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-primary-400"
          />
        </label>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <button type="button" aria-label="Notificaciones" title="Notificaciones" class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-200 transition-all duration-200 hover:bg-white/10">
          <span class="material-symbols-outlined text-lg">notifications</span>
        </button>
        <button type="button" aria-label="Ayuda" title="Ayuda" class="hidden h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-200 transition-all duration-200 hover:bg-white/10 md:inline-flex">
          <span class="material-symbols-outlined text-lg">help</span>
        </button>
        <button type="button" class="hidden rounded-pill bg-gradient-to-r from-primary-500 to-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 md:inline-flex">
          Nuevo
        </button>
        <span aria-label="User avatar" title="User avatar" class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 font-semibold text-white">AP</span>
      </div>
    </div>
  </nav>
</template>

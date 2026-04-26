<script setup lang="ts">
import TopNavBar from '@/components/layout/TopNavBar.vue'

const projects = [
  { title: 'Q3 Technical Review', description: 'Architecture overview and scaling metrics for the new microservices deployment.', updated: 'Edited 2h ago', kind: 'gradient-a' },
  { title: 'API Documentation V2', description: 'Interactive endpoints guide with embedded GraphQL playground slides.', updated: 'Edited yesterday', kind: 'gradient-b' },
  { title: 'Investor Pitch Deck', description: 'Seed round presentation utilizing the new glassmorphism template.', updated: 'Edited 3 days ago', kind: 'doc' }
]
</script>

<template>
  <div class="min-h-screen bg-background text-on-background antialiased selection:bg-primary-700/40 selection:text-white">
    <TopNavBar active="projects" />

    <main class="mx-auto flex w-full max-w-7xl flex-col gap-stack-lg px-margin-safe pb-margin-safe pt-[calc(64px+40px)]">
      <header class="flex flex-col justify-between gap-stack-md md:flex-row md:items-end">
        <div>
          <h1 class="font-display-xl text-display-xl text-on-surface">Projects</h1>
          <p class="mt-unit text-body-lg text-on-surface-variant">Manage your presentations and technical slides.</p>
        </div>
        <button type="button" class="flex items-center gap-stack-sm rounded-lg bg-gradient-to-r from-primary-300 to-tertiary px-6 py-4 text-label-caps text-slate-950 shadow-[0_10px_30px_rgba(192,193,255,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(192,193,255,0.25)]">
          <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">add_circle</span>
          Create New Presentation
        </button>
      </header>

      <section class="group relative w-full">
        <div class="absolute inset-0 rounded-xl bg-primary/5 blur-xl transition-colors duration-500 group-hover:bg-primary/10"></div>
        <div class="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-lowest/50 p-stack-lg text-center backdrop-blur-sm transition-colors hover:border-primary">
          <div class="mb-stack-md flex h-14 w-14 items-center justify-center rounded-full bg-surface-container transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
            <span class="material-symbols-outlined text-3xl text-on-surface-variant transition-colors group-hover:text-primary">upload_file</span>
          </div>
          <h3 class="text-headline-md text-on-surface">Import File</h3>
          <p class="mt-unit max-w-md text-body-md text-on-surface-variant">Drag and drop your Markdown (.md) or HTML files here, or click to browse your local machine.</p>
        </div>
      </section>

      <section>
        <div class="mb-stack-md flex items-center justify-between">
          <h2 class="text-[20px] text-on-surface">Recent Work</h2>
          <div class="flex items-center gap-stack-sm text-label-caps text-on-surface-variant">
            <button type="button" class="flex items-center gap-1 transition-colors hover:text-primary"><span class="material-symbols-outlined text-[16px]">filter_list</span>Filter</button>
            <div class="h-4 w-px bg-outline-variant"></div>
            <button type="button" class="flex items-center gap-1 transition-colors hover:text-primary"><span class="material-symbols-outlined text-[16px]">sort</span>Sort</button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
          <article v-for="project in projects" :key="project.title" class="group relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-surface-container shadow-lg transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
            <div class="relative aspect-video overflow-hidden bg-surface-container-highest">
              <div v-if="project.kind === 'gradient-a'" class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(140,176,255,0.45),transparent_45%),linear-gradient(135deg,#0b1226,#15284f)]"></div>
              <div v-else-if="project.kind === 'gradient-b'" class="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(99,102,241,0.5),transparent_38%),linear-gradient(135deg,#090d1a,#1f2f56)]"></div>
              <div v-else class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-container-low to-surface-dim"><span class="material-symbols-outlined text-[64px] text-surface-variant">description</span></div>
              <div class="absolute inset-0 z-10 flex items-center justify-center bg-background/80 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <button type="button" class="flex items-center gap-2 rounded-lg border border-outline bg-surface/90 px-5 py-2.5 text-label-caps text-on-surface transition-colors hover:border-primary hover:bg-primary hover:text-slate-950">
                  <span class="material-symbols-outlined text-[16px]">visibility</span>
                  Quick Preview
                </button>
              </div>
            </div>
            <div class="flex flex-1 flex-col justify-between p-stack-md">
              <div>
                <h3 class="truncate text-[18px] text-on-surface">{{ project.title }}</h3>
                <p class="mt-1 line-clamp-2 text-[14px] text-on-surface-variant">{{ project.description }}</p>
              </div>
              <div class="mt-stack-md flex items-center justify-between border-t border-white/5 pt-stack-sm text-[13px] text-outline">
                <span>{{ project.updated }}</span>
                <button type="button" aria-label="Project options" class="rounded-full p-1 transition-colors hover:bg-white/5 hover:text-primary"><span class="material-symbols-outlined text-[20px]">more_horiz</span></button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

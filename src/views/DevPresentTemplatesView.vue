<script setup lang="ts">
import TopNavBar from '@/components/layout/TopNavBar.vue'
import SideNavBar from '@/components/layout/SideNavBar.vue'

const categories = ['All Templates', 'Pitch Deck', 'Portfolio', 'Educational', 'Technical Spec']

const cards = [
  { title: 'Canvas Minimal', author: 'DevPresent', slides: 8, tone: 'aqua', badge: 'Portfolio' },
  { title: 'Syntax Workshop', author: 'CodeRyder', slides: 15, tone: 'violet', badge: 'Educational' },
  { title: 'Fluid Dynamics', author: 'DevPresent', slides: 10, tone: 'amber', badge: 'Pitch Deck' }
]
</script>

<template>
  <div class="h-screen overflow-hidden bg-background text-on-background">
    <TopNavBar active="templates" search-align="left" />

    <div class="flex h-[calc(100vh-64px)]">
      <SideNavBar active="assets" project-name="Q3 Presentation" />

      <main class="flex-1 overflow-y-auto bg-background p-margin-safe">
        <header class="mx-auto mb-stack-lg flex max-w-7xl flex-col justify-between gap-stack-md md:flex-row md:items-end">
          <div>
            <h1 class="font-display-xl text-display-xl text-on-background">Template Library</h1>
            <p class="mt-stack-sm max-w-2xl text-body-lg text-on-surface-variant">Discover expertly crafted starting points for your next presentation. Built with precision markup and high-end motion guidelines.</p>
          </div>
          <div class="flex items-center gap-stack-sm">
            <div class="group relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm transition-colors group-focus-within:text-primary">search</span>
              <input aria-label="Search templates" placeholder="Search by name or style..." class="w-full rounded-lg border border-outline-variant/50 bg-surface-container py-2 pl-9 pr-4 text-body-md text-on-surface shadow-inner transition-all placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:w-64" />
            </div>
            <button type="button" class="flex items-center justify-center rounded-lg border border-outline-variant/50 bg-surface-container p-2 text-on-surface transition-colors hover:bg-surface-bright">
              <span class="material-symbols-outlined">tune</span>
            </button>
          </div>
        </header>

        <div class="mx-auto mb-stack-lg flex max-w-7xl items-center gap-stack-sm overflow-x-auto border-b border-surface-variant/50 pb-2">
          <button
            type="button"
            v-for="category in categories"
            :key="category"
            class="whitespace-nowrap rounded-t-lg border-b-2 px-4 py-2 text-label-caps"
            :class="category === 'All Templates' ? 'border-primary text-primary bg-surface-bright/20' : 'border-transparent text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface'"
          >
            {{ category }}
          </button>
        </div>

        <section class="mx-auto grid max-w-7xl grid-cols-1 gap-gutter pb-stack-lg md:grid-cols-2 xl:grid-cols-3">
          <article class="group relative col-span-1 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] md:col-span-2">
            <div class="relative aspect-[21/9] overflow-hidden bg-surface-dim">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(140,176,255,0.55),transparent_36%),linear-gradient(120deg,#0c1630,#111827_48%,#1f2f56)] transition-all duration-500 group-hover:scale-105"></div>
              <div class="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <button type="button" class="flex translate-y-4 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-tertiary-container px-6 py-3 text-label-caps text-slate-950 shadow-lg transition-all duration-300 group-hover:translate-y-0">
                  <span class="material-symbols-outlined text-sm">visibility</span>
                  Quick Preview
                </button>
              </div>
              <div class="absolute left-4 top-4 flex gap-2">
                <span class="rounded border border-primary/30 bg-primary-container/20 px-2.5 py-1 text-label-caps text-primary-fixed">Featured</span>
                <span class="rounded border border-outline-variant/50 bg-surface-container/80 px-2.5 py-1 text-label-caps">Pitch Deck</span>
              </div>
            </div>
            <div class="flex items-start justify-between bg-gradient-to-b from-surface-container to-surface-container-low p-stack-md">
              <div>
                <h3 class="mb-1 text-headline-md text-on-surface">Nexus Series A</h3>
                <p class="line-clamp-1 text-body-md text-on-surface-variant">A highly technical, dark-mode optimized deck for deep-tech startups.</p>
              </div>
              <div class="flex items-center gap-2 pl-4 text-code-sm text-outline">
                <span>12 Slides</span>
                <button type="button" class="text-on-surface-variant transition-colors hover:text-primary"><span class="material-symbols-outlined">bookmark_border</span></button>
              </div>
            </div>
          </article>

          <article v-for="card in cards" :key="card.title" class="group relative flex flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
            <div
              class="relative aspect-video"
              :class="card.tone === 'aqua'
                ? 'bg-[radial-gradient(circle_at_70%_30%,rgba(34,211,238,0.45),transparent_35%),linear-gradient(130deg,#071929,#0b2a43)]'
                : card.tone === 'violet'
                  ? 'bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.4),transparent_35%),linear-gradient(130deg,#120a26,#2d1d52)]'
                  : 'bg-[radial-gradient(circle_at_75%_18%,rgba(251,191,36,0.38),transparent_35%),linear-gradient(130deg,#2b1705,#4a2f0b)]'"
            >
              <div class="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <button type="button" class="flex translate-y-4 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-tertiary-container px-6 py-3 text-label-caps text-slate-950 shadow-lg transition-all duration-300 group-hover:translate-y-0">
                  <span class="material-symbols-outlined text-sm">visibility</span>
                  Quick Preview
                </button>
              </div>
              <div class="absolute left-4 top-4">
                <span class="rounded border border-outline-variant/50 bg-surface-container/80 px-2.5 py-1 text-label-caps">{{ card.badge }}</span>
              </div>
            </div>
            <div class="flex flex-1 flex-col justify-between bg-surface-container p-stack-md">
              <div>
                <h3 class="mb-1 text-[20px] text-on-surface">{{ card.title }}</h3>
                <p class="text-code-sm text-on-surface-variant">Crafted by {{ card.author }}</p>
              </div>
              <div class="mt-stack-md flex items-center justify-between border-t border-outline-variant/20 pt-stack-sm">
                <div class="flex items-center gap-2">
                  <div class="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-container text-[10px] text-on-secondary-container">{{ card.author.split(' ').map((s) => s[0]).join('') }}</div>
                  <span class="text-[13px] text-on-surface-variant">{{ card.author }}</span>
                </div>
                <span class="text-code-sm text-outline">{{ card.slides }} Slides</span>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  </div>
</template>

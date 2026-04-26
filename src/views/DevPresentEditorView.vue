<script setup lang="ts">
import TopNavBar from '@/components/layout/TopNavBar.vue'

const slides = [
  { id: 1, title: 'Intro' },
  { id: 2, title: 'Narrative' },
  { id: 3, title: 'Metrics' },
  { id: 4, title: 'Roadmap' }
]

const tabs = ['Layout', 'Typography', 'Assets', 'Code', 'Settings']
</script>

<template>
  <div class="flex h-screen w-screen flex-col overflow-hidden bg-background text-on-background">
    <TopNavBar active="editor" :show-search="false" />

    <div class="relative flex flex-1 overflow-hidden">
      <aside class="hidden h-full w-sidebar-width shrink-0 flex-col border-r border-white/5 bg-slate-900 shadow-xl md:flex">
        <div class="border-b border-white/5 p-stack-md">
          <div class="mb-stack-sm flex items-center gap-stack-sm text-label-caps text-on-surface-variant">
            <span>Projects</span>
            <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            <span class="truncate text-primary">Q3 Presentation</span>
          </div>
          <h2 class="truncate text-headline-md text-on-surface">Q3 Presentation</h2>
          <p class="mt-1 text-sm text-on-surface-variant">Last edited 2m ago</p>
        </div>

        <div class="flex gap-1 overflow-x-auto border-b border-white/5 px-2 pt-2">
          <button v-for="tab in tabs" :key="tab" type="button" class="min-w-[60px] rounded-t-lg p-2 text-label-caps uppercase tracking-widest transition-colors duration-200" :class="tab === 'Layout' ? 'border-b-2 border-indigo-500 bg-indigo-600/10 text-indigo-400' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'">
            <span class="material-symbols-outlined mb-1 block">{{ tab === 'Typography' ? 'title' : tab === 'Assets' ? 'image' : tab.toLowerCase() }}</span>
            {{ tab }}
          </button>
        </div>

        <div class="flex-1 space-y-stack-sm overflow-y-auto p-stack-sm">
          <button v-for="slide in slides" :key="slide.id" type="button" class="group relative w-full overflow-hidden rounded-lg border bg-surface-container text-left transition-colors" :class="slide.id === 1 ? 'border-primary bg-surface-container-high' : 'border-white/5 hover:border-white/20'">
            <div class="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">{{ slide.id }}</div>
            <div class="aspect-video p-3" :class="slide.id === 1 ? 'flex items-center justify-center' : 'flex'">
              <template v-if="slide.id === 1">
                <div class="text-center">
                  <h3 class="mb-1 text-sm text-on-surface">DevPresent Vision</h3>
                  <p class="text-[10px] text-on-surface-variant">The future of presentation</p>
                </div>
              </template>
              <template v-else>
                <div class="mr-2 w-1/3 rounded bg-surface-variant"></div>
                <div class="flex w-2/3 flex-col gap-1">
                  <div class="h-2 w-3/4 rounded bg-surface-variant"></div>
                  <div class="h-1 w-full rounded bg-surface-variant"></div>
                  <div class="h-1 w-5/6 rounded bg-surface-variant"></div>
                </div>
              </template>
            </div>
          </button>

          <button type="button" class="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-outline-variant py-3 text-sm text-on-surface-variant transition-all hover:border-primary hover:bg-primary/5 hover:text-primary">
            <span class="material-symbols-outlined text-[18px]">add</span>
            New Slide
          </button>
        </div>

        <div class="flex justify-around border-t border-white/5 p-stack-sm">
          <button type="button" class="rounded p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300" title="Help"><span class="material-symbols-outlined">help</span></button>
          <button type="button" class="rounded p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300" title="Feedback"><span class="material-symbols-outlined">chat_bubble</span></button>
        </div>
      </aside>

      <main class="relative flex flex-1 flex-col overflow-hidden bg-surface-container-lowest">
        <div class="absolute bottom-margin-safe left-1/2 z-10 flex -translate-x-1/2 items-center gap-4 rounded-full border border-white/10 bg-surface-container/80 px-4 py-2 shadow-xl backdrop-blur-md">
          <button type="button" aria-label="Zoom out" class="text-on-surface-variant transition-colors hover:text-primary"><span class="material-symbols-outlined text-[20px]">remove</span></button>
          <span class="w-12 text-center text-sm text-on-surface">85%</span>
          <button type="button" aria-label="Zoom in" class="text-on-surface-variant transition-colors hover:text-primary"><span class="material-symbols-outlined text-[20px]">add</span></button>
          <div class="h-4 w-px bg-white/10"></div>
          <button type="button" class="text-on-surface-variant transition-colors hover:text-primary"><span class="material-symbols-outlined text-[20px]">fit_screen</span></button>
        </div>

        <div class="flex flex-1 items-center justify-center overflow-auto p-margin-safe">
          <div class="group relative aspect-video w-full max-w-[960px] overflow-hidden rounded-lg border border-white/10 bg-background shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            <div class="absolute inset-0 flex flex-col justify-center p-12">
              <div class="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-bl from-tertiary-container/10 to-transparent"></div>
              <div class="relative z-10 max-w-2xl cursor-pointer rounded-sm p-2 ring-2 ring-primary ring-offset-4 ring-offset-background transition-shadow">
                <h1 class="mb-6 text-display-xl leading-tight text-on-surface">
                  Design with <span class="bg-gradient-to-r from-primary to-tertiary-container bg-clip-text text-transparent">Precision</span>.<br />
                  Present with Power.
                </h1>
                <div class="absolute -top-12 left-0 flex items-center gap-1 rounded-lg border border-white/10 bg-surface-container-high p-1 shadow-lg">
                  <button type="button" class="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-primary" title="Edit Text"><span class="material-symbols-outlined text-[16px]">edit</span></button>
                  <button type="button" class="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-primary" title="Format"><span class="material-symbols-outlined text-[16px]">format_bold</span></button>
                  <button type="button" class="rounded p-1.5 text-error transition-colors hover:bg-error/10" title="Delete"><span class="material-symbols-outlined text-[16px]">delete</span></button>
                </div>
              </div>
              <div class="relative z-10 mt-4 max-w-xl cursor-pointer rounded p-2 transition-all hover:ring-1 hover:ring-white/20">
                <p class="text-body-lg text-on-surface-variant">Leverage standard HTML and CSS within a visual canvas. Stop wrestling with layout quirks and start building beautiful, robust presentations faster.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <aside class="hidden h-full w-sidebar-width shrink-0 flex-col border-l border-white/5 bg-surface-dim shadow-xl lg:flex">
        <div class="flex items-center justify-between border-b border-white/5 p-stack-md">
          <h3 class="text-label-caps uppercase tracking-widest text-on-surface">Properties</h3>
          <span class="rounded bg-surface-container-high px-2 py-0.5 text-xs text-on-surface-variant">h1.display-xl</span>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div class="border-b border-white/5">
            <button type="button" class="flex w-full items-center justify-between p-stack-md text-on-surface transition-colors hover:bg-white/5">
              <span class="text-sm">Layout &amp; Spacing</span>
              <span class="material-symbols-outlined text-[20px]">expand_more</span>
            </button>
            <div class="space-y-stack-md p-stack-md pt-0">
              <div class="grid grid-cols-2 gap-stack-sm">
                <div>
                  <label class="mb-1 block text-[10px] text-on-surface-variant">Margin</label>
                  <input type="text" value="0 0 24px 0" class="w-full rounded border border-outline bg-surface-container px-2 py-1.5 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label class="mb-1 block text-[10px] text-on-surface-variant">Padding</label>
                  <input type="text" value="8px" class="w-full rounded border border-outline bg-surface-container px-2 py-1.5 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              </div>
            </div>
          </div>

          <div class="border-b border-white/5">
            <button type="button" class="flex w-full items-center justify-between p-stack-md text-on-surface transition-colors hover:bg-white/5">
              <span class="text-sm">Typography</span>
              <span class="material-symbols-outlined text-[20px]">expand_less</span>
            </button>
            <div class="space-y-stack-md p-stack-md pt-0">
              <div>
                <label class="mb-1 block text-[10px] text-on-surface-variant">Font Family</label>
                <select class="w-full appearance-none rounded border border-outline bg-surface-container px-2 py-1.5 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary">
                  <option>Plus Jakarta Sans</option>
                  <option>Inter</option>
                  <option>Space Grotesk</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-stack-sm">
                <div>
                  <label class="mb-1 block text-[10px] text-on-surface-variant">Weight</label>
                  <select class="w-full appearance-none rounded border border-outline bg-surface-container px-2 py-1.5 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary">
                    <option>800 (ExtraBold)</option>
                    <option>700 (Bold)</option>
                    <option>400 (Regular)</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-[10px] text-on-surface-variant">Size</label>
                  <input type="text" value="48px" class="w-full rounded border border-outline bg-surface-container px-2 py-1.5 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label class="mb-1 block text-[10px] text-on-surface-variant">Color</label>
                <div class="flex items-center gap-2">
                  <div class="h-6 w-6 rounded border border-white/20 bg-on-surface"></div>
                  <input type="text" value="var(--on-surface)" class="flex-1 rounded border border-outline bg-surface-container px-2 py-1.5 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 border-t border-white/5 bg-surface-container-lowest p-stack-md">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-[10px] uppercase text-on-surface-variant">Raw Markup</span>
              <button type="button" class="text-primary transition-colors hover:text-tertiary-container"><span class="material-symbols-outlined text-[14px]">content_copy</span></button>
            </div>
            <pre class="overflow-x-auto rounded border border-white/5 bg-surface-container p-3 text-code-sm text-secondary">&lt;h1 class="font-display-xl text-display-xl text-on-surface mb-6 leading-tight"&gt;
  Design with &lt;span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary-container"&gt;Precision&lt;/span&gt;.&lt;br&gt;
  Present with Power.
&lt;/h1&gt;</pre>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

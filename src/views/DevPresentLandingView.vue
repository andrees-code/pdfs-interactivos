<script setup lang="ts">
import TopNavBar from '@/components/layout/TopNavBar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<template>
  <div class="min-h-screen bg-background text-on-background antialiased selection:bg-primary-700/40 selection:text-white">
    <TopNavBar active="landing" />

    <main class="relative overflow-hidden pb-20 pt-24">
      <div class="hero-glow"></div>

      <section class="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-12 text-center lg:px-8">
        <div class="mb-8 inline-flex items-center gap-2 rounded-full border border-primary-300/30 bg-primary-400/10 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-primary-200">
          <span class="material-symbols-outlined text-[14px]">code</span>
          v2.0 IS LIVE
        </div>

        <h1 class="mx-auto mb-6 max-w-4xl font-display text-display-xl">
          Presentations built for the <span class="gradient-text">Developer-Creator</span>
        </h1>

        <p class="mx-auto mb-10 max-w-2xl text-body-lg text-on-surface-variant">
          Total HTML/CSS control meets a high-end presentation canvas. Import your existing decks or code them from scratch. No compromises.
        </p>

        <div class="mb-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button type="button" class="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-700 to-tertiary-container px-8 py-4 font-semibold text-white shadow-[0_8px_20px_rgba(73,75,214,0.3)] transition-opacity hover:opacity-90 sm:w-auto">
            <span>Try for free</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <button type="button" class="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant px-8 py-4 font-semibold text-on-surface transition-colors hover:bg-surface-container sm:w-auto">
            <span class="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Import PPTX / PDF</span>
          </button>
        </div>

        <div class="mx-auto flex aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-surface-container-lowest shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div class="hidden w-[240px] flex-col border-r border-white/5 bg-surface-dim p-4 md:flex">
            <div class="mb-4 font-label-caps text-label-caps text-on-surface-variant">LAYERS</div>
            <div class="space-y-2 text-sm">
              <div class="rounded bg-surface-container p-2 text-on-surface">Hero Title</div>
              <div class="rounded p-2 text-on-surface-variant transition-colors hover:bg-surface-container">Background Asset</div>
              <div class="rounded p-2 pl-6 text-on-surface-variant transition-colors hover:bg-surface-container">Custom HTML Block</div>
            </div>
          </div>

          <div class="relative flex flex-1 items-center justify-center bg-background p-8">
            <div class="glass-panel absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-4 rounded-full px-4 py-2">
              <button type="button" class="material-symbols-outlined text-on-surface-variant transition-colors hover:text-white">undo</button>
              <button type="button" class="material-symbols-outlined text-on-surface-variant transition-colors hover:text-white">redo</button>
              <div class="h-4 w-px bg-white/10"></div>
              <button type="button" class="material-symbols-outlined text-white">desktop_windows</button>
              <button type="button" class="material-symbols-outlined text-on-surface-variant transition-colors hover:text-white">tablet_mac</button>
              <button type="button" class="material-symbols-outlined text-on-surface-variant transition-colors hover:text-white">phone_iphone</button>
            </div>

            <div class="relative flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary-300 bg-surface-container-low/50 p-8">
              <div class="absolute left-0 top-0 rounded-br bg-primary-300 px-2 py-1 font-mono text-[10px] text-slate-950">div.hero-container</div>
              <h2 class="mb-4 text-3xl text-white">Q3 Roadmap Presentation</h2>
              <p class="max-w-md text-center text-on-surface-variant">Engineering, Product, and Design alignment for the upcoming quarter.</p>

              <div class="glass-panel absolute right-6 top-1/2 flex -translate-y-1/2 flex-col gap-2 rounded-lg p-2">
                <button type="button" class="rounded p-2 transition-colors hover:bg-white/10"><span class="material-symbols-outlined text-[18px]">format_align_left</span></button>
                <button type="button" class="rounded bg-white/10 p-2"><span class="material-symbols-outlined text-[18px]">format_align_center</span></button>
                <button type="button" class="rounded p-2 transition-colors hover:bg-white/10"><span class="material-symbols-outlined text-[18px]">format_align_right</span></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div class="mb-16 text-center">
          <h2 class="mb-4 text-headline-lg font-semibold">Code it. Import it. Present it.</h2>
          <p class="mx-auto max-w-2xl text-body-lg text-on-surface-variant">The only presentation tool that respects your workflow and understands your code.</p>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <article class="glass-panel group relative overflow-hidden rounded-xl p-8 md:col-span-2">
            <div class="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl transition-colors duration-500 group-hover:bg-primary/20"></div>
            <div class="relative z-10">
              <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-white/5 bg-surface-container"><span class="material-symbols-outlined text-primary">html</span></div>
              <h3 class="mb-2 text-headline-md">Full HTML/CSS Control</h3>
              <p class="max-w-md text-body-md text-on-surface-variant">Access the underlying DOM of any slide. Write custom CSS, inject JS for interactive elements, and build reusable web components directly in your deck.</p>
              <pre class="mt-8 overflow-x-auto rounded border border-white/5 bg-surface-container-lowest p-4 text-code-sm text-on-surface-variant">&lt;div class="slide-container"&gt;
  &lt;h1 class="text-gradient font-bold"&gt;
    Developer First
  &lt;/h1&gt;
&lt;/div&gt;</pre>
            </div>
          </article>

          <article class="glass-panel rounded-xl p-8">
            <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-white/5 bg-surface-container"><span class="material-symbols-outlined text-secondary">file_download</span></div>
            <h3 class="mb-2 text-headline-md">Seamless Imports</h3>
            <p class="mb-6 text-body-md text-on-surface-variant">Drop in a PPTX or PDF and convert to editable semantic HTML layers instantly.</p>
            <div class="rounded border border-dashed border-outline p-6 text-center">
              <span class="material-symbols-outlined mb-2 block text-3xl text-outline">cloud_upload</span>
              <div class="text-label-caps">DRAG FILE HERE</div>
            </div>
          </article>

          <article class="glass-panel rounded-xl p-8">
            <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-white/5 bg-surface-container"><span class="material-symbols-outlined text-tertiary-container">group</span></div>
            <h3 class="mb-2 text-headline-md">Collaborative Editing</h3>
            <p class="text-body-md text-on-surface-variant">Real-time multiplayer editing for visual canvas and code view.</p>
            <div class="mt-6 flex -space-x-3">
              <span class="h-10 w-10 rounded-full border-2 border-surface-dim bg-surface-container"></span>
              <span class="h-10 w-10 rounded-full border-2 border-surface-dim bg-surface-container-high"></span>
              <span class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface-dim bg-surface-container text-xs">+3</span>
            </div>
          </article>

          <article class="glass-panel flex flex-col gap-8 rounded-xl p-8 md:col-span-2 md:flex-row md:items-center">
            <div class="flex-1">
              <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-white/5 bg-surface-container"><span class="material-symbols-outlined text-primary-300">history</span></div>
              <h3 class="mb-2 text-headline-md">Built-in Version Control</h3>
              <p class="text-body-md text-on-surface-variant">Branch concepts, commit milestones, and merge decks without losing custom CSS.</p>
            </div>
            <div class="w-full flex-1 rounded-lg border border-white/5 bg-surface-container-lowest p-4">
              <div class="mb-4 flex items-center gap-4">
                <div class="h-3 w-3 rounded-full bg-primary shadow-[0_0_8px_rgba(192,193,255,0.6)]"></div>
                <div class="text-sm text-on-surface">Update hero gradient (c8f9a2)</div>
                <div class="ml-auto text-xs text-on-surface-variant">2m ago</div>
              </div>
              <div class="mb-4 flex items-center gap-4 opacity-50">
                <div class="h-3 w-3 rounded-full bg-outline"></div>
                <div class="text-sm text-on-surface">Fix mobile padding (9b1f4d)</div>
                <div class="ml-auto text-xs text-on-surface-variant">1h ago</div>
              </div>
              <div class="flex items-center gap-4 opacity-30">
                <div class="h-3 w-3 rounded-full bg-outline"></div>
                <div class="text-sm text-on-surface">Initial import (a1b2c3)</div>
                <div class="ml-auto text-xs text-on-surface-variant">2d ago</div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

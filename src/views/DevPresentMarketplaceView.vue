<script setup lang="ts">
import TopNavBar from '@/components/layout/TopNavBar.vue'
import SideNavBar from '@/components/layout/SideNavBar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const bestSellers = [
  { title: 'Nexus Pitch Deck', price: '$49', creator: 'SyntaxLabs', rating: '4.9', reviews: 128 },
  { title: 'Stark Tech Portfolio', price: '$29', creator: 'ElenaV', rating: '4.8', reviews: 84 },
  { title: 'Quantum Architecture', price: '$59', creator: 'DevDesign', rating: '5.0', reviews: 215 }
]
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden bg-background text-on-surface">
    <SideNavBar active="assets" project-name="Q3 Presentation" />

    <main class="ml-0 flex min-w-0 flex-1 flex-col md:ml-[280px]">
      <TopNavBar active="marketplace" search-align="left" />

      <div class="relative w-full flex-1 overflow-y-auto">
        <div class="mx-auto max-w-7xl space-y-stack-lg px-gutter py-margin-safe">
          <section class="relative overflow-hidden rounded-2xl border border-outline/20 bg-surface-container-low shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
            <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/10 via-tertiary/5 to-transparent"></div>
            <div class="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-[100px]"></div>
            <div class="relative z-10 flex flex-col items-center justify-between gap-8 p-12 md:flex-row">
              <div class="max-w-xl space-y-stack-md">
                <span class="inline-block rounded-full border border-tertiary/30 bg-tertiary/10 px-3 py-1 text-label-caps text-tertiary">Creator Program</span>
                <h1 class="text-display-xl text-on-surface">Build the future of presentation.</h1>
                <p class="max-w-md text-body-lg text-on-surface-variant">Design high-end templates using DevPresent kinetic syntax. Monetize skills and join visionary community of developer-creators.</p>
                <div class="flex items-center gap-4 pt-4">
                  <button type="button" class="rounded-lg bg-gradient-to-r from-primary to-tertiary px-6 py-3 text-[16px] text-slate-950 shadow-[0_0_20px_rgba(192,193,255,0.4)] transition-all hover:opacity-90">Become a Creator</button>
                  <button type="button" class="rounded-lg border border-outline-variant px-6 py-3 text-[16px] text-on-surface transition-colors hover:bg-surface-variant">View Guidelines</button>
                </div>
              </div>

              <div class="hidden h-80 w-80 lg:block">
                <div class="flex h-full items-center justify-center overflow-hidden rounded-xl border border-outline/30 bg-gradient-to-br from-surface-bright to-surface-dim">
                  <pre class="p-6 pt-12 text-code-sm text-primary/80 opacity-80">&lt;slide theme="dark"&gt;
  &lt;h1 kinetic="reveal"&gt;
    Visionary.
  &lt;/h1&gt;
  &lt;bento-grid rows="3"&gt;
    ...
  &lt;/bento-grid&gt;
&lt;/slide&gt;</pre>
                </div>
              </div>
            </div>
          </section>

          <section class="flex items-center justify-between border-b border-outline-variant/50 pb-4">
            <div class="flex items-center gap-2">
              <button type="button" class="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-high px-4 py-2 text-label-caps text-on-surface transition-colors hover:bg-surface-bright">All Categories<span class="material-symbols-outlined text-[16px]">expand_more</span></button>
              <button type="button" class="rounded-full border border-outline-variant/30 px-4 py-2 text-label-caps text-on-surface-variant transition-colors hover:border-outline-variant hover:text-on-surface">Pitch Decks</button>
              <button type="button" class="rounded-full border border-outline-variant/30 px-4 py-2 text-label-caps text-on-surface-variant transition-colors hover:border-outline-variant hover:text-on-surface">Portfolios</button>
            </div>
            <div class="flex items-center gap-3 text-[14px] text-on-surface-variant">
              <span>Sort by:</span>
              <select aria-label="Sort marketplace templates" class="cursor-pointer border-none bg-transparent text-on-surface outline-none focus:ring-0">
                <option value="popular">Popular</option>
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
              </select>
            </div>
          </section>

          <section>
            <div class="mb-stack-md flex items-center justify-between">
              <h2 class="flex items-center gap-3 text-headline-lg text-on-surface"><span class="material-symbols-outlined text-primary">local_fire_department</span>Best Sellers</h2>
              <a href="#" class="flex items-center gap-1 text-[14px] text-primary transition-colors hover:text-primary-100">View all <span class="material-symbols-outlined text-[16px]">arrow_forward</span></a>
            </div>

            <div class="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
              <article v-for="item in bestSellers" :key="item.title" class="group relative flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                <div class="relative aspect-video overflow-hidden bg-surface-dim">
                  <div class="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(140,176,255,0.32),transparent_35%),linear-gradient(130deg,#101826,#0a0f1d)] transition-transform duration-500 group-hover:scale-105"></div>
                  <div class="absolute inset-0 flex items-center justify-center bg-surface-dim/70 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                    <button type="button" class="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2 text-[14px] text-white backdrop-blur-md transition-colors hover:bg-white/20">
                      <span class="material-symbols-outlined text-[18px]">visibility</span>
                      Quick Preview
                    </button>
                  </div>
                  <div class="absolute right-3 top-3 rounded border border-outline/30 bg-surface-container-lowest/80 px-2 py-1 text-[12px] text-primary backdrop-blur-sm">{{ item.price }}</div>
                </div>

                <div class="flex flex-col gap-2 p-4">
                  <h3 class="truncate text-[18px] text-on-surface">{{ item.title }}</h3>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="h-5 w-5 overflow-hidden rounded-full bg-tertiary-container"></div>
                      <span class="text-[13px] text-on-surface-variant">by {{ item.creator }}</span>
                    </div>
                    <div class="flex items-center gap-1 text-secondary">
                      <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
                      <span class="text-[13px]">{{ item.rating }}</span>
                      <span class="text-[12px] text-on-surface-variant">({{ item.reviews }})</span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section class="pb-12">
            <h2 class="mb-stack-md flex items-center gap-3 text-headline-lg text-on-surface"><span class="material-symbols-outlined text-tertiary">new_releases</span>New Arrivals</h2>
            <div class="grid grid-cols-1 gap-4 lg:h-[400px] lg:grid-cols-4">
              <article class="group relative overflow-hidden rounded-xl border border-outline-variant lg:col-span-2 lg:row-span-2">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_65%_25%,rgba(183,109,255,0.35),transparent_35%),linear-gradient(120deg,#131b2e,#0b1326)] transition-transform duration-700 group-hover:scale-105"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-surface-dim via-surface-dim/50 to-transparent"></div>
                <div class="absolute bottom-0 left-0 w-full p-6">
                  <span class="mb-2 inline-block rounded border border-tertiary/30 bg-tertiary/20 px-2 py-0.5 text-[10px] text-tertiary-fixed">Staff Pick</span>
                  <h3 class="mb-1 text-[24px] text-white">Fluid Dynamics Deck</h3>
                  <p class="mb-4 text-[14px] text-on-surface-variant">Motion-heavy templates built for the new render engine.</p>
                  <span class="rounded border border-white/10 bg-surface-container/50 px-3 py-1 text-primary-fixed backdrop-blur-md">$35</span>
                </div>
              </article>

              <article class="overflow-hidden rounded-xl border border-outline-variant bg-surface-container">
                <div class="aspect-video bg-[radial-gradient(circle_at_75%_25%,rgba(134,239,172,0.22),transparent_35%),linear-gradient(120deg,#131b2e,#0b1326)]"></div>
                <div class="p-3">
                  <h4 class="truncate text-[16px] text-on-surface">Terminal Theme</h4>
                  <div class="mt-1 flex items-center justify-between text-[12px]"><span class="text-on-surface-variant">by CodeCraft</span><span class="text-[14px] text-primary">$19</span></div>
                </div>
              </article>

              <article class="overflow-hidden rounded-xl border border-outline-variant bg-surface-container">
                <div class="aspect-video bg-[radial-gradient(circle_at_75%_25%,rgba(251,191,36,0.2),transparent_35%),linear-gradient(120deg,#131b2e,#0b1326)]"></div>
                <div class="p-3">
                  <h4 class="truncate text-[16px] text-on-surface">Absolute Zero</h4>
                  <div class="mt-1 flex items-center justify-between text-[12px]"><span class="text-on-surface-variant">by StudioMin</span><span class="text-[14px] text-primary">$24</span></div>
                </div>
              </article>

              <article class="group relative cursor-pointer overflow-hidden rounded-xl border border-primary/30 bg-primary-container/10 p-6 transition-colors hover:bg-primary-container/20 lg:col-span-2">
                <div class="absolute -bottom-10 -right-10 opacity-20 transition-opacity group-hover:opacity-40"><span class="material-symbols-outlined text-[120px] text-primary">rocket_launch</span></div>
                <h4 class="relative z-10 mb-2 text-[18px] text-primary-fixed">Have a custom request?</h4>
                <p class="relative z-10 mb-4 max-w-[80%] text-[14px] text-on-surface-variant">Hire top DevPresent creators for bespoke presentations.</p>
                <span class="relative z-10 border-b border-primary pb-0.5 text-label-caps text-primary transition-colors group-hover:text-primary-fixed">Browse Creators →</span>
              </article>
            </div>
          </section>

          <AppFooter />
        </div>
      </div>
    </main>
  </div>
</template>

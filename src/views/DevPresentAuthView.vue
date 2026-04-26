<script setup lang="ts">
import { ref } from 'vue'

const mode = ref<'login' | 'signup'>('login')
</script>

<template>
  <main class="flex min-h-screen w-full bg-surface-container-lowest text-on-surface antialiased selection:bg-primary-700/40 selection:text-white">
    <section class="relative hidden items-center justify-center overflow-hidden border-r border-outline-variant/30 bg-surface-dim p-12 lg:flex lg:w-1/2 lg:p-24">
      <div class="absolute inset-0 bg-gradient-to-br from-surface-container-lowest/90 via-surface-dim/80 to-primary-900/20"></div>
      <div class="relative z-10 max-w-xl">
        <span class="material-symbols-outlined mb-4 block text-6xl text-primary-200" style="font-variation-settings: 'FILL' 1;">view_in_ar</span>
        <h1 class="mb-6 font-display text-display-xl text-on-surface">DevPresent</h1>
        <p class="max-w-md text-body-lg text-on-surface-variant">
          The presentation layer for the modern developer-creator. Built for those who demand precision of code and impact of visionary design.
        </p>
        <pre class="mt-8 rounded-lg border border-outline-variant/50 bg-surface-container-low/50 p-6 text-code-sm text-on-surface-variant">import { Scene, Camera } from '@devpresent/core';

const presentation = new Scene({
  theme: 'kinetic-dark',
  highFidelity: true
});

presentation.render();</pre>
      </div>
    </section>

    <section class="relative flex w-full items-center justify-center bg-surface-container-lowest p-8 sm:p-12 lg:w-1/2 lg:p-24">
      <div class="absolute left-8 top-8 flex items-center gap-2 lg:hidden">
        <span class="material-symbols-outlined text-2xl text-primary-200" style="font-variation-settings: 'FILL' 1;">view_in_ar</span>
        <span class="text-headline-md">DevPresent</span>
      </div>

      <div class="w-full max-w-md">
        <div class="mb-8 text-center lg:text-left">
          <h2 class="text-headline-lg text-on-surface">Welcome back</h2>
          <p class="mt-2 text-body-md text-on-surface-variant">Sign in to continue to your workspace.</p>
        </div>

        <div class="mb-6 flex rounded-lg bg-surface-container p-1">
          <button type="button" class="flex-1 rounded-md px-4 py-2 text-label-caps transition-all" :class="mode === 'login' ? 'bg-surface-bright text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'" @click="mode = 'login'">
            Login
          </button>
          <button type="button" class="flex-1 rounded-md px-4 py-2 text-label-caps transition-all" :class="mode === 'signup' ? 'bg-surface-bright text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'" @click="mode = 'signup'">
            Sign Up
          </button>
        </div>

        <div class="mb-6 flex flex-col gap-stack-sm">
          <button type="button" class="w-full rounded border border-outline-variant bg-surface px-4 py-3 font-semibold text-on-surface transition-colors hover:bg-surface-container-high">
            <span class="flex items-center justify-center gap-3"><span class="material-symbols-outlined text-on-surface-variant">public</span>Continue with Google</span>
          </button>
          <button type="button" class="w-full rounded border border-outline-variant bg-surface px-4 py-3 font-semibold text-on-surface transition-colors hover:bg-surface-container-high">
            <span class="flex items-center justify-center gap-3"><span class="material-symbols-outlined text-on-surface-variant">code</span>Continue with GitHub</span>
          </button>
        </div>

        <div class="relative mb-6 flex items-center">
          <div class="grow border-t border-outline-variant/50"></div>
          <span class="mx-4 shrink-0 text-label-caps text-on-surface-variant">Or continue with email</span>
          <div class="grow border-t border-outline-variant/50"></div>
        </div>

        <form class="flex flex-col gap-stack-md">
          <div>
            <label for="email" class="mb-1 block text-label-caps text-on-surface-variant">Email Address</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">mail</span>
              <input id="email" type="email" placeholder="developer@example.com" class="w-full rounded-md border border-outline-variant bg-surface py-3 pl-12 pr-4 text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary-300 focus:ring-1 focus:ring-primary-300" />
            </div>
          </div>

          <div>
            <div class="mb-1 flex items-center justify-between">
              <label for="password" class="text-label-caps text-on-surface-variant">Password</label>
              <a href="#" class="text-sm text-primary-200 transition-colors hover:text-primary-100">Forgot password?</a>
            </div>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
              <input id="password" type="password" placeholder="••••••••" class="w-full rounded-md border border-outline-variant bg-surface py-3 pl-12 pr-4 text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary-300 focus:ring-1 focus:ring-primary-300" />
            </div>
          </div>

          <button type="button" class="mt-2 w-full rounded-md bg-gradient-to-r from-primary-300 to-tertiary-container py-4 text-label-caps text-surface-container-lowest shadow-[0_0_20px_rgba(192,193,255,0.2)] transition-all hover:opacity-90 active:scale-[0.98]">
            {{ mode === 'login' ? 'Sign In' : 'Create Account' }}
          </button>
        </form>
      </div>
    </section>
  </main>
</template>

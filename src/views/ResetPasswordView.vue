<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// @ts-expect-error JS service module in mixed TS workspace
import { authService } from '@/services/auth.service.js'

const route = useRoute()
const router = useRouter()

const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  const queryToken = route.query.token
  token.value = Array.isArray(queryToken) ? (queryToken[0] || '') : (queryToken || '').toString()

  if (!token.value) {
    errorMessage.value = 'Token de recuperacion invalido o ausente.'
  }
})

const handleSubmit = async () => {
  if (isSubmitting.value) return

  errorMessage.value = ''
  successMessage.value = ''

  if (!token.value) {
    errorMessage.value = 'Token de recuperacion invalido o ausente.'
    return
  }

  if (newPassword.value.length < 8) {
    errorMessage.value = 'La contraseña debe tener al menos 8 caracteres.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }

  isSubmitting.value = true

  try {
    const response = await authService.resetPassword(token.value, newPassword.value)
    successMessage.value = response?.message || 'Contraseña actualizada correctamente.'
    newPassword.value = ''
    confirmPassword.value = ''
    setTimeout(() => {
      router.push('/devpresent/auth')
    }, 1200)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'No se pudo restablecer la contraseña.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen w-full items-center justify-center bg-surface-container-lowest px-6 py-10 text-on-surface">
    <section class="w-full max-w-md rounded-xl border border-outline-variant/40 bg-surface p-6 shadow-lg">
      <h1 class="text-headline-lg">Restablecer contraseña</h1>
      <p class="mt-2 text-body-md text-on-surface-variant">Ingresa tu nueva contraseña para continuar.</p>

      <form class="mt-6 flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div>
          <label for="new-password" class="mb-1 block text-label-caps text-on-surface-variant">Nueva contraseña</label>
          <input id="new-password" v-model="newPassword" type="password" class="w-full rounded-md border border-outline-variant bg-surface py-3 px-4 text-on-surface outline-none transition-all focus:border-primary-300 focus:ring-1 focus:ring-primary-300" placeholder="••••••••" required />
        </div>

        <div>
          <label for="confirm-password" class="mb-1 block text-label-caps text-on-surface-variant">Confirmar contraseña</label>
          <input id="confirm-password" v-model="confirmPassword" type="password" class="w-full rounded-md border border-outline-variant bg-surface py-3 px-4 text-on-surface outline-none transition-all focus:border-primary-300 focus:ring-1 focus:ring-primary-300" placeholder="••••••••" required />
        </div>

        <button type="submit" class="mt-2 w-full rounded-md bg-gradient-to-r from-primary-300 to-tertiary-container py-3 text-label-caps text-surface-container-lowest transition-all hover:opacity-90 disabled:opacity-70" :disabled="isSubmitting || !token">
          {{ isSubmitting ? 'Procesando...' : 'Actualizar contraseña' }}
        </button>

        <button type="button" class="w-full rounded-md border border-outline-variant bg-surface py-3 text-label-caps text-on-surface transition-colors hover:bg-surface-container-high" @click="router.push('/devpresent/auth')">
          Volver al login
        </button>

        <p v-if="errorMessage" class="rounded-md border border-red-400/30 bg-red-900/20 px-3 py-2 text-sm text-red-200">{{ errorMessage }}</p>
        <p v-if="successMessage" class="rounded-md border border-emerald-400/30 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-200">{{ successMessage }}</p>
      </form>
    </section>
  </main>
</template>

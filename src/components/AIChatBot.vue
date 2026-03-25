<template>
  <div class="ai-chatbot-container">
    <transition name="fade-slide">
      <div v-if="isOpen" class="ai-chat-panel">
        <div class="chat-header">
          <div class="header-info">
            <div class="ai-avatar">AI</div>
            <h3>Asistente IA</h3>
          </div>
          <button @click="toggleChat" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <div v-if="messages.length === 0" class="empty-state">
            <p>¡Hola! Puedo ayudarte a crear, modificar o buscar presentaciones y responder tus dudas.</p>
          </div>
          <div
            v-for="(msg, index) in clientMessages"
            :key="index"
            :class="['message-wrapper', msg.role === 'user' ? 'user' : 'assistant']"
          >
            <div class="message-bubble">{{ msg.content }}</div>
          </div>
          <div v-if="isLoading" class="message-wrapper assistant">
            <div class="message-bubble loading">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
          </div>
        </div>

        <form @submit.prevent="sendMessage" class="chat-input-area">
          <input
            v-model="inputText"
            type="text"
            placeholder="Pregúntame o pídeme algo..."
            :disabled="isLoading"
          />
          <button type="submit" :disabled="isLoading || !inputText.trim()" class="send-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </form>
      </div>
    </transition>

    <button @click="toggleChat" class="chat-trigger-btn" :class="{ 'is-open': isOpen }">
      <svg v-if="!isOpen" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
      <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { CHAT_API } from '@/config/api.js'

// 1. Recibimos la página actual del editor
const props = defineProps({
  currentPage: {
    type: Number,
    default: 1
  }
})

// 2. Definimos el emisor de eventos
const emit = defineEmits(['ai-action'])

const authStore = useAuthStore()

const isOpen = ref(false)
const isLoading = ref(false)
const inputText = ref('')
const messages = ref<{role: string, content: string}[]>([])
const messagesContainer = ref<HTMLElement | null>(null)

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    scrollToBottom()
  }
}

const clientMessages = computed(() => {
  return messages.value.filter(m => m.role === 'user' || m.role === 'assistant')
})

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {

  if (!inputText.value.trim() || isLoading.value) return

  const userMsg = inputText.value.trim()
  messages.value.push({ role: 'user', content: userMsg })
  inputText.value = ''
  isLoading.value = true

  await scrollToBottom()

  try {
    const userId = authStore.user?._id || ''

    const response = await fetch(`${CHAT_API}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: messages.value,
        userId: userId,
        currentPage: props.currentPage // Pasamos la página actual a la IA
      })
    })

    if (!response.ok) {
      throw new Error('Error al conectar con la IA')
    }

    const data = await response.json()

    // 3. ¡AQUÍ EMITIMOS LA ORDEN AL EDITOR!
    if (data.action) {
      console.log("🤖 Chatbot enviando orden al Editor:", data.action);
      emit('ai-action', data.action);
    }

    if (data.message && data.message.content) {
      messages.value.push(data.message)
    }
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: 'Hubo un error al comunicarme con el servidor. Inténtalo de nuevo.'
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}
</script>

<style scoped>
.ai-chatbot-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  font-family: 'Inter', system-ui, sans-serif;
}

.chat-trigger-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.chat-trigger-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
}

.chat-trigger-btn.is-open {
  background: #333;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.ai-chat-panel {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 380px;
  height: 600px;
  max-height: calc(100vh - 120px);
  background: rgba(22, 22, 25, 0.85); /* Glassmorphism bg */
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.chat-header h3 {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}
.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}
.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.empty-state {
  text-align: center;
  color: #9ca3af;
  margin: auto;
  font-size: 14px;
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.message-wrapper.user {
  justify-content: flex-end;
}

.message-wrapper.assistant {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-wrapper.user .message-bubble {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-wrapper.assistant .message-bubble {
  background: rgba(255, 255, 255, 0.08);
  color: #e5e7eb;
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.chat-input-area {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 12px;
  background: rgba(0, 0, 0, 0.2);
}

.chat-input-area input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 12px 16px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
}

.chat-input-area input:focus {
  border-color: #8b5cf6;
  background: rgba(255, 255, 255, 0.08);
}

.chat-input-area input::placeholder {
  color: #9ca3af;
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #6366f1;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s, transform 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  pointer-events: none;
}

/* Loading Dots */
.loading .dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #9ca3af;
  margin: 0 3px;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading .dot:nth-child(1) { animation-delay: -0.32s; }
.loading .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style>

<template>
  <div class="pro-color-picker-wrapper" ref="pickerRef">
    <!-- Botón visible -->
    <div
      class="pro-color-trigger"
      :style="{ backgroundColor: modelValue === 'transparent' ? '#ffffff' : modelValue }"
      @click.stop="togglePicker"
      title="Elegir color"
    >
      <div v-if="modelValue === 'transparent'" class="transparent-line"></div>
    </div>

    <!-- Menú Desplegable -->
    <transition name="fade">
      <div v-if="isOpen" class="pro-color-panel" @click.stop>
        <div class="panel-header">Paleta Optimizada</div>
        
        <!-- Swatches rápidos (0 lag) -->
        <div class="swatches-grid">
          <button
            v-for="color in swatches"
            :key="color"
            class="swatch-btn"
            :class="{ 'is-active': modelValue === color }"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
          ></button>
        </div>

        <!-- Controles personalizados -->
        <div class="custom-color-row">
          <!-- Nativo (Lazy) -->
          <label class="native-picker-btn" title="Selector del Sistema">
            <i class="ph ph-palette"></i>
            <input
              type="color"
              :value="modelValue === 'transparent' ? '#ffffff' : modelValue"
              @change="handleNativeChange"
              class="native-input-hidden"
            />
          </label>
          <!-- Texto HEX -->
          <input
            type="text"
            :value="modelValue"
            @change="handleTextChange"
            class="hex-input"
            placeholder="#HEX"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const isOpen = ref(false);
const pickerRef = ref<HTMLElement | null>(null);

// Colores rápidos de uso frecuente (estilo Tailwind)
const swatches = [
  'transparent', '#ffffff', '#f8fafc', '#e2e8f0', '#94a3b8', '#475569', '#1e293b', '#000000',
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', 
  '#06b6d4', '#0ea5e9', '#3b82f6', '#2563eb', '#4f46e5', '#6366f1', '#8b5cf6', '#d946ef'
];

const togglePicker = () => {
  isOpen.value = !isOpen.value;
};

const selectColor = (color: string) => {
  emit('update:modelValue', color);
};

const handleNativeChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

const handleTextChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

const handleClickOutside = (e: MouseEvent) => {
  if (isOpen.value && pickerRef.value && !pickerRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.pro-color-picker-wrapper { position: relative; display: inline-block; width: 100%; }
.pro-color-trigger { width: 100%; height: 28px; border-radius: 4px; border: 1px solid var(--border-strong, #30363d); cursor: pointer; transition: 0.2s; position: relative; overflow: hidden; background-image: conic-gradient(#ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc); background-size: 8px 8px; }
.pro-color-trigger:hover { border-color: var(--accent-primary, #58a6ff); }
.transparent-line { position: absolute; width: 140%; height: 2px; background: #ff4d4d; top: 50%; left: -20%; transform: rotate(-45deg); }

.pro-color-panel { position: absolute; top: 110%; right: 0; width: 220px; background: rgba(17, 17, 19, 0.95); backdrop-filter: blur(10px); border: 1px solid var(--border-strong, #30363d); border-radius: 8px; padding: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); z-index: 99999; }
.panel-header { font-size: 0.7rem; font-weight: 600; color: #8b949e; margin-bottom: 10px; text-transform: uppercase; }
.swatches-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; margin-bottom: 10px; }
.swatch-btn { width: 100%; aspect-ratio: 1/1; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: 0.1s; padding: 0; background-image: conic-gradient(#ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc); background-size: 6px 6px; }
.swatch-btn:hover { transform: scale(1.15); border-color: #fff; z-index: 2; }
.swatch-btn.is-active { border: 2px solid var(--accent-primary, #58a6ff); transform: scale(1.1); }

.custom-color-row { display: flex; gap: 8px; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; }
.native-picker-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer; color: #c9d1d9; transition: 0.2s; position: relative; overflow: hidden; }
.native-picker-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
.native-input-hidden { position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
.hex-input { flex: 1; background: rgba(1, 4, 9, 0.5); border: 1px solid rgba(255,255,255,0.1); color: #c9d1d9; padding: 6px; border-radius: 4px; font-family: monospace; font-size: 0.8rem; text-transform: uppercase; text-align: center; }
.hex-input:focus { outline: none; border-color: var(--accent-primary, #58a6ff); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }
</style>
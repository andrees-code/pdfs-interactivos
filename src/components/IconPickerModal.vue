<template>
  <Teleport to="body">
    <Transition name="icon-picker-fade">
      <div v-if="modelValue" class="icon-picker-backdrop" @mousedown.self="$emit('update:modelValue', false)">
        <div class="icon-picker-modal" :style="modalStyle">

          <!-- Header -->
          <div class="ipm-header">
            <div class="ipm-title">
              <i class="ph ph-squares-four"></i>
              <span>Elegir Icono</span>
            </div>
            <button class="ipm-close" @click="$emit('update:modelValue', false)">
              <i class="ph ph-x"></i>
            </button>
          </div>

          <!-- Search -->
          <div class="ipm-search-wrap">
            <i class="ph ph-magnifying-glass ipm-search-icon"></i>
            <input
              ref="searchInputRef"
              v-model="query"
              class="ipm-search"
              placeholder="Buscar icono... ej: heart, star, user"
              @keydown.escape="$emit('update:modelValue', false)"
            />
            <button v-if="query" class="ipm-search-clear" @click="query = ''">
              <i class="ph ph-x-circle"></i>
            </button>
          </div>

          <!-- Category pills -->
          <div class="ipm-categories">
            <button
              v-for="cat in categories"
              :key="cat.id"
              class="ipm-cat-pill"
              :class="{ 'is-active': activeCategory === cat.id }"
              @click="activeCategory = activeCategory === cat.id ? 'all' : cat.id"
            >
              <i :class="`ph ph-${cat.icon}`"></i>
              {{ cat.label }}
            </button>
          </div>

          <!-- Grid -->
          <div class="ipm-grid-wrap" ref="gridRef">
            <div class="ipm-count" v-if="filteredIcons.length > 0">
              {{ filteredIcons.length }} iconos
            </div>

            <div v-if="filteredIcons.length === 0" class="ipm-empty">
              <i class="ph ph-smiley-x-eyes"></i>
              <p>Sin resultados para "<strong>{{ query }}</strong>"</p>
              <small>Prueba con otro término en inglés</small>
            </div>

            <div v-else class="ipm-grid">
              <button
                v-for="icon in filteredIcons"
                :key="icon.name"
                class="ipm-icon-btn"
                :class="{ 'is-selected': currentIcon === icon.name }"
                :title="icon.name"
                @click="selectIcon(icon.name)"
              >
                <i :class="`ph ph-${icon.name}`"></i>
                <span class="ipm-icon-label">{{ icon.name }}</span>
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="ipm-footer" v-if="currentIcon">
            <div class="ipm-preview">
              <i :class="`ph ph-${currentIcon}`"></i>
              <span>{{ currentIcon }}</span>
            </div>
            <button class="ipm-confirm" @click="confirmSelection">
              <i class="ph ph-check"></i> Aplicar
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps<{
  modelValue: boolean
  selectedIcon?: string
  anchorEl?: HTMLElement | null
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  'select': [iconName: string]
}>()

const query = ref('')
const activeCategory = ref('all')
const currentIcon = ref(props.selectedIcon || '')
const searchInputRef = ref<HTMLInputElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)

// Focus search when opened
watch(() => props.modelValue, async (val) => {
  if (val) {
    currentIcon.value = props.selectedIcon || ''
    query.value = ''
    activeCategory.value = 'all'
    await nextTick()
    searchInputRef.value?.focus()
  }
})

// Modal position — appears near the sidebar
const modalStyle = computed(() => ({
  position: 'fixed' as const,
  top: '80px',
  right: '290px',
  zIndex: 10050,
}))

const selectIcon = (name: string) => {
  currentIcon.value = name
}

const confirmSelection = () => {
  if (currentIcon.value) {
    emit('select', currentIcon.value)
    emit('update:modelValue', false)
  }
}

// ─── Categories ────────────────────────────────────────────────────────────
const categories = [
  { id: 'ui',      label: 'UI',       icon: 'layout' },
  { id: 'arrows',  label: 'Flechas',  icon: 'arrows-out' },
  { id: 'media',   label: 'Media',    icon: 'play-circle' },
  { id: 'people',  label: 'Personas', icon: 'users' },
  { id: 'nature',  label: 'Nat.',     icon: 'leaf' },
  { id: 'tech',    label: 'Tech',     icon: 'cpu' },
  { id: 'shapes',  label: 'Formas',   icon: 'shapes' },
  { id: 'comm',    label: 'Comm.',    icon: 'chat-circle' },
  { id: 'edit',    label: 'Edición',  icon: 'pencil' },
  { id: 'finance', label: 'Finanzas', icon: 'currency-dollar' },
]

// ─── Full icon list with categories ────────────────────────────────────────
const ALL_ICONS: { name: string; cat: string }[] = [
  // UI
  { name: 'house', cat: 'ui' }, { name: 'gear', cat: 'ui' }, { name: 'bell', cat: 'ui' },
  { name: 'magnifying-glass', cat: 'ui' }, { name: 'funnel', cat: 'ui' }, { name: 'sliders', cat: 'ui' },
  { name: 'list', cat: 'ui' }, { name: 'grid-four', cat: 'ui' }, { name: 'squares-four', cat: 'ui' },
  { name: 'table', cat: 'ui' }, { name: 'sidebar', cat: 'ui' }, { name: 'layout', cat: 'ui' },
  { name: 'menu', cat: 'ui' }, { name: 'dots-three', cat: 'ui' }, { name: 'dots-six', cat: 'ui' },
  { name: 'equals', cat: 'ui' }, { name: 'plus', cat: 'ui' }, { name: 'minus', cat: 'ui' },
  { name: 'x', cat: 'ui' }, { name: 'check', cat: 'ui' }, { name: 'check-circle', cat: 'ui' },
  { name: 'warning', cat: 'ui' }, { name: 'info', cat: 'ui' }, { name: 'question', cat: 'ui' },
  { name: 'prohibit', cat: 'ui' }, { name: 'lock', cat: 'ui' }, { name: 'lock-open', cat: 'ui' },
  { name: 'eye', cat: 'ui' }, { name: 'eye-slash', cat: 'ui' }, { name: 'bookmark', cat: 'ui' },
  { name: 'bookmarks', cat: 'ui' }, { name: 'tag', cat: 'ui' }, { name: 'tags', cat: 'ui' },
  { name: 'flag', cat: 'ui' }, { name: 'star', cat: 'ui' }, { name: 'heart', cat: 'ui' },
  { name: 'thumbs-up', cat: 'ui' }, { name: 'thumbs-down', cat: 'ui' }, { name: 'share', cat: 'ui' },
  { name: 'export', cat: 'ui' }, { name: 'upload', cat: 'ui' }, { name: 'download', cat: 'ui' },
  { name: 'trash', cat: 'ui' }, { name: 'copy', cat: 'ui' }, { name: 'clipboard', cat: 'ui' },
  { name: 'link', cat: 'ui' }, { name: 'link-break', cat: 'ui' }, { name: 'paper-clip', cat: 'ui' },
  { name: 'push-pin', cat: 'ui' }, { name: 'map-pin', cat: 'ui' }, { name: 'compass', cat: 'ui' },
  // Arrows
  { name: 'arrow-right', cat: 'arrows' }, { name: 'arrow-left', cat: 'arrows' },
  { name: 'arrow-up', cat: 'arrows' }, { name: 'arrow-down', cat: 'arrows' },
  { name: 'arrow-circle-right', cat: 'arrows' }, { name: 'arrow-circle-left', cat: 'arrows' },
  { name: 'arrow-circle-up', cat: 'arrows' }, { name: 'arrow-circle-down', cat: 'arrows' },
  { name: 'caret-right', cat: 'arrows' }, { name: 'caret-left', cat: 'arrows' },
  { name: 'caret-up', cat: 'arrows' }, { name: 'caret-down', cat: 'arrows' },
  { name: 'arrows-out', cat: 'arrows' }, { name: 'arrows-in', cat: 'arrows' },
  { name: 'arrows-left-right', cat: 'arrows' }, { name: 'arrows-up-down', cat: 'arrows' },
  { name: 'arrows-clockwise', cat: 'arrows' }, { name: 'arrows-counter-clockwise', cat: 'arrows' },
  { name: 'arrow-u-up-left', cat: 'arrows' }, { name: 'arrow-u-up-right', cat: 'arrows' },
  { name: 'arrow-bend-right-up', cat: 'arrows' }, { name: 'arrow-bend-right-down', cat: 'arrows' },
  { name: 'arrow-fat-right', cat: 'arrows' }, { name: 'arrow-fat-left', cat: 'arrows' },
  { name: 'arrow-fat-up', cat: 'arrows' }, { name: 'arrow-fat-down', cat: 'arrows' },
  // Media
  { name: 'play', cat: 'media' }, { name: 'pause', cat: 'media' }, { name: 'stop', cat: 'media' },
  { name: 'play-circle', cat: 'media' }, { name: 'pause-circle', cat: 'media' },
  { name: 'skip-forward', cat: 'media' }, { name: 'skip-back', cat: 'media' },
  { name: 'rewind', cat: 'media' }, { name: 'fast-forward', cat: 'media' },
  { name: 'speaker-high', cat: 'media' }, { name: 'speaker-low', cat: 'media' },
  { name: 'speaker-slash', cat: 'media' }, { name: 'microphone', cat: 'media' },
  { name: 'microphone-slash', cat: 'media' }, { name: 'camera', cat: 'media' },
  { name: 'video-camera', cat: 'media' }, { name: 'video-camera-slash', cat: 'media' },
  { name: 'image', cat: 'media' }, { name: 'images', cat: 'media' },
  { name: 'film-strip', cat: 'media' }, { name: 'music-note', cat: 'media' },
  { name: 'music-notes', cat: 'media' }, { name: 'radio', cat: 'media' },
  { name: 'television', cat: 'media' }, { name: 'monitor', cat: 'media' },
  { name: 'projector-screen', cat: 'media' }, { name: 'record', cat: 'media' },
  // People
  { name: 'user', cat: 'people' }, { name: 'users', cat: 'people' },
  { name: 'user-circle', cat: 'people' }, { name: 'user-plus', cat: 'people' },
  { name: 'user-minus', cat: 'people' }, { name: 'user-check', cat: 'people' },
  { name: 'user-gear', cat: 'people' }, { name: 'user-list', cat: 'people' },
  { name: 'person', cat: 'people' }, { name: 'person-arms-spread', cat: 'people' },
  { name: 'baby', cat: 'people' }, { name: 'gender-male', cat: 'people' },
  { name: 'gender-female', cat: 'people' }, { name: 'student', cat: 'people' },
  { name: 'graduation-cap', cat: 'people' }, { name: 'identification-card', cat: 'people' },
  { name: 'detective', cat: 'people' }, { name: 'astronaut', cat: 'people' },
  // Nature
  { name: 'leaf', cat: 'nature' }, { name: 'plant', cat: 'nature' },
  { name: 'flower', cat: 'nature' }, { name: 'flower-lotus', cat: 'nature' },
  { name: 'tree', cat: 'nature' }, { name: 'tree-evergreen', cat: 'nature' },
  { name: 'sun', cat: 'nature' }, { name: 'moon', cat: 'nature' },
  { name: 'cloud', cat: 'nature' }, { name: 'cloud-rain', cat: 'nature' },
  { name: 'cloud-lightning', cat: 'nature' }, { name: 'cloud-snow', cat: 'nature' },
  { name: 'snowflake', cat: 'nature' }, { name: 'fire', cat: 'nature' },
  { name: 'wave', cat: 'nature' }, { name: 'mountains', cat: 'nature' },
  { name: 'island', cat: 'nature' }, { name: 'globe', cat: 'nature' },
  { name: 'globe-hemisphere-west', cat: 'nature' }, { name: 'globe-hemisphere-east', cat: 'nature' },
  { name: 'dog', cat: 'nature' }, { name: 'cat', cat: 'nature' },
  { name: 'bird', cat: 'nature' }, { name: 'fish', cat: 'nature' },
  { name: 'butterfly', cat: 'nature' }, { name: 'planet', cat: 'nature' },
  // Tech
  { name: 'cpu', cat: 'tech' }, { name: 'device-mobile', cat: 'tech' },
  { name: 'device-tablet', cat: 'tech' }, { name: 'laptop', cat: 'tech' },
  { name: 'desktop', cat: 'tech' }, { name: 'keyboard', cat: 'tech' },
  { name: 'mouse', cat: 'tech' }, { name: 'printer', cat: 'tech' },
  { name: 'hard-drive', cat: 'tech' }, { name: 'hard-drives', cat: 'tech' },
  { name: 'floppy-disk', cat: 'tech' }, { name: 'usb', cat: 'tech' },
  { name: 'bluetooth', cat: 'tech' }, { name: 'wifi-high', cat: 'tech' },
  { name: 'wifi-slash', cat: 'tech' }, { name: 'battery-full', cat: 'tech' },
  { name: 'battery-empty', cat: 'tech' }, { name: 'battery-charging', cat: 'tech' },
  { name: 'code', cat: 'tech' }, { name: 'code-block', cat: 'tech' },
  { name: 'terminal', cat: 'tech' }, { name: 'git-branch', cat: 'tech' },
  { name: 'git-commit', cat: 'tech' }, { name: 'git-merge', cat: 'tech' },
  { name: 'robot', cat: 'tech' }, { name: 'brain', cat: 'tech' },
  { name: 'circuit-board', cat: 'tech' }, { name: 'game-controller', cat: 'tech' },
  // Shapes
  { name: 'circle', cat: 'shapes' }, { name: 'square', cat: 'shapes' },
  { name: 'rectangle', cat: 'shapes' }, { name: 'triangle', cat: 'shapes' },
  { name: 'diamond', cat: 'shapes' }, { name: 'pentagon', cat: 'shapes' },
  { name: 'hexagon', cat: 'shapes' }, { name: 'octagon', cat: 'shapes' },
  { name: 'star', cat: 'shapes' }, { name: 'star-four', cat: 'shapes' },
  { name: 'heart', cat: 'shapes' }, { name: 'lightning', cat: 'shapes' },
  { name: 'cross', cat: 'shapes' }, { name: 'infinity', cat: 'shapes' },
  { name: 'cube', cat: 'shapes' }, { name: 'cylinder', cat: 'shapes' },
  { name: 'sphere', cat: 'shapes' }, { name: 'cone', cat: 'shapes' },
  { name: 'shapes', cat: 'shapes' },
  // Communications
  { name: 'chat-circle', cat: 'comm' }, { name: 'chat-text', cat: 'comm' },
  { name: 'chats', cat: 'comm' }, { name: 'chat-teardrop', cat: 'comm' },
  { name: 'envelope', cat: 'comm' }, { name: 'envelope-open', cat: 'comm' },
  { name: 'envelope-simple', cat: 'comm' }, { name: 'at', cat: 'comm' },
  { name: 'phone', cat: 'comm' }, { name: 'phone-call', cat: 'comm' },
  { name: 'phone-disconnect', cat: 'comm' }, { name: 'phone-slash', cat: 'comm' },
  { name: 'bell', cat: 'comm' }, { name: 'bell-ringing', cat: 'comm' },
  { name: 'broadcast', cat: 'comm' }, { name: 'megaphone', cat: 'comm' },
  { name: 'rss', cat: 'comm' }, { name: 'telegram-logo', cat: 'comm' },
  { name: 'whatsapp-logo', cat: 'comm' }, { name: 'slack-logo', cat: 'comm' },
  { name: 'discord-logo', cat: 'comm' }, { name: 'twitter-logo', cat: 'comm' },
  { name: 'instagram-logo', cat: 'comm' }, { name: 'linkedin-logo', cat: 'comm' },
  { name: 'github-logo', cat: 'comm' }, { name: 'youtube-logo', cat: 'comm' },
  // Editing
  { name: 'pencil', cat: 'edit' }, { name: 'pencil-simple', cat: 'edit' },
  { name: 'pencil-line', cat: 'edit' }, { name: 'pen', cat: 'edit' },
  { name: 'pen-nib', cat: 'edit' }, { name: 'highlighter', cat: 'edit' },
  { name: 'eraser', cat: 'edit' }, { name: 'scissors', cat: 'edit' },
  { name: 'paint-brush', cat: 'edit' }, { name: 'paint-roller', cat: 'edit' },
  { name: 'palette', cat: 'edit' }, { name: 'crop', cat: 'edit' },
  { name: 'magic-wand', cat: 'edit' }, { name: 'sparkle', cat: 'edit' },
  { name: 'text-t', cat: 'edit' }, { name: 'text-aa', cat: 'edit' },
  { name: 'text-align-left', cat: 'edit' }, { name: 'text-align-center', cat: 'edit' },
  { name: 'text-align-right', cat: 'edit' }, { name: 'list-bullets', cat: 'edit' },
  { name: 'list-numbers', cat: 'edit' }, { name: 'quotes', cat: 'edit' },
  // Finance
  { name: 'currency-dollar', cat: 'finance' }, { name: 'currency-euro', cat: 'finance' },
  { name: 'currency-btc', cat: 'finance' }, { name: 'currency-eth', cat: 'finance' },
  { name: 'money', cat: 'finance' }, { name: 'bank', cat: 'finance' },
  { name: 'credit-card', cat: 'finance' }, { name: 'wallet', cat: 'finance' },
  { name: 'chart-bar', cat: 'finance' }, { name: 'chart-line', cat: 'finance' },
  { name: 'chart-pie', cat: 'finance' }, { name: 'trend-up', cat: 'finance' },
  { name: 'trend-down', cat: 'finance' }, { name: 'shopping-cart', cat: 'finance' },
  { name: 'shopping-bag', cat: 'finance' }, { name: 'receipt', cat: 'finance' },
  { name: 'invoice', cat: 'finance' }, { name: 'hand-coins', cat: 'finance' },
  { name: 'piggy-bank', cat: 'finance' }, { name: 'safe', cat: 'finance' },
]

const filteredIcons = computed(() => {
  let list = ALL_ICONS
  if (activeCategory.value !== 'all') {
    list = list.filter(i => i.cat === activeCategory.value)
  }
  if (query.value.trim()) {
    const q = query.value.trim().toLowerCase()
    list = list.filter(i => i.name.includes(q))
  }
  return list
})

// Reset scroll on filter change
watch([query, activeCategory], () => {
  nextTick(() => {
    if (gridRef.value) gridRef.value.scrollTop = 0
  })
})
</script>

<style scoped>
/* ── Backdrop ─────────────────────────────────────── */
.icon-picker-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10049;
}

/* ── Modal box ────────────────────────────────────── */
.icon-picker-modal {
  width: 420px;
  max-height: 560px;
  background: rgba(17, 17, 19, 0.7);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(88,166,255,0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ── Header ───────────────────────────────────────── */
.ipm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--bg-surface-active);
  flex-shrink: 0;
}
.ipm-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}
.ipm-title i { color: var(--accent-primary); font-size: 1.1rem; }
.ipm-close {
  width: 28px; height: 28px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem;
  transition: 0.15s;
}
.ipm-close:hover { background: var(--bg-surface-active); color: var(--danger); }

/* ── Search ───────────────────────────────────────── */
.ipm-search-wrap {
  display: flex;
  align-items: center;
  margin: 12px 14px 8px;
  background: var(--bg-base);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  padding: 0 12px;
  flex-shrink: 0;
  transition: border-color 0.2s;
}
.ipm-search-wrap:focus-within { border-color: var(--accent-primary); box-shadow: 0 0 0 3px rgba(88,166,255,0.12); }
.ipm-search-icon { color: var(--text-secondary); font-size: 1rem; flex-shrink: 0; }
.ipm-search {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 0.85rem;
  padding: 9px 8px;
  font-family: inherit;
}
.ipm-search::placeholder { color: #4d5566; }
.ipm-search-clear {
  background: transparent; border: none; color: var(--text-secondary);
  cursor: pointer; font-size: 1rem; display: flex; align-items: center;
  padding: 0; transition: color 0.15s;
}
.ipm-search-clear:hover { color: var(--danger); }

/* ── Category pills ───────────────────────────────── */
.ipm-categories {
  display: flex;
  gap: 5px;
  padding: 0 14px 10px;
  overflow-x: auto;
  flex-shrink: 0;
  scrollbar-width: none;
}
.ipm-categories::-webkit-scrollbar { display: none; }
.ipm-cat-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid var(--border-strong);
  background: var(--bg-base);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.15s;
  flex-shrink: 0;
}
.ipm-cat-pill i { font-size: 0.85rem; }
.ipm-cat-pill:hover { border-color: var(--accent-primary); color: var(--text-primary); background: rgba(17, 17, 19, 0.7); }
.ipm-cat-pill.is-active {
  background: rgba(88,166,255,0.15);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* ── Grid area ────────────────────────────────────── */
.ipm-grid-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 0 14px 10px;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: var(--border-strong) transparent;
}
.ipm-grid-wrap::-webkit-scrollbar { width: 5px; }
.ipm-grid-wrap::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }

.ipm-count {
  font-size: 0.68rem;
  color: #4d5566;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding-top: 4px;
}

.ipm-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.ipm-icon-btn {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border-radius: 7px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 6px 2px 4px;
  transition: all 0.12s;
  overflow: hidden;
  position: relative;
}
.ipm-icon-btn i { font-size: 1.4rem; transition: transform 0.15s; flex-shrink: 0; }
.ipm-icon-label {
  font-size: 0.52rem;
  color: #4d5566;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  text-align: center;
  line-height: 1;
  display: none; /* show on hover for performance */
}
.ipm-icon-btn:hover {
  background: var(--bg-surface-active);
  border-color: var(--border-strong);
  color: var(--text-primary);
}
.ipm-icon-btn:hover i { transform: scale(1.18); }
.ipm-icon-btn:hover .ipm-icon-label { display: block; }
.ipm-icon-btn.is-selected {
  background: rgba(88,166,255,0.15);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}
.ipm-icon-btn.is-selected i { transform: scale(1.15); }

/* ── Empty state ──────────────────────────────────── */
.ipm-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #4d5566;
  text-align: center;
  gap: 8px;
}
.ipm-empty i { font-size: 2.5rem; }
.ipm-empty p { margin: 0; font-size: 0.85rem; color: var(--text-secondary); }
.ipm-empty small { font-size: 0.75rem; color: #4d5566; }

/* ── Footer / preview ─────────────────────────────── */
.ipm-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-top: 1px solid var(--bg-surface-active);
  background: var(--bg-base);
  flex-shrink: 0;
  gap: 10px;
}
.ipm-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(17, 17, 19, 0.7);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  padding: 7px 12px;
  flex: 1;
  min-width: 0;
}
.ipm-preview i { font-size: 1.4rem; color: var(--accent-primary); flex-shrink: 0; }
.ipm-preview span {
  font-size: 0.78rem;
  color: var(--text-secondary);
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ipm-confirm {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 7px;
  background: var(--success);
  border: none;
  color: white;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: 0.15s;
  flex-shrink: 0;
  white-space: nowrap;
}
.ipm-confirm:hover { background: var(--success); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(46,160,67,0.35); }
.ipm-confirm i { font-size: 0.9rem; }

/* ── Transition ───────────────────────────────────── */
.icon-picker-fade-enter-active,
.icon-picker-fade-leave-active {
  transition: all 0.18s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.icon-picker-fade-enter-from,
.icon-picker-fade-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-6px);
}
</style>
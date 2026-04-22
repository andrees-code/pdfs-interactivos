  <template>
    <div>
      <div class="pro-editor-app" ref="appContainerRef">
        <transition name="toast-fade">
          <div v-if="toast.show" class="pro-toast" :class="`toast-${toast.type}`">
            <div class="toast-content">
              <i class="ph" :class="toast.type === 'error' ? 'ph-warning-circle' : (toast.type === 'success' ? 'ph-check-circle' : 'ph-info')"></i>
              <span>{{ toast.message }}</span>
            </div>
            <button class="toast-close" @click="closeToast"><i class="ph ph-x"></i></button>
          </div>
        </transition>
        <EditorHeader
          :is-converting="isConverting"
          :has-doc="hasDoc"
          :zoom="zoom"
          :play-mode="playMode"
          :is-saving="isSaving"
          :is-autosaving="isAutosaving"
          @file-upload="handleFileUpload"
          @export="exportPresentation"
          @change-zoom="changeZoom"
          @fit-screen="fitToScreen"
          @toggle-play="togglePlayMode"
          @save="savePresentation"
          @publish-as-template="publishAsTemplate"
        />
  <div v-if="isLoadingProject" class="loading-overlay">
          <div class="spinner"></div>
          <h2>Descargando Proyecto...</h2>
          <p>Cargando elementos y recursos de la nube.</p>
        </div>
        <div v-if="isConverting" class="loading-overlay">
          <div class="spinner"></div>
          <h2>Procesando Documento</h2>
          <p>Por favor, espera mientras optimizamos los gráficos.</p>
        </div>

        <div v-if="playMode" class="play-nav-overlay" :class="{ 'is-idle': !showPlayNav }" @mouseenter="wakeUpPlayNav">
          <button
            @click="changePageTo(pageNum - 1)"
            :disabled="pageNum <= 1"
            title="Anterior (Flecha Izquierda)"

          >
            <i class="ph ph-caret-left"></i>
          </button>
          <span
            >{{ pageNum }} <span class="text-muted">/ {{ numPages }}</span></span
          >
          <button
            @click="changePageTo(pageNum + 1)"
            :disabled="pageNum >= numPages"
            title="Siguiente (Flecha Derecha)"
          >
            <i class="ph ph-caret-right"></i>
          </button>
        </div>

        <div class="pro-workspace">
          <aside class="pro-sidebar left-sidebar" v-show="isLeftSidebarOpen" v-if="hasDoc && !playMode" :style="{ width: leftSidebarWidth + 'px' }" @click.stop>
            <div class="sidebar-cta">
              <button class="btn-primary w-100" @click="showTemplateModal = true">
                <i class="ph ph-layout"></i> Explorar Plantillas
              </button>
            </div>

            <div class="panel-header">
              <span>Diapositivas</span>
              <span class="badge">{{ numPages }}</span>
            </div>
            <div class="slides-preview-list">
              <div
                 v-for="page in numPages"
  :key="page"
  class="thumb-item"
  :class="{ 'is-active': pageNum === page, 'thumb-dragging': thumbDragSource === page, 'thumb-drag-over': thumbDragTarget === page }"
  @click="changePageTo(page)"
  draggable="true"
  @dragstart.stop="onThumbDragStart($event, page)"
  @dragover.stop.prevent="onThumbDragOver($event, page)"
  @dragleave.stop="onThumbDragLeave"
  @drop.stop="onThumbDrop($event, page)"
  @dragend.stop="onThumbDragEnd"
              >
                 <div class="thumb-num" @click.stop>
    <span
      v-if="!isTemplateCreatorMode && thumbEditingPage !== page"
      class="thumb-pos-btn"
      @click.stop="startEditThumbPos(page)"
      :title="'Mover a posición... (clic)'"
    >{{ page }}</span>
    <span
      v-else-if="isTemplateCreatorMode"
      class="thumb-pos-btn"
      style="width: auto; padding: 0 5px; font-size: 0.7rem;"
    >{{ page === 1 ? 'Portada' : page === 2 ? 'Base' : 'Cierre' }}</span>
    <input
      v-else
      class="thumb-pos-input"
      type="number"
      :min="1"
      :max="numPages"
      :value="page"
      ref="thumbPosInputRef"
      @keydown.enter.stop="commitThumbMove(page, $event)"
      @keydown.escape.stop="thumbEditingPage = null"
      @blur.stop="commitThumbMove(page, $event)"
      @click.stop
    />
  </div>
    <div class="thumb-card-wrapper">
    <div
      class="thumb-card"
      :style="{
        backgroundColor: slideConfigs[page]?.bgColor || '#ffffff',
        backgroundImage: generatedThumbnails[page]
          ? `url(${generatedThumbnails[page]})`
          : slideConfigs[page]?.bgImage
            ? `url(${slideConfigs[page].bgImage})`
            : pdfPageMap[page] && pdfThumbnails[pdfPageMap[page]]
              ? `url(${pdfThumbnails[pdfPageMap[page]]})`
              : 'none',
      }"
    >
      <div class="thumb-actions" v-if="!isTemplateCreatorMode">
        <button class="thumb-action-btn" @click.stop="duplicateSlide(page)" title="Duplicar">
          <i class="ph ph-copy"></i>
        </button>
        <button
          class="thumb-action-btn btn-trash"
          @click.stop="deleteSlide(page)"
          :disabled="numPages <= 1"
          title="Eliminar"
        >
          <i class="ph ph-trash"></i>
        </button>
      </div>
    </div>

                  <div
                    class="thumb-elements"
                    v-if="pageNum === page && currentPageElements.length > 0"
                  >
                    <div
                      v-for="(el, index) in [...currentPageElements].reverse()"
                      :key="el.id"
                      class="tree-child"
                      :class="{
                        'is-selected': selectedElementIds.includes(el.id),
                        'drag-over': dragTargetIndex === currentPageElements.length - 1 - index,
                      }"
                      @click.stop="selectElement(el.id, $event)"
                      draggable="true"
                      @dragstart="onDragStartLayer($event, currentPageElements.length - 1 - index)"
                      @dragover.prevent="
                        onDragOverLayer($event, currentPageElements.length - 1 - index)
                      "
                      @dragleave="onDragLeaveLayer"
                      @drop="onDropLayer($event, currentPageElements.length - 1 - index)"
                    >
                      <span class="drag-handle"><i class="ph ph-dots-six-vertical"></i></span>
                      <span class="icon"><i :class="`ph ${getIconClassForType(el.type)}`"></i></span>
                      <span class="child-name">{{ el.name || el.type }}</span>

                      <div class="layer-actions">
                        <button
                          class="layer-action-btn"
                          @click.stop="el.isLocked = !el.isLocked"
                          :class="{ 'is-active': el.isLocked }"
                          :title="el.isLocked ? 'Desbloquear' : 'Bloquear'"
                        >
                          <i class="ph" :class="el.isLocked ? 'ph-lock-key' : 'ph-lock-key-open'"></i>
                        </button>
                        <button
                          class="layer-action-btn"
                          @click.stop="el.isHidden = !el.isHidden"
                          :class="{ 'is-active': el.isHidden }"
                          :title="el.isHidden ? 'Mostrar' : 'Ocultar'"
                        >
                          <i class="ph" :class="el.isHidden ? 'ph-eye-slash' : 'ph-eye'"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="sidebar-footer" v-if="!isTemplateCreatorMode">
              <button class="btn-ghost w-100" @click="addNewSlide">
                <i class="ph ph-plus"></i> Nueva Diapositiva
              </button>
            </div>
          </aside>

          <!-- Resizer Izquierdo -->
          <div class="sidebar-resizer" v-if="hasDoc && !playMode && isLeftSidebarOpen" @mousedown.prevent.stop="startResizeSidebar($event, 'left')"></div>

          <div class="center-workspace" v-if="hasDoc">
            <div class="pro-top-toolbar" v-if="!playMode" @click.stop>
              <div class="toolbar-category">
                <span class="category-label">Básicos</span>
                <div class="category-tools">
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'select' }"
                    @click="activeTool = 'select'"
                    title="Seleccionar (V)"
                  >
                    <i class="ph ph-cursor"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'text' }"
                    @click="activeTool = 'text'"
                    title="Texto Libre"
                  >
                    <i class="ph ph-text-t"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'list' }"
                    @click="activeTool = 'list'"
                    title="Lista de Texto"
                  >
                    <i class="ph ph-list-bullets"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'checkbox' }"
                    @click="activeTool = 'checkbox'"
                    title="Lista de Tareas"
                  >
                    <i class="ph ph-check-square"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'sticky' }"
                    @click="activeTool = 'sticky'"
                    title="Nota Adhesiva"
                  >
                    <i class="ph ph-note"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'shape' }"
                    @click="activeTool = 'shape'"
                    title="Forma"
                  >
                    <i class="ph ph-square"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'arrow' }"
                    @click="activeTool = 'arrow'"
                    title="Flecha / Línea"
                  >
                    <i class="ph ph-arrow-right"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'icon' }"
                    @click="activeTool = 'icon'"
                    title="Icono Vectorial"
                  >
                    <i class="ph ph-star"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'draw' }"
                    @click="activeTool = 'draw'"
                    title="Dibujo Libre"
                  >
                    <i class="ph ph-pencil-simple"></i>
                  </button>
                </div>
              </div>

              <div class="toolbar-category">
                <span class="category-label">Datos & Mapas</span>
                <div class="category-tools">
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'mindmap' }"
                    @click="activeTool = 'mindmap'"
                    title="Mapa Mental"
                  >
                    <i class="ph ph-tree-structure"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'map' }"
                    @click="activeTool = 'map'"
                    title="Mapa"
                  >
                    <i class="ph ph-map-trifold"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'calendar' }"
                    @click="activeTool = 'calendar'"
                    title="Calendario"
                  >
                    <i class="ph ph-calendar-blank"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'finance' }"
                    @click="activeTool = 'finance'"
                    title="Gráfico Financiero"
                  >
                    <i class="ph ph-trend-up"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'table' }"
                    @click="activeTool = 'table'"
                    title="Tabla de Datos"
                  >
                    <i class="ph ph-table"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'chart' }"
                    @click="activeTool = 'chart'"
                    title="Gráfico"
                  >
                    <i class="ph ph-chart-bar"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'poll' }"
                    @click="activeTool = 'poll'"
                    title="Encuesta"
                  >
                    <i class="ph ph-chart-pie-slice"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'rating' }"
                    @click="activeTool = 'rating'"
                    title="Estrellas"
                  >
                    <i class="ph ph-star-half"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'qrcode' }"
                    @click="activeTool = 'qrcode'"
                    title="Código QR"
                  >
                    <i class="ph ph-qr-code"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'progress' }"
                    @click="activeTool = 'progress'"
                    title="Progreso"
                  >
                    <i class="ph ph-sliders-horizontal"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'timer' }"
                    @click="activeTool = 'timer'"
                    title="Temporizador"
                  >
                    <i class="ph ph-timer"></i>
                  </button>
                </div>
              </div>

              <div class="toolbar-category">
                <span class="category-label">Multimedia</span>
                <div class="category-tools">
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'image' }"
                    @click="activeTool = 'image'"
                    title="Imagen"
                  >
                    <i class="ph ph-image"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'video' }"
                    @click="activeTool = 'video'"
                    title="Vídeo"
                  >
                    <i class="ph ph-video-camera"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'audio' }"
                    @click="activeTool = 'audio'"
                    title="Audio"
                  >
                    <i class="ph ph-speaker-high"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'magnifier' }"
                    @click="activeTool = 'magnifier'"
                    title="Lupa Mágica"
                  >
                    <i class="ph ph-magnifying-glass"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === '3d' }"
                    @click="activeTool = '3d'"
                    title="Modelo 3D"
                  >
                    <i class="ph ph-cube"></i>
                  </button>
                </div>
              </div>

              <div class="toolbar-category">
                <span class="category-label">Interactividad</span>
                <div class="category-tools">
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'codeblock' }"
                    @click="activeTool = 'codeblock'"
                    title="Código"
                  >
                    <i class="ph ph-code"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'iframe' }"
                    @click="activeTool = 'iframe'"
                    title="Web"
                  >
                    <i class="ph ph-globe"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'interactive' }"
                    @click="activeTool = 'interactive'"
                    title="Hotspot"
                  >
                    <i class="ph ph-lightning"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'link' }"
                    @click="activeTool = 'link'"
                    title="Enlace"
                  >
                    <i class="ph ph-link"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'accordion' }"
                    @click="activeTool = 'accordion'"
                    title="Acordeón"
                  >
                    <i class="ph ph-list-dashes"></i>
                  </button>
                </div>
              </div>

              <div class="toolbar-category">
                <span class="category-label">Efectos Visuales</span>
                <div class="category-tools">
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'imagecomparator' }"
                    @click="activeTool = 'imagecomparator'"
                    title="Comparador de Imágenes"
                  >
                    <i class="ph ph-swap"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'marquee' }"
                    @click="activeTool = 'marquee'"
                    title="Marquesina"
                  >
                    <i class="ph ph-text-aa"></i>
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: activeTool === 'typewriter' }"
                    @click="activeTool = 'typewriter'"
                    title="Máquina de Escribir"
                  >
                    <i class="ph ph-keyboard"></i>
                  </button>
                </div>
              </div>
            </div>

            <button v-if="hasDoc && !playMode" class="sidebar-toggle-btn toggle-left" @click="isLeftSidebarOpen = !isLeftSidebarOpen" :title="isLeftSidebarOpen ? 'Ocultar Diapositivas' : 'Mostrar Diapositivas'">
              <i class="ph" :class="isLeftSidebarOpen ? 'ph-caret-left' : 'ph-caret-right'"></i>
            </button>

            <button v-if="hasDoc && !playMode" class="sidebar-toggle-btn toggle-right" @click="isRightSidebarOpen = !isRightSidebarOpen" :title="isRightSidebarOpen ? 'Ocultar Inspector' : 'Mostrar Inspector'">
              <i class="ph" :class="isRightSidebarOpen ? 'ph-caret-right' : 'ph-caret-left'"></i>
            </button>

            <main
              class="pro-canvas-area"
              ref="workspaceRef"
              @wheel="handleCanvasWheel"
              @mousedown="handleCanvasPanStart"
              @click="handleCanvasClickOutside"
              :style="themeVariables"
              :class="{ 'is-panning': isPanning, 'space-pressed': isSpacePressed, 'is-picking-target': isSelectingTargetForEvent }"
            >
              <div
                class="canvas-wrapper"
                :class="{ 'play-mode-active': playMode }"
                :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})` }"
              >
                <Transition :name="playMode && activeTransition !== 'none' ? 'slide-trans-' + activeTransition : ''" mode="out-in">
                  <div
                  class="canvas-shadow-box layer-engine"
                  :key="pageNum"
                  :style="{
                    width: `${baseWidth}px`,
                    height: `${baseHeight}px`,
                    backgroundColor: currentBgColor,
                    backgroundImage: currentBgImage,
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }"
                  @click="handleCanvasClick"
                >
                <div
                    v-for="(guide, idx) in activeGuides"
                    :key="'guide'+idx"
                    class="snap-guide"
                    :class="guide.type"
                    :style="guide.type === 'vertical' ? { left: guide.pos + 'px' } : { top: guide.pos + 'px' }"
                  ></div>

                  <!-- Rectángulo de selección múltiple -->
                  <div
                    v-if="isMarqueeSelecting"
                    class="marquee-selection"
                    :style="{
                      left: marqueeRect.x + 'px',
                      top: marqueeRect.y + 'px',
                      width: marqueeRect.width + 'px',
                      height: marqueeRect.height + 'px'
                    }"
                  ></div>

                  <Suspense v-if="docType === 'pdf'">
                    <template #default>
                      <PdfViewer
                        v-if="_PDF_BASE64_STORE"
                        :pdfBase64="_PDF_BASE64_STORE"
                        :pageNum="pageNum"
                        @document-loaded="(doc) => { _RAW_PDF_DOC = doc; numPages = doc.numPages; }"
                      />
                    </template>
                    <template #fallback>
                      <div class="pdf-loading-fallback" style="padding: 20px; text-align: center; color: #888;">
                        <i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite; font-size: 2rem;"></i>
                        <p>Cargando Visor de PDF...</p>
                      </div>
                    </template>
                  </Suspense>

                  <div
                    v-if="
                      docType === 'pptx' &&
                      !playMode &&
                      currentBgImage === 'none' &&
                      currentBgColor === '#ffffff'
                    "
                    class="pptx-placeholder"
                  >
                    <i
                      class="ph ph-warning-circle"
                      style="font-size: 3rem; margin-bottom: 10px; color: #8b949e"
                    ></i>
                    <p>Estructura base cargada ({{ baseWidth }}x{{ baseHeight }})</p>
                    <small
                      >No se detectó imagen de fondo en esta diapositiva. Usa el Inspector para
                      asignar una.</small
                    >
                  </div>

                  <div
                    v-for="(el, index) in currentPageElements"
                    :key="el.id + (playMode ? renderTrigger : '')"
                    v-show="(!el.isHidden || !playMode) && (!playMode || isInsideCanvas(el))"
                    class="interactive-element"
                    :class="[
                      {
                        'is-outside-canvas': !playMode && !isInsideCanvas(el),
                        'is-selected': selectedElementIds.includes(el.id) && !playMode,
                        'is-editing': editingElementId === el.id, /* <--- NUEVA LÍNEA */
                        'is-clickable':
                          playMode &&
                          ['link', 'interactive', 'audio', 'checkbox', 'rating'].includes(el.type),
                        'no-pointer': playMode && (el.type === 'draw' || el.type === 'mindmap'),
                        'is-hidden-editor': el.isHidden && !playMode,
                        'is-waiting-animation': playMode && (el.animationType || el.animation) && (el.animationType || el.animation) !== 'none' && !el.isHidden && (el.animationOrder || 0) > currentAnimationStep,
                      },
                      playMode && (el.animationType || el.animation) && (el.animationType || el.animation) !== 'none' && !el.isHidden && (el.animationOrder || 0) <= currentAnimationStep ? 'anim-' + (el.animationType || el.animation) : ''
                    ]"
                    :style="{
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width}px`,
                      height: el.height === 'auto' ? 'auto' : `${el.height}px`,
                      zIndex: index + 10,
                      opacity: el.opacity ?? 1,
                      transform: `rotate(${el.rotation || 0}deg)`,
                      animationDelay: playMode && (el.animationTrigger === 'withPrevious' || el.animationTrigger === 'afterPrevious') ? `${index * 0.05}s` : '0s',
                      mixBlendMode: el.mixBlendMode || 'normal',
                    }"
                    @mousedown.stop="startDrag($event, el)"
                    @click.stop="playMode ? executeEvents(el, 'click') : null"
                    @mouseenter="playMode ? executeEvents(el, 'hover') : null"
                  >
                    <div
                      v-if="el.type === 'text' || el.type === 'sticky'"
                      class="el-text"
                      :contenteditable="editingElementId === el.id"
                      @dblclick.stop="enableTextEdit($event, el)"
                      @blur="onTextBlur($event, el)"
                      :style="{
                        color: el.color,
                        fontSize: el.fontSize + 'px',
                        fontWeight: el.fontWeight,
                        fontFamily: el.fontFamily,
                        fontStyle: el.fontStyle,
                        textAlign: el.textAlign,
                        textTransform: el.textTransform || 'none',
                        textDecoration: el.textDecoration || 'none',
                        lineHeight: el.lineHeight || 1.2,
                        letterSpacing: (el.letterSpacing || 0) + 'px',
                        textShadow: el.textShadow || 'none',
                        backgroundColor: el.textBgColor || 'transparent',
                        padding: el.textBgColor !== 'transparent' ? '15px' : '0',
                        borderRadius: el.type === 'sticky' ? '0 0 16px 4px' : '4px',
                        boxShadow: el.boxShadow || 'none',
                      }"
                    >
                      {{ el.content }}
                    </div>

                    <div
                      v-else-if="el.type === 'mindmap'"
                      class="el-mindmap-container"
                      :style="{
                        fontFamily: el.fontFamily,
                        '--mm-line-color': el.lineColor,
                        '--mm-line-width': el.lineWidth + 'px',
                      }"
                    >
                      <div class="mm-wrapper">
                        <div
                          class="mm-level-0"
                          v-for="n0 in getNodesByParent(el.nodes, null)"
                          :key="n0.id"
                        >
                          <div
                            class="mm-node-block"
                            @click.stop="activeMapNodeId = n0.id; selectElement(el.id)"
                            :style="getNodeStyle(n0, activeMapNodeId === n0.id && !playMode)"
                          >
                            <img
                              v-if="n0.image"
                              :src="n0.image"
                              class="mm-node-img"
                              draggable="false"
                            />
                            <div class="mm-node-text">{{ n0.text }}</div>
                            <div v-if="n0.note" class="mm-node-note">{{ n0.note }}</div>
                            <div
                              v-if="getNodesByParent(el.nodes, n0.id).length > 0"
                              class="mm-connector-right"
                            ></div>
                          </div>

                          <div class="mm-children" v-if="getNodesByParent(el.nodes, n0.id).length">
                            <div
                              class="mm-child-wrapper"
                              v-for="n1 in getNodesByParent(el.nodes, n0.id)"
                              :key="n1.id"
                            >
                              <div
                                class="mm-node-block"
                                @click.stop="activeMapNodeId = n1.id; selectElement(el.id)"
                                :style="getNodeStyle(n1, activeMapNodeId === n1.id && !playMode)"
                              >
                                <img
                                  v-if="n1.image"
                                  :src="n1.image"
                                  class="mm-node-img"
                                  draggable="false"
                                />
                                <div class="mm-node-text">{{ n1.text }}</div>
                                <div v-if="n1.note" class="mm-node-note">{{ n1.note }}</div>
                                <div
                                  v-if="getNodesByParent(el.nodes, n1.id).length > 0"
                                  class="mm-connector-right"
                                ></div>
                              </div>

                              <div
                                class="mm-children"
                                v-if="getNodesByParent(el.nodes, n1.id).length"
                              >
                                <div
                                  class="mm-child-wrapper"
                                  v-for="n2 in getNodesByParent(el.nodes, n1.id)"
                                  :key="n2.id"
                                >
                                  <div
                                    class="mm-node-block"
                                    @click.stop="activeMapNodeId = n2.id; selectElement(el.id)"
                                    :style="getNodeStyle(n2, activeMapNodeId === n2.id && !playMode)"
                                  >
                                    <img
                                      v-if="n2.image"
                                      :src="n2.image"
                                      class="mm-node-img"
                                      draggable="false"
                                    />
                                    <div class="mm-node-text">{{ n2.text }}</div>
                                    <div v-if="n2.note" class="mm-node-note">{{ n2.note }}</div>
                                    <div
                                      v-if="getNodesByParent(el.nodes, n2.id).length > 0"
                                      class="mm-connector-right"
                                    ></div>
                                  </div>

                                  <div
                                    class="mm-children"
                                    v-if="getNodesByParent(el.nodes, n2.id).length"
                                  >
                                    <div
                                      class="mm-child-wrapper"
                                      v-for="n3 in getNodesByParent(el.nodes, n2.id)"
                                      :key="n3.id"
                                    >
                                      <div
                                        class="mm-node-block"
                                          @click.stop="activeMapNodeId = n3.id; selectElement(el.id)"
                                        :style="
                                          getNodeStyle(n3, activeMapNodeId === n3.id && !playMode)
                                        "
                                      >
                                        <img
                                          v-if="n3.image"
                                          :src="n3.image"
                                          class="mm-node-img"
                                          draggable="false"
                                        />
                                        <div class="mm-node-text">{{ n3.text }}</div>
                                        <div v-if="n3.note" class="mm-node-note">{{ n3.note }}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      v-else-if="el.type === 'list'"
                      class="el-list"
                      :style="{
                        color: el.color,
                        fontSize: el.fontSize + 'px',
                        fontWeight: el.fontWeight,
                        fontFamily: el.fontFamily,
                        lineHeight: el.lineHeight || 1.4,
                      }"
                    >
                      <component
                        :is="el.listType"
                        :style="{ listStyleType: el.bulletStyle, margin: 0, paddingLeft: '24px' }"
                      >
                        <li
                          v-for="(item, idx) in el.items"
                          :key="idx"
                          :style="{ marginBottom: el.itemSpacing + 'px' }"
                        >
                          {{ item }}
                        </li>
                      </component>
                    </div>

                    <div
                      v-else-if="el.type === 'checkbox'"
                      class="el-checkbox-list"
                      :style="{
                        color: el.color,
                        fontSize: el.fontSize + 'px',
                        fontWeight: el.fontWeight,
                        fontFamily: el.fontFamily,
                        lineHeight: el.lineHeight || 1.4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: el.itemSpacing + 'px',
                      }"
                    >
                      <div
                        v-for="(item, idx) in el.items"
                        :key="idx"
                        style="
                          display: flex;
                          align-items: flex-start;
                          gap: 10px;
                          cursor: pointer;
                          transition: opacity 0.2s;
                        "
                        :style="{ opacity: item.checked ? 0.6 : 1 }"
                        @click.stop="playMode ? (executeEvents(el, 'click', idx), item.checked = !item.checked) : null"
                      >
                        <i
                          class="ph"
                          :class="item.checked ? 'ph-check-square' : 'ph-square'"
                          :style="{
                            color: item.checked ? el.checkedColor : el.color,
                            fontSize: el.fontSize * 1.2 + 'px',
                            marginTop: '2px',
                          }"
                        ></i>
                        <span
                          :style="{
                            textDecoration:
                              item.checked && el.strikeThrough ? 'line-through' : 'none',
                          }"
                          >{{ item.text }}</span
                        >
                      </div>
                    </div>

                    <div
                      v-else-if="el.type === 'table'"
                      class="el-table-wrapper"
                      :style="{
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        borderRadius: el.borderRadius + 'px',
                        backgroundColor: el.rowBgColor1,
                      }"
                    >
                      <table
                        :style="{
                          width: '100%',
                          height: '100%',
                          borderCollapse: 'collapse',
                          color: el.color,
                          fontSize: el.fontSize + 'px',
                          fontFamily: el.fontFamily,
                        }"
                      >
                        <thead>
                          <tr>
                            <th
                              v-for="(col, cIdx) in el.headers"
                              :key="'th' + cIdx"
                              :style="{
                                border: el.borderWidth + 'px solid ' + el.borderColor,
                                backgroundColor: el.headerBgColor,
                                padding: '10px',
                                textAlign: el.textAlign,
                              }"
                            >
                              {{ col }}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(row, rIdx) in el.rows"
                            :key="'tr' + rIdx"
                            :style="{
                              backgroundColor: rIdx % 2 === 0 ? el.rowBgColor1 : el.rowBgColor2,
                            }"
                          >
                            <td
                              v-for="(cell, cIdx) in row"
                              :key="'td' + cIdx"
                              :style="{
                                border: el.borderWidth + 'px solid ' + el.borderColor,
                                padding: '10px',
                                textAlign: el.textAlign,
                              }"
                            >
                              {{ cell }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div
                      v-else-if="el.type === 'shape'"
                      class="el-shape"
                      :style="{
                        background: el.isGlass
                          ? 'rgba(255,255,255,0.2)'
                          : el.gradientType && el.gradientType !== 'none'
                            ? el.gradientType === 'linear'
                              ? 'linear-gradient(135deg, ' +
                                el.bgColor +
                                ', ' +
                                el.gradientColor +
                                ')'
                              : 'radial-gradient(circle, ' +
                                el.bgColor +
                                ', ' +
                                el.gradientColor +
                                ')'
                            : el.bgColor,
                        borderRadius: el.borderRadius + 'px',
                        border:
                          el.borderWidth + 'px ' + (el.borderStyle || 'solid') + ' ' + el.borderColor,
                        boxShadow: el.boxShadow || 'none',
                        backdropFilter: el.isGlass ? 'blur(10px)' : 'none',
                        WebkitBackdropFilter: el.isGlass ? 'blur(10px)' : 'none',
                      }"
                    ></div>

                    <div
                      v-else-if="el.type === 'arrow'"
                      style="
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        position: relative;
                      "
                    >
                      <div
                        v-if="['start', 'both'].includes(el.arrowHead)"
                        :style="{
                          width: 0,
                          height: 0,
                          borderTop: el.strokeWidth * 1.5 + 'px solid transparent',
                          borderBottom: el.strokeWidth * 1.5 + 'px solid transparent',
                          borderRight: el.strokeWidth * 2 + 'px solid ' + el.color,
                        }"
                      ></div>
                      <div
                        :style="{ flex: 1, height: el.strokeWidth + 'px', backgroundColor: el.color }"
                      ></div>
                      <div
                        v-if="['end', 'both'].includes(el.arrowHead)"
                        :style="{
                          width: 0,
                          height: 0,
                          borderTop: el.strokeWidth * 1.5 + 'px solid transparent',
                          borderBottom: el.strokeWidth * 1.5 + 'px solid transparent',
                          borderLeft: el.strokeWidth * 2 + 'px solid ' + el.color,
                        }"
                      ></div>
                    </div>

                    <div
                      v-else-if="el.type === 'icon'"
                      class="el-icon"
                      :style="{
                        color: el.color,
                        fontSize: el.fontSize + 'px',
                        backgroundColor: el.bgColor || 'transparent',
                        borderRadius: (el.borderRadius || 0) + 'px',
                      }"
                    >
                      <i
                        :class="`ph ph-${el.iconName}`"
                        :style="{
                          filter: el.textShadow ? 'drop-shadow(' + el.textShadow + ')' : 'none',
                        }"
                      ></i>
                    </div>

                    <div
                      v-else-if="el.type === 'draw'"
                      class="el-draw-board"
                      :style="{ border: playMode ? 'none' : '1px dashed #58a6ff' }"
                    >
                      <div
                        v-if="!playMode"
                        class="draw-drag-handle"
                        @mousedown.stop="startDrag($event, el, true)"
                      >
                        <i class="ph ph-arrows-out-cardinal"></i>
                      </div>
                      <svg
                        style="
                          width: 100%;
                          height: 100%;
                          display: block;
                          cursor: crosshair;
                          touch-action: none;
                        "
                        @mousedown.stop="startSvgDraw($event, el)"
                        @mousemove.stop="doSvgDraw($event, el)"
                        @mouseup="stopSvgDraw"
                        @mouseleave="stopSvgDraw"
                      >
                        <polyline
                          v-for="(line, idx) in el.lines"
                          :key="idx"
                          :points="line.points.map((p) => `${p.x},${p.y}`).join(' ')"
                          :stroke="line.color"
                          :stroke-width="line.size"
                          fill="none"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>

                    <div
                      v-else-if="el.type === 'codeblock'"
                      class="el-codeblock"
                      :style="{
                        backgroundColor: el.theme === 'dark' ? '#1e293b' : '#f8fafc',
                        color: el.theme === 'dark' ? '#e2e8f0' : '#334155',
                        borderRadius: el.borderRadius + 'px',
                        padding: '20px 15px 15px',
                        width: '100%',
                        height: '100%',
                        overflow: 'auto',
                        border: '1px solid ' + (el.theme === 'dark' ? '#334155' : '#e2e8f0'),
                        boxSizing: 'border-box',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                      }"
                    >
                      <div
                        :style="{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          padding: '2px 8px',
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          fontFamily: 'sans-serif',
                          backgroundColor: el.theme === 'dark' ? '#334155' : '#e2e8f0',
                          color: el.theme === 'dark' ? '#94a3b8' : '#64748b',
                          borderBottomLeftRadius: '6px',
                        }"
                      >
                        {{ el.language }}
                      </div>
                      <pre
                        style="margin: 0; white-space: pre-wrap; font-family: monospace"
                        :style="{ fontSize: el.fontSize + 'px' }"
                        >{{ el.content }}</pre
                      >
                    </div>

                    <div
                      v-else-if="el.type === 'chart'"
                      class="el-chart-wrapper"
                      :style="{
                        backgroundColor: el.bgColor,
                        borderRadius: (el.borderRadius || 8) + 'px',
                        border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'),
                        padding: '15px',
                        boxShadow: el.boxShadow || '0 4px 6px rgba(0,0,0,0.05)',
                      }"
                    >
                      <div
                        class="chart-title"
                        :style="{
                          color: el.color,
                          fontSize: (el.fontSize || 14) + 'px',
                          textAlign: el.textAlign || 'center',
                        }"
                      >
                        {{ el.chartTitle }}
                      </div>
                      <div class="chart-inner-area">
                        <div v-if="el.chartType === 'bar'" class="chart-bar-container">
                          <div v-for="(item, i) in el.chartData" :key="i" class="bar-col">
                            <span
                              v-if="el.showValues"
                              class="chart-value"
                              :style="{ color: el.color }"
                              >{{ item.value }}</span
                            >
                            <div
                              class="bar-fill"
                              :style="{
                                height:
                                  Math.min(100, (item.value / getChartMax(el.chartData)) * 100) + '%',
                                backgroundColor: item.color,
                              }"
                            ></div>
                            <span
                              v-if="el.showLegend"
                              class="chart-label"
                              :style="{ color: el.color }"
                              >{{ item.label }}</span
                            >
                          </div>
                        </div>
                        <div v-if="el.chartType === 'hbar'" class="chart-hbar-container">
                          <div v-for="(item, i) in el.chartData" :key="i" class="hbar-row">
                            <span
                              v-if="el.showLegend"
                              class="chart-label hbar-lbl"
                              :style="{ color: el.color }"
                              >{{ item.label }}</span
                            >
                            <div class="hbar-track">
                              <div
                                class="hbar-fill"
                                :style="{
                                  width:
                                    Math.min(100, (item.value / getChartMax(el.chartData)) * 100) +
                                    '%',
                                  backgroundColor: item.color,
                                }"
                              ></div>
                            </div>
                            <span
                              v-if="el.showValues"
                              class="chart-value hbar-val"
                              :style="{ color: el.color }"
                              >{{ item.value }}</span
                            >
                          </div>
                        </div>
                        <div
                          v-if="el.chartType === 'pie' || el.chartType === 'donut'"
                          class="chart-pie-container"
                        >
                          <div
                            class="pie-circle"
                            :style="{ background: getPieGradient(el.chartData) }"
                          >
                            <div
                              v-if="el.chartType === 'donut'"
                              class="donut-hole"
                              :style="{ backgroundColor: el.bgColor }"
                            ></div>
                          </div>
                          <div v-if="el.showLegend" class="pie-legend">
                            <div
                              v-for="(item, i) in el.chartData"
                              :key="'l' + i"
                              class="pie-legend-item"
                            >
                              <span class="legend-dot" :style="{ backgroundColor: item.color }"></span
                              ><span :style="{ color: el.color }"
                                >{{ item.label }}
                                <span v-if="el.showValues">({{ item.value }})</span></span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      v-else-if="el.type === 'poll'"
                      class="el-poll-wrapper"
                      :style="{
                        backgroundColor: el.bgColor,
                        color: el.color,
                        borderRadius: el.borderRadius + 'px',
                        padding: '15px',
                        width: '100%',
                        height: '100%',
                        boxSizing: 'border-box',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                      }"
                    >
                      <h4 style="margin: 0 0 15px 0; text-align: center">{{ el.chartTitle }}</h4>
                      <div v-for="(item, i) in el.chartData" :key="i" style="margin-bottom: 12px">
                        <div
                          style="
                            display: flex;
                            justify-content: space-between;
                            font-size: 13px;
                            font-weight: 600;
                            margin-bottom: 6px;
                          "
                        >
                          <span>{{ item.label }}</span>
                          <span
                            >{{ Math.round((item.value / getChartMax(el.chartData)) * 100) }}%</span
                          >
                        </div>
                        <div
                          style="
                            width: 100%;
                            height: 10px;
                            background: rgba(0, 0, 0, 0.08);
                            border-radius: 5px;
                            overflow: hidden;
                          "
                        >
                          <div
                            :style="{
                              width:
                                Math.min(100, (item.value / getChartMax(el.chartData)) * 100) + '%',
                              backgroundColor: item.color,
                              height: '100%',
                              transition: 'width 1.5s cubic-bezier(0.25, 1, 0.5, 1)',
                            }"
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div
                      v-else-if="el.type === 'qrcode'"
                      style="
                        width: 100%;
                        height: 100%;
                        padding: 10px;
                        box-sizing: border-box;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                      "
                      :style="{
                        backgroundColor: el.bgColor,
                        borderRadius: (el.borderRadius || 0) + 'px',
                      }"
                    >
                      <img
                        :src="
                          'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=' +
                          encodeURIComponent(el.qrUrl || 'https://google.com') +
                          '&color=' +
                          el.color.replace('#', '') +
                          '&bgcolor=' +
                          el.bgColor.replace('#', '')
                        "
                        style="
                          width: 100%;
                          height: 100%;
                          object-fit: contain;
                          mix-blend-mode: multiply;
                        "
                        draggable="false"
                      />
                    </div>

                    <div
                      v-else-if="el.type === 'progress'"
                      style="width: 100%; height: 100%; overflow: hidden"
                      :style="{ backgroundColor: el.bgColor, borderRadius: el.borderRadius + 'px' }"
                    >
                      <div
                        :style="{
                          width: (el.progress || 0) + '%',
                          backgroundColor: el.color,
                          height: '100%',
                          transition: 'width 0.5s ease',
                        }"
                      ></div>
                    </div>

                    <div
                      v-else-if="el.type === 'rating'"
                      class="el-rating"
                      style="
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 6px;
                      "
                      :style="{ color: el.color, fontSize: el.fontSize + 'px' }"
                    >
                      <span
                        v-for="s in el.maxStars"
                        :key="s"
                        @click.stop="playMode && el.isInteractive ? (executeEvents(el, 'click'), el.rating = s) : null"
                        :style="{
                          cursor: playMode && el.isInteractive ? 'pointer' : 'default',
                          opacity: s <= el.rating ? 1 : 0.25,
                          transition: '0.2s',
                        }"
                        >★</span
                      >
                    </div>

                    <div
                      v-else-if="el.type === 'imagecomparator'"
                      style="width: 100%; height: 100%; position: relative; overflow: hidden;"
                      :style="{ borderRadius: (el.borderRadius || 0) + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), boxShadow: el.boxShadow || 'none' }"
                    >
                      <img v-if="el.imageAfter && el.imageAfter.trim() !== ''" :src="el.imageAfter" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                      <div v-else style="width: 100%; height: 100%; background: rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: #999;">
                        <i class="ph ph-image" style="font-size: 2rem;"></i>
                      </div>
                      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden;">
                        <img v-if="el.imageBefore && el.imageBefore.trim() !== ''" :src="el.imageBefore" style="width: 100%; height: 100%; object-fit: cover; display: block;" :style="{ clipPath: 'inset(0 ' + (100 - (el.sliderPosition ?? 50)) + '% 0 0)' }" />
                      </div>
                      <div
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: ew-resize; z-index: 10;"
                        @mousedown.stop.prevent="startComparatorDrag($event, el)"
                      ></div>
                      <div
                        style="position: absolute; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.95); box-shadow: 0 0 0 1px rgba(0,0,0,0.2), 0 0 8px rgba(0,0,0,0.25); pointer-events: none; z-index: 11;"
                        :style="{ left: (el.sliderPosition ?? 50) + '%' }"
                      ></div>
                      <div v-if="!playMode" class="drag-protector"></div>
                    </div>

                    <div
                      v-else-if="el.type === 'marquee'"
                      style="width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; position: relative;"
                      :style="{ backgroundColor: el.bgColor, borderRadius: (el.borderRadius || 0) + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), boxShadow: el.boxShadow || 'none' }"
                    >
                      <div
                        class="marquee-track"
                        :style="{ color: el.color, fontSize: el.fontSize + 'px', fontWeight: el.fontWeight, fontFamily: el.fontFamily, animationDuration: (Math.max(5, 30 - (el.speed / 3))) + 's' }"
                      >
                        <span class="marquee-content">{{ el.content }}</span>
                        <span class="marquee-content">{{ el.content }}</span>
                        <span class="marquee-content">{{ el.content }}</span>
                        <span class="marquee-content">{{ el.content }}</span>
                      </div>
                    </div>

                    <div
                      v-else-if="el.type === 'typewriter'"
                      style="width: 100%; height: 100%; display: flex; align-items: center; padding: 0 10px; box-sizing: border-box;"
                      :style="{ backgroundColor: el.bgColor, color: el.color, fontSize: el.fontSize + 'px', fontWeight: el.fontWeight, fontFamily: el.fontFamily, borderRadius: (el.borderRadius || 0) + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), boxShadow: el.boxShadow || 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }"
                    >
                      {{ playMode ? el.displayedText : el.content }}
                    </div>

                    <div
                      v-else-if="el.type === 'timer'"
                      style="
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-variant-numeric: tabular-nums;
                      "
                      :style="{
                        backgroundColor: el.bgColor,
                        color: el.color,
                        borderRadius: el.borderRadius + 'px',
                        fontSize: el.fontSize + 'px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                      }"
                    >
                      {{
                        playMode && el.isRunning
                          ? formatTime(el.timeLeft)
                          : formatTime(el.duration * 60)
                      }}
                    </div>

                    <div
                      v-else-if="el.type === 'image'"
                      class="el-image-container"
                      :style="{
                        borderRadius: (el.borderRadius || 0) + 'px',
                        border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'),
                        filter:
                          'grayscale(' +
                          (el.grayscale || 0) +
                          '%) blur(' +
                          (el.blur || 0) +
                          'px) sepia(' +
                          (el.sepia || 0) +
                          '%)',
                        overflow: 'hidden',
                        width: '100%',
                        height: '100%',
                        boxShadow: el.boxShadow || 'none',
                      }"
                    >
                      <img
                v-if="el.src && el.src.trim() !== ''"
                        :src="el.src"
                        class="el-content-fitted"
                        :style="{ objectFit: el.fit }"
                        draggable="false"
                      />
                      <div v-else class="placeholder-box">
                        <i class="ph ph-image" style="font-size: 2rem"></i>
                      </div>
                    </div>

                    <div
                      v-else-if="el.type === 'magnifier'"
                      class="el-magnifier"
                      :style="{
                        borderRadius: '50%',
                        border: (el.borderWidth || 4) + 'px solid ' + (el.borderColor || '#fff'),
                        overflow: 'hidden',
                        width: '100%',
                        height: '100%',
                        boxShadow: el.boxShadow || '0 10px 25px rgba(0,0,0,0.2)',
                      }"
                    >
              <div
                v-if="el.src && el.src.trim() !== ''"
                        :style="{
                          width: '100%',
                          height: '100%',
                          backgroundImage: 'url(' + el.src + ')',
                          backgroundSize: el.zoomLevel * 100 + '%',
                          backgroundPosition: el.focusX + '% ' + el.focusY + '%',
                          backgroundRepeat: 'no-repeat',
                        }"
                      ></div>
                      <div v-else class="placeholder-box" style="border-radius: 50%">
                        <i class="ph ph-magnifying-glass"></i>
                      </div>
                    </div>

                    <div
                      v-else-if="el.type === 'video'"
                      class="el-video-container"
                      :style="{
                        borderRadius: (el.borderRadius || 0) + 'px',
                        border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'),
                        overflow: 'hidden',
                        boxShadow: el.boxShadow || 'none',
                      }"
                    >
              <template v-if="el.src && el.src.trim() !== ''">
                        <iframe
                          v-if="isYouTube(el.src)"
                          src="about:blank"
                          :src="getYouTubeEmbedUrl(el.src)"
                          class="el-content-fitted"
                          frameborder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen
                          :style="{ pointerEvents: playMode ? 'auto' : 'none' }"
                        ></iframe>
                        <video
                          v-else
                          :src="el.src"
                          :controls="playMode"
                          :autoplay="playMode && el.autoplay"
                          :loop="el.loop"
                          :muted="el.muted"
                          class="el-content-fitted"
                          :style="{ objectFit: el.fit }"
                        ></video>
                      </template>
                      <div v-else class="placeholder-box">
                        <i class="ph ph-video-camera" style="font-size: 2rem"></i>
                      </div>
                      <div v-if="!playMode" class="drag-protector"></div>
                    </div>

                    <div
                      v-else-if="el.type === 'iframe'"
                      class="el-iframe-container"
                      :style="{
                        borderRadius: (el.borderRadius || 0) + 'px',
                        border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'),
                        overflow: 'hidden',
                        width: '100%',
                        height: '100%',
                      }"
                    >
                      <template v-if="el.src && el.src.trim() !== ''">
                        <div v-if="isIframeBlocked(el.src)" class="placeholder-box" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; text-align:center; padding:16px;">
                          <i class="ph ph-shield-warning" style="font-size: 2rem"></i>
                          <div>Esta web no permite ser incrustada por seguridad</div>
                          <button type="button" class="btn-primary" @click.stop="window.open(formatIframeUrl(el.src), '_blank')">
                            Abrir enlace original
                          </button>
                        </div>
                        <iframe
                          v-else
                          :src="formatIframeUrl(el.src)"
                          width="100%"
                          height="100%"
                          frameborder="0"
                          allowfullscreen
                          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                          :style="{ pointerEvents: playMode ? 'auto' : 'none' }"
                        ></iframe>
                      </template>
                      <div v-else class="placeholder-box">
                        <i class="ph ph-globe" style="font-size: 2rem"></i>
                      </div>
                      <div v-if="!playMode" class="drag-protector"></div>
                    </div>

                    <div
                      v-else-if="el.type === 'map'"
                      class="el-iframe-container"
                      :style="{
                        width: '100%',
                        height: '100%',
                        borderRadius: (el.borderRadius || 0) + 'px',
                        border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'),
                        overflow: 'hidden',
                        boxShadow: el.boxShadow || 'none',
                      }"
                    >
                      <LeafletMapElement :element="el" :interactive="playMode" />
                      <div v-if="!playMode" class="drag-protector"></div>
                    </div>

                    <div
                      v-else-if="el.type === 'finance'"
                      class="el-iframe-container"
                      :style="{
                        width: '100%',
                        height: '100%',
                        borderRadius: (el.borderRadius || 0) + 'px',
                        border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'),
                        overflow: 'hidden',
                        boxShadow: el.boxShadow || 'none',
                      }"
                    >
                      <iframe
                        :src="`https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(el.symbol)}&interval=D&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=${el.theme}&style=${el.chartType}&timezone=Etc%2FUTC&withdateranges=1&showpopupbutton=0`"
                        width="100%"
                        height="100%"
                        frameborder="0"
                        allowfullscreen
                        :style="{ pointerEvents: playMode ? 'auto' : 'none' }"
                      ></iframe>
                      <div class="drag-protector"></div>
                    </div>

                    <div
                      v-else-if="el.type === 'calendar'"
                      :style="{
                        width: '100%',
                        height: el.height === 'auto' ? 'auto' : '100%',
                        backgroundColor: el.bgColor,
                        color: el.color,
                        fontFamily: el.fontFamily,
                        borderRadius: (el.borderRadius || 0) + 'px',
                        border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'),
                        boxShadow: el.boxShadow || 'none',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                      }"
                    >
                      <div
                        :style="{
                          backgroundColor: el.accentColor,
                          color: '#ffffff',
                          padding: '14px 16px',
                          textAlign: 'center',
                          fontWeight: '700',
                        }"
                      >
                        Mes: {{ el.month }} / Año: {{ el.year }}
                      </div>
                      <div
                        :style="{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(7, 1fr)',
                          textAlign: 'center',
                          fontSize: '0.9rem',
                          padding: '12px',
                          gap: '4px',
                        }"
                      >
                        <div
                          v-for="day in ['L', 'M', 'X', 'J', 'V', 'S', 'D']"
                          :key="day"
                          :style="{ fontWeight: '700' }"
                        >
                          {{ day }}
                        </div>
                      </div>
                      <div
                        :style="{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(7, 1fr)',
                          gap: '4px',
                          padding: '12px',
                          alignContent: 'start',
                          flex: '1 1 auto',
                        }"
                      >
                        <div
                          v-for="(d, index) in getCalendarDays(el.month, el.year)"
                          :key="`cal-${index}-${d.day || 0}`"
                          @click="playMode && !d.empty && getDayEvents(el, d.day).length ? (el.activeAgendaDay = d.day) : null"
                          :style="{
                            aspectRatio: '1 / 1',
                            minHeight: '48px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: d.empty ? 'center' : 'space-between',
                            borderRadius: '8px',
                            padding: d.empty ? '0' : '6px 4px',
                            backgroundColor: d.empty ? 'transparent' : 'rgba(255,255,255,0.08)',
                            cursor: playMode && !d.empty && getDayEvents(el, d.day).length ? 'pointer' : 'default',
                          }"
                        >
                          <template v-if="!d.empty">
                            <span>{{ d.day }}</span>
                            <div :style="{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center', minHeight: '8px' }">
                              <span
                                v-for="(ev, evIndex) in getDayEvents(el, d.day)"
                                :key="ev.id || evIndex"
                                :style="{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: ev.color || '#3b82f6',
                                }"
                              ></span>
                            </div>
                          </template>
                        </div>
                      </div>

                      <div
                        v-if="el.activeAgendaDay"
                        :style="{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'rgba(0, 0, 0, 0.45)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '14px',
                          boxSizing: 'border-box',
                          zIndex: 2,
                        }"
                      >
                        <div
                          :style="{
                            width: '100%',
                            height: '100%',
                            maxHeight: '100%',
                            backgroundColor: '#ffffff',
                            borderRadius: '10px',
                            color: '#1e293b',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                          }"
                        >
                          <div
                            :style="{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              backgroundColor: el.accentColor,
                              color: '#ffffff',
                              fontWeight: '700',
                            }"
                          >
                            <span>Agenda del día {{ el.activeAgendaDay }}</span>
                            <button
                              type="button"
                              @click.stop="el.activeAgendaDay = null"
                              :style="{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '1rem' }"
                            >
                              <i class="ph ph-x"></i>
                            </button>
                          </div>

                          <div :style="{ flex: '1 1 auto', overflowY: 'auto', padding: '12px' }">
                            <div
                              v-for="(ev, evIndex) in getDayEvents(el, el.activeAgendaDay)"
                              :key="ev.id || evIndex"
                              :style="{
                                borderLeft: '4px solid ' + (ev.color || '#3b82f6'),
                                backgroundColor: '#f8fafc',
                                borderRadius: '6px',
                                padding: '10px',
                                marginBottom: '8px',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                              }"
                            >
                              {{ ev.content || 'Sin detalle' }}
                            </div>
                            <div
                              v-if="getDayEvents(el, el.activeAgendaDay).length === 0"
                              :style="{ color: '#64748b', fontStyle: 'italic' }"
                            >
                              No hay notas para este día.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      v-else-if="el.type === 'audio'"
                      class="el-audio-wrapper"
                      @click.stop="playMode ? executeEvents(el, 'click') : null; playAudio(el)"
                      :style="{ width: '100%', height: '100%' }"
                    >
                      <div
                        v-if="el.variant === 'pill'"
                        class="audio-pill"
                        :style="{
                          backgroundColor: el.bgColor,
                          color: el.color,
                          borderRadius: el.borderRadius + 'px',
                        }"
                      >
                        <i
                          class="ph"
                          :class="el.isPlaying ? 'ph-pause-circle' : 'ph-play-circle'"
                        ></i>
                        <span class="audio-label">{{
                          el.isPlaying ? 'Reproduciendo...' : 'Audio'
                        }}</span>
                        <div class="audio-waves" v-if="el.isPlaying">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                      <div
                        v-else-if="el.variant === 'minimal'"
                        class="audio-minimal"
                        :class="{ 'is-playing': el.isPlaying }"
                        :style="{
                          backgroundColor: el.bgColor,
                          color: el.color,
                          borderRadius: el.borderRadius + 'px',
                        }"
                      >
                        <i class="ph" :class="el.isPlaying ? 'ph-pause' : 'ph-speaker-high'"></i>
                      </div>
                      <div
                        v-else-if="el.variant === 'floating'"
                        class="audio-floating"
                        :class="{ 'is-playing': el.isPlaying }"
                        :style="{
                          backgroundColor: el.bgColor,
                          color: el.color,
                          borderRadius: '50%',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        }"
                      >
                        <i class="ph" :class="el.isPlaying ? 'ph-stop' : 'ph-play'"></i>
                      </div>
                      <audio
                  v-if="el.src && el.src.trim() !== ''"
                        :ref="'audio_' + el.id"
                        :src="el.src"
                        :loop="el.loop"
                        :autoplay="playMode && el.autoplay"
                      ></audio>
                    </div>

                    <div v-else-if="el.type === '3d'" class="el-3d">
                      <model-viewer
                  v-if="el.src && el.src.trim() !== ''"
                        :src="el.src"
                        :auto-rotate="el.autoRotate"
                        :camera-controls="el.cameraControls"
                        :environment-image="el.envImage"
                        style="width: 100%; height: 100%"
                        :disable-zoom="!playMode"
                      ></model-viewer>
                      <div v-else class="placeholder-box">
                        <i class="ph ph-cube" style="font-size: 2rem"></i>
                      </div>
                      <div v-if="!playMode" class="drag-protector"></div>
                    </div>

                    <div
                      v-else-if="el.type === 'interactive'"
                      class="el-interactive"
                      @click.stop="playMode ? executeEvents(el, 'click') : null; triggerInteraction(el)"
                    >
                      <div
                        class="hotspot-pulse"
                        :style="{ backgroundColor: el.color, boxShadow: '0 0 15px ' + el.color }"
                      ></div>
                      <div
                        v-if="el.isOpen"
                        class="interactive-modal"
                        :style="{
                          backgroundColor: el.modalBgColor || '#ffffff',
                          color: el.modalTextColor || '#333333',
                        }"
                        @click.stop
                      >
                        <h4
                          class="modal-title"
                          :style="{ borderBottomColor: el.modalTextColor || '#333333' }"
                        >
                          {{ el.modalTitle }}
                        </h4>
                        <p v-html="el.contentHtml"></p>
                      </div>
                    </div>

                    <div
                      v-else-if="el.type === 'link'"
                      class="el-link"
                      :style="{
                        backgroundColor: el.bgColor,
                        color: el.color,
                        borderRadius: el.borderRadius + 'px',
                        border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'),
                        fontSize: el.fontSize + 'px',
                        fontWeight: el.fontWeight || 'bold',
                        fontFamily: el.fontFamily || 'Arial',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      }"
                      @click.stop="playMode ? changePageTo(el.targetPage) : null"
                    >
                      {{ el.text }}
                    </div>

                    <div
                      v-else-if="el.type === 'accordion'"
                      class="el-accordion"
                      :style="{
                        backgroundColor: el.bgColor,
                        color: el.color,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                      }"
                    >
                      <div
                        v-for="(item, idx) in el.items"
                        :key="idx"
                        class="accordion-item"
                        :style="{ borderBottomColor: el.color }"
                      >
                        <div
                          class="accordion-header"
                          @click.stop="playMode ? (executeEvents(el, 'click', idx), item.isOpen = !item.isOpen) : null"
                        >
                          <span>{{ item.title }}</span>
                          <i class="ph" :class="item.isOpen ? 'ph-caret-up' : 'ph-caret-down'"></i>
                        </div>
                        <div
                          v-show="!playMode || item.isOpen"
                          class="accordion-content"
                          :class="{ 'is-preview': !playMode }"
                        >
                          {{ item.content }}
                        </div>
                      </div>
                    </div>

                  <div
                      v-if="
                        selectedElementIds.includes(el.id) &&
                        !playMode &&
                        !['interactive', 'audio'].includes(el.type) &&
                        !el.isLocked
                      "
                      class="figma-bounding-box"
                    >
                      <template v-if="selectedElementIds.length === 1">
                      <div class="rotate-handle nw" @mousedown.stop.prevent="startRotate($event, el)"></div>
                      <div class="rotate-handle ne" @mousedown.stop.prevent="startRotate($event, el)"></div>
                      <div class="rotate-handle sw" @mousedown.stop.prevent="startRotate($event, el)"></div>
                      <div class="rotate-handle se" @mousedown.stop.prevent="startRotate($event, el)"></div>

                      <div class="resize-handle nw" @mousedown.stop.prevent="startResize($event, el, 'nw')"></div>
                      <div class="resize-handle ne" @mousedown.stop.prevent="startResize($event, el, 'ne')"></div>
                      <div class="resize-handle sw" @mousedown.stop.prevent="startResize($event, el, 'sw')"></div>
                      <div class="resize-handle se" @mousedown.stop.prevent="startResize($event, el, 'se')"></div>
                      </template>
                    </div>
                  </div>
                </div>
                </Transition>
              </div>
            </main>
          </div>

          <div v-else-if="!hasDoc && !isConverting" class="empty-workspace w-100">
            <div class="empty-box">
              <div class="empty-icon-wrapper"><i class="ph ph-magic-wand"></i></div>
              <h3>{{ isTemplateCreatorMode ? 'Creador de Plantillas' : 'Comienza a crear' }}</h3>
              <p>
                {{
                  isTemplateCreatorMode
                    ? 'Configura la resolución de tu plantilla para empezar a diseñar Portada, Base y Cierre.'
                    : 'Diseña desde cero o importa un documento existente para añadirle interactividad.'
                }}
              </p>
              <div
                class="button-group mt-4 button-stack"
              >
                <template v-if="isTemplateCreatorMode">
                  <button class="btn-primary large-btn w-100" @click="showNewProjectModal = true">
                    <i class="ph ph-ruler"></i> Configurar Resolución de Plantilla
                  </button>
                </template>
                <template v-else>
                  <button class="btn-primary large-btn w-100" @click="showNewProjectModal = true">
                    <i class="ph ph-file-plus"></i> Proyecto en Blanco
                  </button>
                  <div class="divider-text">
                    o
                  </div>
                  <label
                    class="btn-secondary large-btn w-100 upload-label-btn"
                  >
                    <input
                      type="file"
                      @change="handleFileUpload"
                      accept=".pdf, .pptx, .ppsx, .potx, .html"
                      hidden
                    />
                    <i class="ph ph-upload-simple"></i> Subir PDF / PPTX / HTML
                  </label>
                </template>
              </div>
            </div>
          </div>

          <div
            v-if="showNewProjectModal"
            class="loading-overlay modal-overlay"
          >
            <div class="new-project-modal">
              <div class="modal-header">
                <h3>{{ isTemplateCreatorMode ? 'Crear Plantilla' : 'Crear Nuevo Proyecto' }}</h3>
                <button class="btn-icon-danger" @click="showNewProjectModal = false">
                  <i class="ph ph-x"></i>
                </button>
              </div>

              <div class="prop-group mt-4">
                <label>Tamaño del Lienzo</label>
                <select v-model="projectConfigs.preset" class="pro-input">
                  <option value="hd">16:9 HD (1280x720)</option>
                  <option value="fhd">16:9 Full HD (1920x1080)</option>
                  <option value="sd">4:3 Estándar (1024x768)</option>
                  <option value="square">Cuadrado (1080x1080)</option>
                  <option value="custom">Personalizado...</option>
                </select>
              </div>

              <div class="prop-row" v-if="projectConfigs.preset === 'custom'">
                <div class="prop-group half">
                  <label>Ancho (px)</label>
                  <input type="number" v-model="projectConfigs.width" class="pro-input" />
                </div>
                <div class="prop-group half">
                  <label>Alto (px)</label>
                  <input type="number" v-model="projectConfigs.height" class="pro-input" />
                </div>
              </div>

              <div class="prop-group mt-4" v-if="!isTemplateCreatorMode">
                <label>Seleccionar Plantilla</label>
                <div class="template-grid">
                  <div
                    class="template-card"
                    :class="{ 'is-active': projectConfigs.template === 'blank' }"
                    @click="projectConfigs.template = 'blank'"
                  >
                    <i class="ph ph-file-dashed"></i>
                    <span>En Blanco</span>
                  </div>
                  <div
                    class="template-card"
                    :class="{ 'is-active': projectConfigs.template === 'modern' }"
                    @click="projectConfigs.template = 'modern'"
                  >
                    <i class="ph ph-presentation-chart"></i>
                    <span>Moderna</span>
                  </div>
                  <div
                    class="template-card"
                    :class="{ 'is-active': projectConfigs.template === 'dark' }"
                    @click="projectConfigs.template = 'dark'"
                  >
                    <i class="ph ph-moon"></i>
                    <span>Oscura</span>
                  </div>
                  <div
                    class="template-card"
                    :class="{ 'is-active': projectConfigs.template === 'custom' }"
                    @click="projectConfigs.template = 'custom'"
                  >
                    <i class="ph ph-user"></i>
                    <span>Mi Plantilla</span>
                  </div>
                </div>
                <div
                  v-if="projectConfigs.template === 'custom'"
                  class="info-box info-box-accent mt-2"
                >
                  <i class="ph ph-info"></i> Diseña la Diapositiva 1. Al añadir nuevas diapositivas,
                  se duplicará su diseño y elementos actuando como maestro.
                </div>
              </div>

              <div class="modal-actions mt-4 pt-4">
                <button class="btn-ghost" @click="showNewProjectModal = false">Cancelar</button>
                <button class="btn-primary" @click="confirmCreateProject">
                  {{ isTemplateCreatorMode ? 'Crear Plantilla' : 'Crear Proyecto' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Resizer Derecho -->
          <div class="sidebar-resizer" v-if="hasDoc && !playMode && isRightSidebarOpen" @mousedown.prevent.stop="startResizeSidebar($event, 'right')"></div>

          <aside class="pro-sidebar right-sidebar" v-show="isRightSidebarOpen" v-if="hasDoc && !playMode" :style="{ width: rightSidebarWidth + 'px' }" @click.stop>
            <div class="panel-header">Propiedades</div>

            <div class="inspector-tabs" v-if="selectedElement">
              <button class="inspector-tab" :class="{ active: activeInspectorTab === 'design' }" @click="activeInspectorTab = 'design'" title="Diseño y Estilos">
                <i class="ph ph-paint-brush"></i>
              </button>
              <button v-if="['chart', 'poll', 'table', 'list', 'checkbox', 'calendar', 'mindmap', 'finance'].includes(selectedElement.type)" class="inspector-tab" :class="{ active: activeInspectorTab === 'data' }" @click="activeInspectorTab = 'data'" title="Datos y Contenido">
                <i class="ph ph-database"></i>
              </button>
              <button class="inspector-tab" :class="{ active: activeInspectorTab === 'interactivity' }" @click="activeInspectorTab = 'interactivity'" title="Interactividad y Eventos">
                <i class="ph ph-lightning"></i>
              </button>
              <button class="inspector-tab" :class="{ active: activeInspectorTab === 'animations' }" @click="activeInspectorTab = 'animations'" title="Animaciones">
                <i class="ph ph-film-strip"></i>
              </button>
            </div>

            <div class="panel-content" v-if="selectedElementIds.length > 1">
              <div class="element-header">
                <div class="badge-type">
                  <i class="ph ph-squares-four"></i> {{ selectedElementIds.length }} SELECCIONADOS
                </div>
                <button class="btn-icon-danger" @click="deleteSelected" title="Eliminar Selección">
                  <i class="ph ph-trash"></i>
                </button>
              </div>

              <div class="prop-section">
                <div class="section-title">Acciones de Grupo</div>
                <button class="btn-secondary w-100 mb-2" v-if="!isAllGrouped" @click="groupElements">
                  <i class="ph ph-intersect"></i> Agrupar
                </button>
                <button class="btn-secondary w-100 mb-2" v-if="isAllGrouped" @click="ungroupElements">
                  <i class="ph ph-exclude"></i> Desagrupar
                </button>
              </div>

              <div class="prop-section">
                <div class="section-title">Alinear Selección</div>
                <div class="align-grid">
                  <button class="tool-btn" @click="alignElements('left')" title="Izquierda">
                    <i class="ph ph-align-left"></i>
                  </button>
                  <button class="tool-btn" @click="alignElements('center')" title="Centro Horizontal">
                    <i class="ph ph-align-center-horizontal"></i>
                  </button>
                  <button class="tool-btn" @click="alignElements('right')" title="Derecha">
                    <i class="ph ph-align-right"></i>
                  </button>
                  <button class="tool-btn" @click="alignElements('top')" title="Arriba">
                    <i class="ph ph-align-top"></i>
                  </button>
                  <button class="tool-btn" @click="alignElements('middle')" title="Medio Vertical">
                    <i class="ph ph-align-center-vertical"></i>
                  </button>
                  <button class="tool-btn" @click="alignElements('bottom')" title="Abajo">
                    <i class="ph ph-align-bottom"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="panel-content" v-else-if="selectedElement">
              <!-- --- MOTOR DE EVENTOS (EDA) --- -->
              <div v-if="selectedElement.type !== 'calendar'" v-show="activeInspectorTab === 'interactivity'" class="prop-section interactivity-panel">
                <h4 class="interactivity-panel-header">
                  <span class="interactivity-title"><i class="ph ph-lightning"></i> Interactividad</span>
                  <button class="tool-btn event-add-btn" @click="selectedElement.events = selectedElement.events || []; selectedElement.events.push({ id: 'ev_' + Date.now(), trigger: 'click', action: 'show', targetId: '' })">
                    <i class="ph ph-plus"></i></button>
                </h4>

                <div v-if="!selectedElement.events || selectedElement.events.length === 0" class="event-empty-state">
                  No hay eventos configurados.
                </div>

                <div v-for="(ev, index) in selectedElement.events || []" :key="ev.id" class="event-card">
                  <div class="event-row">
                    <div class="event-row-main">
                      <label class="event-field-label">Accionador (Trigger)</label>
                      <select v-model="ev.trigger" class="pro-input">
                        <option value="click">Al hacer Clic</option>
                        <option value="hover">Al pasar Ratón</option>
                      </select>
                    </div>
                    <button class="btn-icon-danger event-delete-btn" @click="selectedElement.events.splice(index, 1)"><i class="ph ph-trash"></i></button>
                  </div>

                  <div class="event-stack" v-if="['checkbox', 'accordion', 'list'].includes(selectedElement.type)">
                    <label class="event-field-label">Acciona desde sub-elemento:</label>
                    <select v-model="ev.sourceSubId" class="pro-input">
                      <option :value="undefined">Todo el componente</option>
                      <option v-for="(item, iIdx) in selectedElement.items" :key="iIdx" :value="iIdx">
                         Ítem {{ iIdx + 1 }}: "{{ item.text || item.title || item }}"
                      </option>
                    </select>
                  </div>

                  <div class="event-stack">
                    <label class="event-field-label">Acción</label>
                    <select v-model="ev.action" class="pro-input">
                      <option value="show">Mostrar elemento</option>
                      <option value="hide">Ocultar elemento</option>
                      <option value="toggle">Alternar visibilidad</option>
                      <option value="goToPage">Ir a página num</option>
                    </select>
                  </div>

                  <div class="event-stack">
                    <label class="event-field-label">Objetivo (Target)</label>
                    <input v-if="ev.action === 'goToPage'" type="number" v-model="ev.targetId" class="pro-input" placeholder="Nº de Página" min="1" :max="numPages" />
                    <div v-else class="event-target-row">
                      <select v-model="ev.targetId" class="pro-input event-target-select">
                        <option disabled value="">-- Seleccionar --</option>
                        <option v-for="targetEl in currentPageElements" :key="targetEl.id" :value="targetEl.id" v-show="targetEl.id !== selectedElement.id">
                          {{ getElementDisplayName(targetEl) }}
                        </option>
                      </select>
                      <button class="tool-btn event-target-btn" :class="{ 'is-active': isSelectingTargetForEvent === ev.id }" @click="isSelectingTargetForEvent = isSelectingTargetForEvent === ev.id ? null : ev.id" :title="isSelectingTargetForEvent === ev.id ? 'Seleccionando (Haz clic en el lienzo)' : 'Seleccionar objetivo visualmente'">
                        <i class="ph ph-crosshair"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="element-header" v-show="activeInspectorTab === 'design'">
                <div class="badge-type">
                  <i :class="`ph ${getIconClassForType(selectedElement.type)}`"></i>
                  {{ selectedElement.type.toUpperCase() }}
                </div>
                <button class="btn-icon-danger" @click="deleteSelected" title="Eliminar Elemento">
                  <i class="ph ph-trash"></i>
                </button>
              </div>

              <div class="prop-section" v-if="selectedElement.groupId" v-show="activeInspectorTab === 'design'">
                <div class="section-title">En Grupo</div>
                <button class="btn-secondary w-100" @click="ungroupElements">
                  <i class="ph ph-exclude"></i> Desagrupar Elemento
                </button>
              </div>

              <div class="prop-section" v-if="selectedElement.type !== 'draw'" v-show="activeInspectorTab === 'animations'">
                <div class="section-title">Animación (Entrada)</div>
                <div class="prop-group mb-0">
                  <label>Efecto</label>
                  <select v-model="selectedElement.animationType" class="pro-input">
                    <option value="none">Ninguna</option>
                    <option value="fade-in">Desvanecer (Fade In)</option>
                    <option value="slide-up">Deslizar Arriba</option>
                    <option value="zoom-in">Acercar (Zoom In)</option>
                    <option value="bounce">Rebote</option>
                  </select>
                </div>
                <div class="prop-group mb-0 mt-2" v-if="selectedElement.animationType && selectedElement.animationType !== 'none'">
                  <label>Desencadenador</label>
                  <select v-model="selectedElement.animationTrigger" class="pro-input">
                    <option value="onClick">Al Hacer Clic</option>
                    <option value="withPrevious">Con la anterior</option>
                    <option value="afterPrevious">Después de la anterior</option>
                  </select>
                </div>
                <div class="prop-group mb-0 mt-2" v-if="selectedElement.animationType && selectedElement.animationType !== 'none'">
                  <label>Paso en el Timeline (Orden)</label>
                  <input type="number" v-model="selectedElement.animationOrder" class="pro-input" min="0" />
                </div>
              </div>

              <div
                class="prop-section"
                v-if="!['audio', 'interactive'].includes(selectedElement.type)"
                v-show="activeInspectorTab === 'design'"
              >
                <div class="section-title">Geometría</div>
                <div class="prop-row">
                  <div class="prop-group half">
                    <label>X (px)</label
                    ><input type="number" v-model="selectedElement.x" class="pro-input" />
                  </div>
                  <div class="prop-group half">
                    <label>Y (px)</label
                    ><input type="number" v-model="selectedElement.y" class="pro-input" />
                  </div>
                </div>
                <div class="prop-row">
                  <div class="prop-group half">
                    <label>Ancho (W)</label
                    ><input type="number" v-model="selectedElement.width" class="pro-input" />
                  </div>
                  <div class="prop-group half">
    <label>Alto (H)</label>

    <input
      v-if="selectedElement.height === 'auto'"
      type="text"
      value="Auto"
      class="pro-input"
      disabled
    />

    <input
      v-else
      type="number"
      v-model="selectedElement.height"
      class="pro-input"
    />
  </div>
                </div>
                <div class="prop-group" v-if="selectedElement.type !== 'rating'">
                  <label>Rotación (°)</label>
                  <div class="range-wrapper">
                    <input
                      type="range"
                      v-model="selectedElement.rotation"
                      min="0"
                      max="360"
                      step="1"
                      class="w-100"
                    />
                    <span class="range-val">{{ selectedElement.rotation || 0 }}°</span>
                  </div>
                </div>
              </div>

              <div class="prop-section" v-show="activeInspectorTab === 'design'">
                <div class="section-title">Apariencia</div>
                <div class="prop-row">
                  <div
                    class="prop-group half"
                    v-if="!['interactive', '3d', 'audio'].includes(selectedElement.type)"
                  >
                    <label>Opacidad</label
                    ><input
                      type="number"
                      v-model="selectedElement.opacity"
                      min="0"
                      max="1"
                      step="0.1"
                      class="pro-input"
                    />
                  </div>
                  <div
                    class="prop-group half"
                    v-if="!['interactive', '3d', 'audio'].includes(selectedElement.type)"
                  >
                    <label>Fusión</label>
                    <select
                      v-model="selectedElement.mixBlendMode"
                      class="pro-input"
                    >
                      <option value="normal">Normal</option>
                      <option value="multiply">Multiplicar</option>
                      <option value="screen">Trama</option>
                      <option value="overlay">Superponer</option>
                    </select>
                  </div>
                </div>
              </div>

              <template v-if="selectedElement.type === 'mindmap' && activeInspectorTab === 'data'">
                <div class="prop-section">
                  <div class="section-title">Diseño del Mapa Mental</div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Color Líneas</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.lineColor"
                        @input="updateColorDebounced(selectedElement, 'lineColor', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Grosor Líneas</label
                      ><input type="number" v-model="selectedElement.lineWidth" class="pro-input" />
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Fuente Global</label>
                    <select v-model="selectedElement.fontFamily" class="pro-input">
                      <option value="Helvetica, Arial, sans-serif">Helvetica</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="'Comic Sans MS', cursive">Handwriting</option>
                    </select>
                  </div>
                </div>

                <div class="prop-section map-node-panel" v-if="activeMapNodeId">
                  <div class="section-title map-node-title">
                    <i class="ph ph-node"></i> Editar Nodo Seleccionado
                  </div>
                  <div class="prop-group">
                    <label>Texto del Nodo</label>
                    <input type="text" v-model="activeMapNode.text" class="pro-input" />
                  </div>
                  <div class="prop-group">
                    <label>Nota / Subtítulo</label>
                    <input
                      type="text"
                      v-model="activeMapNode.note"
                      class="pro-input"
                      placeholder="Opcional..."
                    />
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Fondo Nodo</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="activeMapNode.bgColor"
                        @input="updateColorDebounced(activeMapNode, 'bgColor', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Color Texto</label>
                      <div class="color-picker-wrapper">
                      <input type="color" :value="activeMapNode.color" @input="updateColorDebounced(activeMapNode, 'color', $event)" class="pro-color-picker" />
                      </div>
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Forma del Nodo</label>
                    <select v-model="activeMapNode.shape" class="pro-input">
                      <option value="round">Bordes Redondeados</option>
                      <option value="rect">Rectangular</option>
                      <option value="circle">Circular</option>
                    </select>
                  </div>
                  <div class="prop-group">
                    <label>Imagen Adjunta (URL)</label>
                    <input
                      type="text"
                      v-model="activeMapNode.image"
                      class="pro-input"
                      placeholder="https://..."
                    />
                  </div>

                  <div class="prop-group section-divider">Estructura</div>
                  <button
                    class="btn-secondary w-100 mb-1"
                    @click="addMapNode(selectedElement, activeMapNodeId)"
                  >
                    <i class="ph ph-plus"></i> Añadir Rama (Hijo)
                  </button>
                  <button
                    class="btn-secondary w-100 mb-2"
                    v-if="activeMapNode.parentId"
                    @click="addMapNode(selectedElement, activeMapNode.parentId)"
                  >
                    <i class="ph ph-arrows-split"></i> Añadir Hermano
                  </button>
                  <button
                    class="btn-danger w-100"
                    v-if="activeMapNode.parentId"
                    @click="removeMapNode(selectedElement, activeMapNodeId)"
                  >
                    <i class="ph ph-trash"></i> Eliminar Nodo
                  </button>
                </div>
                <div class="prop-section empty-state map-empty-state" v-else>
                  <i class="ph ph-hand-pointing map-empty-icon"></i>
                  <p class="map-empty-copy">
                    Haz clic en un nodo del mapa para editarlo.
                  </p>
                </div>
              </template>

              <template v-if="selectedElement.type === 'map' && activeInspectorTab === 'design'">
                <div class="prop-section">
                  <div class="section-title">Configuración del Mapa</div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Latitud central</label>
                      <input type="number" v-model.number="selectedElement.centerLat" step="0.000001" class="pro-input" />
                    </div>
                    <div class="prop-group half">
                      <label>Longitud central</label>
                      <input type="number" v-model.number="selectedElement.centerLng" step="0.000001" class="pro-input" />
                    </div>
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Zoom</label>
                      <input type="number" min="1" max="19" v-model.number="selectedElement.zoomLevel" class="pro-input" />
                    </div>
                  </div>
                </div>

                <div class="prop-section">
                  <div class="section-title">Pines</div>
                  <div v-for="marker in selectedElement.markers" :key="marker.id" class="prop-section marker-card">
                    <div class="prop-row">
                      <div class="prop-group half">
                        <label>Etiqueta</label>
                        <input type="text" v-model="marker.label" class="pro-input" />
                      </div>
                      <div class="prop-group half">
                        <label>Color</label>
                        <input type="color" v-model="marker.color" class="pro-color-picker" />
                      </div>
                    </div>
                    <div class="prop-row">
                      <div class="prop-group half">
                        <label>Latitud</label>
                        <input type="number" step="0.000001" v-model.number="marker.lat" class="pro-input" />
                      </div>
                      <div class="prop-group half">
                        <label>Longitud</label>
                        <input type="number" step="0.000001" v-model.number="marker.lng" class="pro-input" />
                      </div>
                    </div>
                    <button class="btn-danger w-100" @click="removeMapMarker(selectedElement, marker.id)">
                      <i class="ph ph-trash"></i> Eliminar pin
                    </button>
                  </div>
                  <button class="btn-secondary w-100" @click="addMapMarker(selectedElement)">
                    <i class="ph ph-plus"></i> Añadir pin
                  </button>
                </div>
              </template>

              <template v-if="selectedElement.type === 'calendar'">
                <div class="prop-section" v-show="activeInspectorTab === 'design'">
                  <div class="section-title">Configuración del Calendario</div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Mes</label>
                      <input type="number" min="1" max="12" v-model.number="selectedElement.month" class="pro-input" />
                    </div>
                    <div class="prop-group half">
                      <label>Año</label>
                      <input type="number" v-model.number="selectedElement.year" class="pro-input" />
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Tipografía</label>
                    <select v-model="selectedElement.fontFamily" class="pro-input">
                      <option value="Helvetica, Arial, sans-serif">Helvetica</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="'Comic Sans MS', cursive">Handwriting</option>
                      <option value="'Segoe UI', sans-serif">Segoe UI</option>
                    </select>
                  </div>
                  <div class="prop-group">
                    <label>Color Texto</label>
                    <div class="color-picker-wrapper">
                      <input type="color" :value="selectedElement.color" @input="updateColorDebounced(selectedElement, 'color', $event)" class="pro-color-picker" />
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Fondo</label>
                    <div class="color-picker-wrapper">
                      <input type="color" :value="selectedElement.bgColor" @input="updateColorDebounced(selectedElement, 'bgColor', $event)" class="pro-color-picker" />
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Color Cabecera</label>
                    <div class="color-picker-wrapper">
                      <input type="color" :value="selectedElement.accentColor" @input="updateColorDebounced(selectedElement, 'accentColor', $event)" class="pro-color-picker" />
                    </div>
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Borde</label>
                      <input type="number" min="0" v-model.number="selectedElement.borderWidth" class="pro-input" />
                    </div>
                    <div class="prop-group half">
                      <label>Radio</label>
                      <input type="number" min="0" v-model.number="selectedElement.borderRadius" class="pro-input" />
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Color Borde</label>
                    <div class="color-picker-wrapper">
                      <input type="color" :value="selectedElement.borderColor" @input="updateColorDebounced(selectedElement, 'borderColor', $event)" class="pro-color-picker" />
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Sombra</label>
                    <input type="text" v-model="selectedElement.boxShadow" class="pro-input" placeholder="0 4px 6px rgba(0,0,0,0.05)" />
                  </div>
                </div>

                <div class="prop-section" v-show="activeInspectorTab === 'data'">
                  <div class="section-title">Agenda y Eventos</div>

                  <div v-if="!selectedElement.events || selectedElement.events.length === 0" class="event-empty-state">
                    No hay eventos de agenda.
                  </div>

                  <div
                    v-for="(ev, index) in selectedElement.events || []"
                    :key="ev.id || index"
                    class="event-card"
                  >
                    <div class="prop-group">
                      <label>Tipo de Evento</label>
                      <select v-model="ev.type" class="pro-input">
                        <option value="single">Día Suelto</option>
                        <option value="range">Rango de Días</option>
                      </select>
                    </div>

                    <div class="prop-row">
                      <div class="prop-group" :class="ev.type === 'range' ? 'half' : ''">
                        <label>Día Inicio</label>
                        <input type="number" min="1" max="31" v-model.number="ev.startDay" class="pro-input" />
                      </div>
                      <div class="prop-group half" v-if="ev.type === 'range'">
                        <label>Día Fin</label>
                        <input type="number" min="1" max="31" v-model.number="ev.endDay" class="pro-input" />
                      </div>
                    </div>

                    <div class="prop-group">
                      <label>Color</label>
                      <input type="color" v-model="ev.color" class="pro-color-picker" />
                    </div>

                    <div class="prop-group">
                      <label>Detalle</label>
                      <textarea
                        v-model="ev.content"
                        class="pro-input resizable-input"
                        rows="3"
                        placeholder="Agenda o notas para este día"
                      ></textarea>
                    </div>

                    <button class="btn-danger w-100" @click="removeCalendarEvent(selectedElement, index)">
                      <i class="ph ph-trash"></i> Eliminar Evento
                    </button>
                  </div>

                  <button class="btn-secondary w-100" @click="addCalendarEvent(selectedElement)">
                    <i class="ph ph-plus"></i> Añadir Evento
                  </button>
                </div>
              </template>

              <template v-if="selectedElement.type === 'finance' && activeInspectorTab === 'data'">
                <div class="prop-section">
                  <div class="section-title">Configuración de Finanzas</div>
                  <div class="prop-group">
                    <label>Símbolo</label>
                    <input type="text" v-model="selectedElement.symbol" class="pro-input" placeholder="NASDAQ:AAPL, BINANCE:BTCUSD" />
                  </div>
                  <div class="prop-group">
                    <label>Tema</label>
                    <select v-model="selectedElement.theme" class="pro-input">
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  <div class="prop-group">
                    <label>Tipo de Gráfico</label>
                    <select v-model="selectedElement.chartType" class="pro-input">
                      <option value="1">Velas Japonesas</option>
                      <option value="2">Línea</option>
                      <option value="3">Área</option>
                    </select>
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Borde</label>
                      <input type="number" min="0" v-model.number="selectedElement.borderWidth" class="pro-input" />
                    </div>
                    <div class="prop-group half">
                      <label>Radio</label>
                      <input type="number" min="0" v-model.number="selectedElement.borderRadius" class="pro-input" />
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Color Borde</label>
                    <div class="color-picker-wrapper">
                      <input type="color" :value="selectedElement.borderColor" @input="updateColorDebounced(selectedElement, 'borderColor', $event)" class="pro-color-picker" />
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Sombra</label>
                    <input type="text" v-model="selectedElement.boxShadow" class="pro-input" placeholder="0 4px 10px rgba(0,0,0,0.1)" />
                  </div>
                </div>
              </template>

              <template v-if="selectedElement.type === 'table'">
                <div class="prop-section" v-show="activeInspectorTab === 'design'">
                  <div class="section-title">Estructura y Estilo Tabla</div>

                  <div class="prop-row">
                    <div class="prop-group half">
                      <button class="btn-secondary w-100" @click="addTableRow(selectedElement)">
                        <i class="ph ph-plus"></i> Fila
                      </button>
                    </div>
                    <div class="prop-group half">
                      <button class="btn-secondary w-100" @click="addTableColumn(selectedElement)">
                        <i class="ph ph-plus"></i> Columna
                      </button>
                    </div>
                  </div>

                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Color Texto</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.color"
                        @input="updateColorDebounced(selectedElement, 'color', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Color Borde</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                      :value="selectedElement.borderColor"
                      @input="updateColorDebounced(selectedElement, 'borderColor', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Fondo Cabecera</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.headerBgColor"
                        @input="updateColorDebounced(selectedElement, 'headerBgColor', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Grosor Borde</label
                      ><input type="number" v-model="selectedElement.borderWidth" class="pro-input" />
                    </div>
                  </div>

                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Fondo Filas Pares</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.rowBgColor1"
                        @input="updateColorDebounced(selectedElement, 'rowBgColor1', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Fondo Impares</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.rowBgColor2"
                        @input="updateColorDebounced(selectedElement, 'rowBgColor2', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Fuente</label>
                      <select
                        v-model="selectedElement.fontFamily"
                        class="pro-input"
                      >
                        <option value="Helvetica, Arial, sans-serif">Helvetica</option>
                        <option value="Georgia">Georgia</option>
                        <option value="monospace">Mono</option>
                      </select>
                    </div>
                    <div class="prop-group half">
                      <label>Tamaño Letra</label
                      ><input type="number" v-model="selectedElement.fontSize" class="pro-input" />
                    </div>
                  </div>
                </div>

                <div class="prop-section" v-show="activeInspectorTab === 'data'">
                  <div class="section-title">Datos (Tabla)</div>
                  <div style="overflow-x: auto">
                    <table style="width: 100%; border-collapse: collapse">
                      <thead>
                        <tr>
                          <th
                            v-for="(h, cIdx) in selectedElement.headers"
                            :key="cIdx"
                            style="padding: 4px"
                          >
                            <input
                              type="text"
                              v-model="selectedElement.headers[cIdx]"
                              class="pro-input"
                              style="
                                min-width: 80px;
                                text-align: center;
                                font-weight: bold;
                                background: #21262d;
                                padding: 4px;
                              "
                            />
                            <button
                              class="btn-text-danger"
                              style="display: block; width: 100%; margin-top: 2px"
                              @click="removeTableColumn(selectedElement, cIdx)"
                              v-if="selectedElement.headers.length > 1"
                            >
                              <i class="ph ph-trash"></i>
                            </button>
                          </th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, rIdx) in selectedElement.rows" :key="rIdx">
                          <td v-for="(cell, cIdx) in row" :key="cIdx" style="padding: 4px">
                            <input
                              type="text"
                              v-model="selectedElement.rows[rIdx][cIdx]"
                              class="pro-input"
                              style="min-width: 80px; padding: 4px"
                            />
                          </td>
                          <td>
                            <button
                              class="btn-text-danger"
                              @click="removeTableRow(selectedElement, rIdx)"
                              v-if="selectedElement.rows.length > 1"
                            >
                              <i class="ph ph-trash"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </template>

              <template v-if="selectedElement.type === 'list' && activeInspectorTab === 'data'">
                <div class="prop-section">
                  <div class="section-title">Lista de Texto</div>

                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Tipo Lista</label>
                      <select v-model="selectedElement.listType" class="pro-input">
                        <option value="ul">Desordenada (Viñetas)</option>
                        <option value="ol">Ordenada (Números)</option>
                      </select>
                    </div>
                    <div class="prop-group half">
                      <label>Estilo Viñeta</label>
                      <select v-model="selectedElement.bulletStyle" class="pro-input">
                        <option value="disc" v-if="selectedElement.listType === 'ul'">
                          Puntos •
                        </option>
                        <option value="circle" v-if="selectedElement.listType === 'ul'">
                          Círculos ◦
                        </option>
                        <option value="square" v-if="selectedElement.listType === 'ul'">
                          Cuadrados ▪
                        </option>
                        <option value="decimal" v-if="selectedElement.listType === 'ol'">
                          Números 1. 2.
                        </option>
                        <option value="lower-alpha" v-if="selectedElement.listType === 'ol'">
                          Letras a. b.
                        </option>
                        <option value="upper-roman" v-if="selectedElement.listType === 'ol'">
                          Romanos I. II.
                        </option>
                      </select>
                    </div>
                  </div>

                  <div class="prop-group">
                    <label>Elementos (Uno por línea)</label>
                    <textarea
                      :value="selectedElement.items.join('\n')"
                      @input="updateListItems(selectedElement, $event)"
                      class="pro-input"
                      rows="5"
                    ></textarea>
                  </div>

                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Color Texto</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.color"
                        @input="updateColorDebounced(selectedElement, 'color', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Tamaño</label
                      ><input type="number" v-model="selectedElement.fontSize" class="pro-input" />
                    </div>
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Fuente</label>
                      <select v-model="selectedElement.fontFamily" class="pro-input">
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Helvetica, Arial, sans-serif">Helvetica</option>
                        <option value="Georgia, serif">Georgia</option>
                      </select>
                    </div>
                    <div class="prop-group half">
                      <label>Espaciado (px)</label
                      ><input type="number" v-model="selectedElement.itemSpacing" class="pro-input" />
                    </div>
                  </div>
                </div>
              </template>

              <template v-if="selectedElement.type === 'checkbox' && activeInspectorTab === 'data'">
                <div class="prop-section">
                  <div class="section-title">Lista de Tareas</div>
                  <div
                    v-for="(item, idx) in selectedElement.items"
                    :key="idx"
                    class="accordion-edit-item"
                  >
                    <input type="checkbox" v-model="item.checked" class="themed-checkbox" />
                    <input
                      type="text"
                      v-model="item.text"
                      class="pro-input mb-0 compact-input"
                      placeholder="Tarea..."
                    />
                    <button class="btn-text-danger" @click="selectedElement.items.splice(idx, 1)">
                      <i class="ph ph-x"></i>
                    </button>
                  </div>
                  <button
                    class="btn-ghost w-100 mt-2"
                    @click="selectedElement.items.push({ text: 'Nueva tarea', checked: false })"
                  >
                    <i class="ph ph-plus"></i> Añadir Tarea
                  </button>

                  <div class="prop-row mt-2">
                    <div class="prop-group half">
                      <label>Color Texto</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.color"
                        @input="updateColorDebounced(selectedElement, 'color', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Color Check ✅</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.checkedColor"
                        @input="updateColorDebounced(selectedElement, 'checkedColor', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Tamaño</label>
                      <input type="number" v-model="selectedElement.fontSize" class="pro-input" />
                    </div>
                    <div class="prop-group half">
                      <label>Espaciado Y</label>
                      <input type="number" v-model="selectedElement.itemSpacing" class="pro-input" />
                    </div>
                  </div>
                  <label class="checkbox-label"
                    ><input type="checkbox" v-model="selectedElement.strikeThrough" /> Tachar texto al
                    completar</label
                  >
                </div>
              </template>

              <template v-if="['text', 'sticky'].includes(selectedElement.type) && activeInspectorTab === 'design'">
                <div class="prop-section">
                  <div class="section-title">Tipografía</div>
                  <div class="prop-group">
                    <textarea
                      v-model="selectedElement.content"
                      class="pro-input"
                      rows="4"
                      placeholder="Escribe tu texto aquí..."
                    ></textarea>
                  </div>
                  <div class="prop-group">
                    <label>Fuente</label>
                    <select v-model="selectedElement.fontFamily" class="pro-input">
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Helvetica, Arial, sans-serif">Helvetica</option>
                      <option value="'Times New Roman', serif">Times New Roman</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="'Courier New', monospace">Courier New</option>
                      <option value="'Verdana', sans-serif">Verdana</option>
                      <option value="'Comic Sans MS', cursive, sans-serif">
                        Handwriting / Cómic
                      </option>
                    </select>
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Tamaño</label
                      ><input type="number" v-model="selectedElement.fontSize" class="pro-input" />
                    </div>
                    <div class="prop-group half">
                      <label>Color Text</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        :value="selectedElement.color.startsWith('var') ? '#000000' : selectedElement.color"
                        @input="updateColorDebounced(selectedElement, 'color', $event)"
                        class="pro-color-picker"
                      />
                    </div>
                    </div>
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Grosor</label>
                      <select v-model="selectedElement.fontWeight" class="pro-input">
                        <option value="400">Normal</option>
                        <option value="600">Semibold</option>
                        <option value="800">Bold</option>
                      </select>
                    </div>
                    <div class="prop-group half">
                      <label>Estilo</label>
                      <select v-model="selectedElement.fontStyle" class="pro-input">
                        <option value="normal">Normal</option>
                        <option value="italic">Cursiva</option>
                      </select>
                    </div>
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Formato</label>
                      <select v-model="selectedElement.textTransform" class="pro-input">
                        <option value="none">Normal</option>
                        <option value="uppercase">MAYÚSCULAS</option>
                        <option value="lowercase">minúsculas</option>
                      </select>
                    </div>
                    <div class="prop-group half">
                      <label>Decoración</label>
                      <select v-model="selectedElement.textDecoration" class="pro-input">
                        <option value="none">Ninguna</option>
                        <option value="underline">Subrayado</option>
                        <option value="line-through">Tachado</option>
                      </select>
                    </div>
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Interlineado</label
                      ><input
                        type="number"
                        v-model="selectedElement.lineHeight"
                        step="0.1"
                        class="pro-input"
                      />
                    </div>
                    <div class="prop-group half">
                      <label>Espaciado (px)</label
                      ><input
                        type="number"
                        v-model="selectedElement.letterSpacing"
                        class="pro-input"
                      />
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Alineación</label>
                    <div class="align-buttons">
                      <button
                        class="tool-btn"
                        :class="{ active: selectedElement.textAlign === 'left' }"
                        @click="selectedElement.textAlign = 'left'"
                      >
                        <i class="ph ph-text-align-left"></i>
                      </button>
                      <button
                        class="tool-btn"
                        :class="{ active: selectedElement.textAlign === 'center' }"
                        @click="selectedElement.textAlign = 'center'"
                      >
                        <i class="ph ph-text-align-center"></i>
                      </button>
                      <button
                        class="tool-btn"
                        :class="{ active: selectedElement.textAlign === 'right' }"
                        @click="selectedElement.textAlign = 'right'"
                      >
                        <i class="ph ph-text-align-right"></i>
                      </button>
                      <button
                        class="tool-btn"
                        :class="{ active: selectedElement.textAlign === 'justify' }"
                        @click="selectedElement.textAlign = 'justify'"
                      >
                        <i class="ph ph-text-align-justify"></i>
                      </button>
                    </div>
                  </div>

                  <div class="prop-group" v-if="selectedElement.type === 'text'">
    <label>Fondo de Caja</label>
  <div class="color-picker-wrapper">
    <input
      type="color"
      :value="(selectedElement.textBgColor === 'transparent' || selectedElement.textBgColor.startsWith('var')) ? '#ffffff' : selectedElement.textBgColor"
      @input="updateColorDebounced(selectedElement, 'textBgColor', $event)"
      class="pro-color-picker"
    />
  </div>
    <button
      class="btn-text-danger mt-1"
      @click="selectedElement.textBgColor = 'transparent'"
    >
      Quitar Fondo
    </button>
  </div>
                  <div class="prop-group" v-if="selectedElement.type === 'sticky'">
                    <label>Color Papel</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                      :value="selectedElement.textBgColor"
                      @input="updateColorDebounced(selectedElement, 'textBgColor', $event)"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>

                  <div class="prop-group">
                    <label>Sombra CSS o Resplandor</label>
                    <select v-model="selectedElement.textShadow" class="pro-input mb-1">
                      <option value="none">Ninguna</option>
                      <option value="2px 2px 4px rgba(0,0,0,0.8)">Sombra Básica</option>
                      <option :value="`0 0 10px ${selectedElement.color}`">Resplandor Neón</option>
                    </select>
                  </div>
                </div>
              </template>

              <template v-if="selectedElement.type === 'codeblock' && activeInspectorTab === 'design'">
                <div class="prop-section">
                  <div class="section-title">Bloque de Código</div>
                  <div class="prop-group">
                    <textarea
                      v-model="selectedElement.content"
                      class="pro-input"
                      rows="6"
                      placeholder="Pega tu código aquí..."
                    ></textarea>
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Lenguaje</label>
                      <input
                        type="text"
                        v-model="selectedElement.language"
                        class="pro-input"
                        placeholder="ej. Javascript"
                      />
                    </div>
                    <div class="prop-group half">
                      <label>Tema</label>
                      <select v-model="selectedElement.theme" class="pro-input">
                        <option value="dark">Oscuro</option>
                        <option value="light">Claro</option>
                      </select>
                    </div>
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Tamaño Fuente</label
                      ><input type="number" v-model="selectedElement.fontSize" class="pro-input" />
                    </div>
                    <div class="prop-group half">
                      <label>Redondeo</label
                      ><input
                        type="number"
                        v-model="selectedElement.borderRadius"
                        class="pro-input"
                      />
                    </div>
                  </div>
                </div>
              </template>

              <template v-if="['shape', 'icon', 'arrow'].includes(selectedElement.type) && activeInspectorTab === 'design'">
                <div class="prop-section">
                  <div class="section-title">Estilo Visual</div>

                  <div class="prop-group" v-if="selectedElement.type === 'icon'">
    <label>Icono seleccionado</label>
    <button class="ipm-trigger-btn" @click="showIconPicker = true">
      <i :class="`ph ph-${selectedElement.iconName}`"></i>
      <span>{{ selectedElement.iconName }}</span>
      <i class="ph ph-caret-down" style="margin-left: auto; font-size: 0.8rem; opacity: 0.5;"></i>
    </button>
  </div>

                  <div class="prop-row mt-2" v-if="selectedElement.type === 'icon'">
                    <div class="prop-group half">
                      <label>Tamaño</label
                      ><input type="number" v-model="selectedElement.fontSize" class="pro-input" />
                    </div>
                    <div class="prop-group half">
                      <label>Color Icono</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.color"
                        @input="updateColorDebounced(selectedElement, 'color', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="prop-group" v-if="selectedElement.type === 'shape'">
                    <label>Color 1 (Principal)</label>
                  <div class="color-picker-wrapper">
                    <input
                      type="color"
                      :value="selectedElement.bgColor.startsWith('var') ? '#000000' : selectedElement.bgColor"
                      @input="updateColorDebounced(selectedElement, 'bgColor', $event)"
                      class="pro-color-picker"
                    />
                  </div>
                  </div>

                  <div class="prop-row" v-if="selectedElement.type === 'arrow'">
                    <div class="prop-group half">
                      <label>Grosor Línea</label
                      ><input type="number" v-model="selectedElement.strokeWidth" class="pro-input" />
                    </div>
                    <div class="prop-group half">
                      <label>Color</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.color"
                        @input="updateColorDebounced(selectedElement, 'color', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="prop-group" v-if="selectedElement.type === 'arrow'">
                    <label>Punta de flecha</label>
                    <select v-model="selectedElement.arrowHead" class="pro-input">
                      <option value="none">Ninguna</option>
                      <option value="end">Al final</option>
                      <option value="start">Al inicio</option>
                      <option value="both">Ambos lados</option>
                    </select>
                  </div>

                  <div class="prop-row" v-if="selectedElement.type === 'shape'">
                    <div class="prop-group half">
                      <label>Efecto Fondo</label>
                      <select v-model="selectedElement.gradientType" class="pro-input">
                        <option value="none">Sólido</option>
                        <option value="linear">Gradiente Lineal</option>
                        <option value="radial">Gradiente Radial</option>
                      </select>
                    </div>
                    <div
                      class="prop-group half"
                      v-if="selectedElement.gradientType && selectedElement.gradientType !== 'none'"
                    >
                      <label>Color 2</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        :value="selectedElement.gradientColor.startsWith('var') ? '#000000' : selectedElement.gradientColor"
                        @input="updateColorDebounced(selectedElement, 'gradientColor', $event)"
                        class="pro-color-picker"
                      />
                    </div>
                    </div>
                  </div>

                  <label class="checkbox-label" v-if="selectedElement.type === 'shape'"
                    ><input type="checkbox" v-model="selectedElement.isGlass" /> Cristal</label
                  >

                  <div class="prop-row mt-2" v-if="selectedElement.type === 'icon'">
                    <div class="prop-group half">
                      <label>Fondo Caja</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.bgColor"
                        @input="updateColorDebounced(selectedElement, 'bgColor', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Redondeo</label
                      ><input
                        type="number"
                        v-model="selectedElement.borderRadius"
                        class="pro-input"
                      />
                    </div>
                  </div>

                  <div class="prop-row mt-2" v-if="selectedElement.type === 'shape'">
                    <div class="prop-group half">
                      <label>Radio Esquinas</label
                      ><input
                        type="number"
                        v-model="selectedElement.borderRadius"
                        class="pro-input"
                      />
                    </div>
                    <div class="prop-group half">
                      <label>Grosor Borde</label
                      ><input type="number" v-model="selectedElement.borderWidth" class="pro-input" />
                    </div>
                  </div>

                  <div
                    class="prop-row"
                    v-if="selectedElement.type === 'shape' && selectedElement.borderWidth > 0"
                  >
                    <div class="prop-group half">
                      <label>Color Borde</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                      :value="selectedElement.borderColor.startsWith('var') ? '#000000' : selectedElement.borderColor"
                      @input="updateColorDebounced(selectedElement, 'borderColor', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Estilo Borde</label>
                      <select v-model="selectedElement.borderStyle" class="pro-input">
                        <option value="solid">Sólido</option>
                        <option value="dashed">Rayado</option>
                        <option value="dotted">Puntos</option>
                      </select>
                    </div>
                  </div>
                  <div class="prop-group" v-if="selectedElement.type === 'shape'">
                    <label>Sombra CSS</label
                    ><input
                      type="text"
                      v-model="selectedElement.boxShadow"
                      class="pro-input"
                      placeholder="ej: 0 4px 10px rgba(0,0,0,0.5)"
                    />
                  </div>
                </div>
              </template>

              <template v-if="selectedElement.type === 'rating' && activeInspectorTab === 'design'">
                <div class="prop-section">
                  <div class="section-title">Puntuación / Rating</div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Puntuación Inicial</label
                      ><input
                        type="number"
                        v-model="selectedElement.rating"
                        min="0"
                        :max="selectedElement.maxStars"
                        class="pro-input"
                      />
                    </div>
                    <div class="prop-group half">
                      <label>Estrellas Totales</label
                      ><input
                        type="number"
                        v-model="selectedElement.maxStars"
                        min="1"
                        max="10"
                        class="pro-input"
                      />
                    </div>
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Color</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.color"
                        @input="updateColorDebounced(selectedElement, 'color', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Tamaño Icono</label
                      ><input type="number" v-model="selectedElement.fontSize" class="pro-input" />
                    </div>
                  </div>
                  <label class="checkbox-label"
                    ><input type="checkbox" v-model="selectedElement.isInteractive" /> Editable en
                    presentación</label
                  >
                </div>
              </template>

              <template v-if="selectedElement.type === 'timer' && activeInspectorTab === 'design'">
                <div class="prop-section">
                  <div class="section-title">Temporizador</div>
                  <div class="prop-group">
                    <label>Minutos Totales</label
                    ><input
                      type="number"
                      v-model="selectedElement.duration"
                      class="pro-input"
                      min="1"
                      max="120"
                    />
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Color Texto</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.color.startsWith('var') ? '#000000' : selectedElement.color"
                        @input="updateColorDebounced(selectedElement, 'color', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Color Fondo</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.bgColor"
                        @input="updateColorDebounced(selectedElement, 'bgColor', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Tamaño Fuente</label
                      ><input type="number" v-model="selectedElement.fontSize" class="pro-input" />
                    </div>
                    <div class="prop-group half">
                      <label>Redondeo</label
                      ><input
                        type="number"
                        v-model="selectedElement.borderRadius"
                        class="pro-input"
                      />
                    </div>
                  </div>
                </div>
              </template>

              <template v-if="selectedElement.type === 'progress' && activeInspectorTab === 'design'">
                <div class="prop-section">
                  <div class="section-title">Barra de Progreso</div>
                  <div class="prop-group">
                    <label>Porcentaje Actual ({{ selectedElement.progress }}%)</label>
                    <input
                      type="range"
                      v-model="selectedElement.progress"
                      min="0"
                      max="100"
                      class="w-100"
                    />
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Color Relleno</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.color.startsWith('var') ? '#000000' : selectedElement.color"
                        @input="updateColorDebounced(selectedElement, 'color', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Color Carril</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.bgColor.startsWith('var') ? '#000000' : selectedElement.bgColor"
                        @input="updateColorDebounced(selectedElement, 'bgColor', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Redondeo Esquinas</label
                    ><input type="number" v-model="selectedElement.borderRadius" class="pro-input" />
                  </div>
                </div>
              </template>

              <template v-if="selectedElement.type === 'qrcode' && activeInspectorTab === 'design'">
                <div class="prop-section">
                  <div class="section-title">Código QR Dinámico</div>
                  <div class="prop-group">
                    <label>URL o Texto a codificar</label
                    ><input
                      type="text"
                      v-model="selectedElement.qrUrl"
                      class="pro-input"
                      placeholder="https://mi-web.com"
                    />
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Color Código</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.color.startsWith('var') ? '#000000' : selectedElement.color"
                        @input="updateColorDebounced(selectedElement, 'color', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Fondo QR</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.bgColor"
                        @input="updateColorDebounced(selectedElement, 'bgColor', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Redondeo Caja</label
                    ><input type="number" v-model="selectedElement.borderRadius" class="pro-input" />
                  </div>
                </div>
              </template>

              <template
                v-if="['image', 'video', 'iframe', '3d', 'magnifier'].includes(selectedElement.type) && activeInspectorTab === 'design'"
              >
                <div class="prop-section">
                  <div class="section-title">Fuente Multimedia</div>

                  <div
                    class="prop-group"
                    v-if="['image', 'video', '3d', 'magnifier'].includes(selectedElement.type)"
                  >
                    <label class="btn-ghost w-100 text-center block">
                      <input
                        type="file"
                        @change="handleLocalMediaUpload($event, selectedElement)"
                        :accept="
                          ['image', 'magnifier'].includes(selectedElement.type)
                            ? 'image/*'
                            : selectedElement.type === 'video'
                              ? 'video/mp4,video/webm'
                              : '.glb,.gltf'
                        "
                        hidden
                      />
                      <i class="ph ph-upload-simple"></i> Subir Archivo
                    </label>
                  </div>

                  <div class="prop-group mt-2">
                    <label>{{
                      selectedElement.type === 'iframe' ? 'URL del Iframe' : 'O Enlace Externo'
                    }}</label>
                    <input
                      type="text"
                      v-model="selectedElement.src"
                      class="pro-input"
                      placeholder="https://..."
                    />
                  </div>

                  <template v-if="selectedElement.type === 'magnifier'">
                    <div class="prop-group">
                      <label>Nivel de Zoom ({{ selectedElement.zoomLevel }}x)</label>
                      <input
                        type="range"
                        v-model="selectedElement.zoomLevel"
                        min="1"
                        max="5"
                        step="0.5"
                        class="w-100"
                      />
                    </div>
                    <div class="prop-row">
                      <div class="prop-group half">
                        <label>Enfoque X (%)</label
                        ><input
                          type="range"
                          v-model="selectedElement.focusX"
                          min="0"
                          max="100"
                          class="w-100"
                        />
                      </div>
                      <div class="prop-group half">
                        <label>Enfoque Y (%)</label
                        ><input
                          type="range"
                          v-model="selectedElement.focusY"
                          min="0"
                          max="100"
                          class="w-100"
                        />
                      </div>
                    </div>
                  </template>

                  <div class="prop-group" v-if="selectedElement.type === '3d'">
                    <label>Imagen Entorno (HDR/URL)</label
                    ><input
                      type="text"
                      v-model="selectedElement.envImage"
                      class="pro-input"
                      placeholder="Para reflejos reales"
                    />
                  </div>
                  <label class="checkbox-label mt-2" v-if="selectedElement.type === '3d'"
                    ><input type="checkbox" v-model="selectedElement.autoRotate" /> Auto-rotar</label
                  >
                  <label class="checkbox-label mt-2" v-if="selectedElement.type === '3d'"
                    ><input type="checkbox" v-model="selectedElement.cameraControls" />
                    Controles</label
                  >

                  <div class="prop-group" v-if="['image', 'video'].includes(selectedElement.type)">
                    <label>Ajuste</label>
                    <select v-model="selectedElement.fit" class="pro-input">
                      <option value="contain">Contener</option>
                      <option value="cover">Cubrir</option>
                      <option value="fill">Rellenar</option>
                    </select>
                  </div>
                </div>

                <div
                  class="prop-section"
                  v-if="['image', 'video', 'iframe', 'magnifier'].includes(selectedElement.type)"
                >
                  <div class="section-title">Bordes y Filtros</div>
                  <div class="prop-row" v-if="selectedElement.type !== 'magnifier'">
                    <div class="prop-group half">
                      <label>Radio</label
                      ><input
                        type="number"
                        v-model="selectedElement.borderRadius"
                        class="pro-input"
                      />
                    </div>
                    <div class="prop-group half">
                      <label>Borde Px</label
                      ><input type="number" v-model="selectedElement.borderWidth" class="pro-input" />
                    </div>
                  </div>
                  <div class="prop-row" v-else>
                    <div class="prop-group half">
                      <label>Grosor Marco</label
                      ><input type="number" v-model="selectedElement.borderWidth" class="pro-input" />
                    </div>
                  </div>

                  <div class="prop-group" v-if="selectedElement.borderWidth > 0">
                    <label>Color Borde</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        :value="selectedElement.borderColor"
                        @input="updateColorDebounced(selectedElement, 'borderColor', $event)"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>

                  <template v-if="selectedElement.type === 'image'">
                    <div class="prop-group">
                      <label>Blanco y Negro (%)</label
                      ><input
                        type="range"
                        v-model="selectedElement.grayscale"
                        min="0"
                        max="100"
                        class="w-100"
                      />
                    </div>
                    <div class="prop-group">
                      <label>Desenfoque (px)</label
                      ><input
                        type="range"
                        v-model="selectedElement.blur"
                        min="0"
                        max="20"
                        class="w-100"
                      />
                    </div>
                    <div class="prop-group">
                      <label>Sepia (%)</label
                      ><input
                        type="range"
                        v-model="selectedElement.sepia"
                        min="0"
                        max="100"
                        class="w-100"
                      />
                    </div>
                    <div class="prop-group mt-4" v-if="selectedElement.src">
      <button class="btn-primary w-100" @click="openCropper">
        <i class="ph ph-crop"></i> Recortar Imagen
      </button>
    </div>
                  </template>
                </div>

                <div
                  class="prop-section"
                  v-if="selectedElement.type === 'video' && !isYouTube(selectedElement.src)"
                >
                  <div class="section-title">Reproducción</div>
                  <label class="checkbox-label"
                    ><input type="checkbox" v-model="selectedElement.autoplay" />
                    Auto-reproducir</label
                  >
                  <label class="checkbox-label mt-2"
                    ><input type="checkbox" v-model="selectedElement.loop" /> Bucle</label
                  >
                  <label class="checkbox-label mt-2"
                    ><input type="checkbox" v-model="selectedElement.muted" /> Silenciado</label
                  >
                </div>
              </template>

              <template v-if="selectedElement.type === 'draw' && activeInspectorTab === 'design'">
                <div class="prop-section">
                  <div class="section-title">Rotulador</div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Grosor (px)</label
                      ><input
                        type="number"
                        v-model="selectedElement.brushSize"
                        class="pro-input"
                        min="1"
                        max="50"
                      />
                    </div>
                    <div class="prop-group half">
                      <label>Color</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.brushColor"
                        @input="updateColorDebounced(selectedElement, 'brushColor', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                  </div>
                  <button class="btn-secondary w-100 mt-2" @click="clearDrawCanvas(selectedElement)">
                    <i class="ph ph-eraser"></i> Borrar Trazos
                  </button>
                </div>
              </template>

              <template v-if="['chart', 'poll'].includes(selectedElement.type)">
                <div class="prop-section" v-show="activeInspectorTab === 'design'">
                  <div class="section-title">Estilo Visual</div>
                  <div class="prop-group">
                    <label>Título Superior</label
                    ><input type="text" v-model="selectedElement.chartTitle" class="pro-input" />
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Fondo Contenedor</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.bgColor"
                        @input="updateColorDebounced(selectedElement, 'bgColor', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Color Textos</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.color.startsWith('var') ? '#000000' : selectedElement.color"
                        @input="updateColorDebounced(selectedElement, 'color', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="prop-row" v-if="selectedElement.type === 'chart'">
                    <div class="prop-group half">
                      <label>Diseño</label>
                      <select v-model="selectedElement.chartType" class="pro-input">
                        <option value="bar">Barras (Vert)</option>
                        <option value="hbar">Barras (Horiz)</option>
                        <option value="pie">Circular</option>
                        <option value="donut">Anillo</option>
                      </select>
                    </div>
                    <div class="prop-group half">
                      <label>Radio Cajas</label
                      ><input
                        type="number"
                        v-model="selectedElement.borderRadius"
                        class="pro-input"
                      />
                    </div>
                  </div>
                  <div class="prop-group" v-if="selectedElement.type === 'poll'">
                    <label>Radio Cajas</label
                    ><input type="number" v-model="selectedElement.borderRadius" class="pro-input" />
                  </div>

                  <div class="prop-row" v-if="selectedElement.type === 'chart'">
                    <label class="checkbox-label half"
                      ><input type="checkbox" v-model="selectedElement.showValues" /> Valores</label
                    >
                    <label class="checkbox-label half"
                      ><input type="checkbox" v-model="selectedElement.showLegend" /> Leyenda</label
                    >
                  </div>
                </div>
                <div class="prop-section" v-show="activeInspectorTab === 'data'">
                  <div class="section-title">Datos (Data)</div>
                  <div class="chart-data-list">
                    <div
                      v-for="(item, idx) in selectedElement.chartData"
                      :key="idx"
                      class="data-item-card"
                      style="
                        background: rgba(255, 255, 255, 0.05);
                        padding: 8px;
                        border-radius: 6px;
                        margin-bottom: 8px;
                        border: 1px solid #30363d;
                      "
                    >
                      <div
                        class="data-header"
                        style="display: flex; justify-content: space-between; align-items: center"
                      >
                        <input
                          type="text"
                          v-model="item.label"
                          class="pro-input"
                          style="padding: 4px 8px; font-size: 0.8rem"
                          placeholder="Etiqueta"
                        />
                        <button
                          class="btn-text-danger"
                          @click="selectedElement.chartData.splice(idx, 1)"
                        >
                          <i class="ph ph-x"></i>
                        </button>
                      </div>
                      <div class="prop-row mb-0 mt-2">
                        <input
                          type="number"
                          v-model="item.value"
                          class="pro-input half"
                          style="padding: 4px 8px"
                          placeholder="Valor"
                        />
                        <input
                          type="color"
                        :value="item.color.startsWith('var') ? '#000000' : item.color"
                        @input="updateColorDebounced(item, 'color', $event)"
                          class="pro-color-picker half"
                          style="height: 28px"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    class="btn-ghost w-100 mt-2"
                    @click="
                      selectedElement.chartData.push({ label: 'Nuevo', value: 50, color: '#3b82f6' })
                    "
                  >
                    <i class="ph ph-plus"></i> Añadir Fila
                  </button>
                </div>
              </template>

              <template v-if="selectedElement.type === 'audio' && activeInspectorTab === 'design'">
                <div class="prop-section">
                  <div class="section-title">Botón de Audio</div>

                  <div class="prop-group">
                    <label>Variante de Diseño</label>
                    <select v-model="selectedElement.variant" class="pro-input">
                      <option value="pill">Píldora Moderna</option>
                      <option value="minimal">Icono Minimalista</option>
                      <option value="floating">Botón Flotante</option>
                    </select>
                  </div>

                  <div class="prop-group file-upload-group mt-2">
                    <label class="btn-ghost w-100 text-center block">
                      <input
                        type="file"
                        @change="handleLocalMediaUpload($event, selectedElement)"
                        accept="audio/*"
                        hidden
                      />
                      <i class="ph ph-upload-simple"></i> Subir Pista Local
                    </label>
                  </div>
                  <div class="prop-group mt-2">
                    <label>O URL Externa</label
                    ><input
                      type="text"
                      v-model="selectedElement.src"
                      class="pro-input"
                      placeholder="https://..."
                    />
                  </div>

                  <div class="prop-row mt-4">
                    <div class="prop-group half">
                      <label>Color Fondo</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.bgColor"
                        @input="updateColorDebounced(selectedElement, 'bgColor', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Color Icono</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.color.startsWith('var') ? '#000000' : selectedElement.color"
                        @input="updateColorDebounced(selectedElement, 'color', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Redondeo (Bordes)</label
                    ><input type="number" v-model="selectedElement.borderRadius" class="pro-input" />
                  </div>
                  <label class="checkbox-label"
                    ><input type="checkbox" v-model="selectedElement.loop" /> Bucle (Loop)</label
                  >
                  <label class="checkbox-label mt-1"
                    ><input type="checkbox" v-model="selectedElement.autoplay" /> Autoplay</label
                  >
                </div>
              </template>

              <template v-if="selectedElement.type === 'interactive' && activeInspectorTab === 'interactivity'">
                <div class="prop-section">
                  <div class="section-title">Hotspot Interactivo</div>
                  <div class="prop-group">
                    <label>Color del Pulso</label>
                    <div class="color-picker-wrapper">
                    <input type="color" :value="selectedElement.color.startsWith('var') ? '#000000' : selectedElement.color" @input="updateColorDebounced(selectedElement, 'color', $event)" class="pro-color-picker" />
                    </div>
                  </div>
                  <div class="prop-group section-divider">Ventana Desplegable</div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Fondo Ventana</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.modalBgColor"
                        @input="updateColorDebounced(selectedElement, 'modalBgColor', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Texto Ventana</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.modalTextColor"
                        @input="updateColorDebounced(selectedElement, 'modalTextColor', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Título Principal</label
                    ><input type="text" v-model="selectedElement.modalTitle" class="pro-input" />
                  </div>
                  <div class="prop-group">
                    <label>Contenido HTML</label
                    ><textarea
                      v-model="selectedElement.contentHtml"
                      class="pro-input"
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              </template>

              <template v-if="selectedElement.type === 'link' && activeInspectorTab === 'interactivity'">
                <div class="prop-section">
                  <div class="section-title">Botón de Navegación</div>
                  <div class="prop-group">
                    <label>Texto del Botón</label
                    ><input type="text" v-model="selectedElement.text" class="pro-input" />
                  </div>
                  <div class="prop-group">
                    <label>Saltar a Diapositiva</label
                    ><input
                      type="number"
                      v-model="selectedElement.targetPage"
                      min="1"
                      :max="numPages"
                      class="pro-input"
                    />
                  </div>
                  <div class="prop-row mt-2">
                    <div class="prop-group half">
                      <label>Color Fondo</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.bgColor.startsWith('var') ? '#000000' : selectedElement.bgColor"
                        @input="updateColorDebounced(selectedElement, 'bgColor', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Color Texto</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.color.startsWith('var') ? '#000000' : selectedElement.color"
                        @input="updateColorDebounced(selectedElement, 'color', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Redondeo</label
                      ><input
                        type="number"
                        v-model="selectedElement.borderRadius"
                        class="pro-input"
                      />
                    </div>
                    <div class="prop-group half">
                      <label>Borde Px</label
                      ><input type="number" v-model="selectedElement.borderWidth" class="pro-input" />
                    </div>
                  </div>
                  <div class="prop-group" v-if="selectedElement.borderWidth > 0">
                    <label>Color Borde</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        :value="selectedElement.borderColor"
                        @input="updateColorDebounced(selectedElement, 'borderColor', $event)"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Fuente</label>
                      <select
                        v-model="selectedElement.fontFamily"
                        class="pro-input"
                        style="padding: 4px"
                      >
                        <option value="Helvetica, Arial, sans-serif">Helvetica</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                    </div>
                    <div class="prop-group half">
                      <label>Tamaño</label
                      ><input type="number" v-model="selectedElement.fontSize" class="pro-input" />
                    </div>
                  </div>
                </div>
              </template>

              <template v-if="selectedElement.type === 'accordion' && activeInspectorTab === 'interactivity'">
                <div class="prop-section">
                  <div class="section-title">Acordeón Desplegable</div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Color Base</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.bgColor.startsWith('var') ? '#000000' : selectedElement.bgColor"
                        @input="updateColorDebounced(selectedElement, 'bgColor', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                    <div class="prop-group half">
                      <label>Color Textos</label>
                      <div class="color-picker-wrapper">
                        <input
                          type="color"
                        :value="selectedElement.color.startsWith('var') ? '#000000' : selectedElement.color"
                        @input="updateColorDebounced(selectedElement, 'color', $event)"
                          class="pro-color-picker"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="prop-group section-divider">Secciones</div>
                  <div
                    v-for="(item, index) in selectedElement.items"
                    :key="index"
                    class="accordion-edit-item"
                  >
                    <input
                      type="text"
                      v-model="item.title"
                      class="pro-input mb-1"
                      placeholder="Título..."
                    />
                    <textarea
                      v-model="item.content"
                      class="pro-input"
                      rows="2"
                      placeholder="Contenido..."
                    ></textarea>
                    <button
                      class="btn-text-danger mt-1"
                      @click="selectedElement.items.splice(index, 1)"
                    >
                      <i class="ph ph-x"></i> Eliminar
                    </button>
                  </div>
                  <button class="btn-ghost w-100 mt-2" @click="addAccordionSection">
                    <i class="ph ph-plus"></i> Añadir Sección
                  </button>
                </div>
              </template>

              <template v-if="selectedElement.type === 'imagecomparator' && activeInspectorTab === 'design'">
                <div class="prop-section">
                  <div class="section-title">Comparador de Imágenes</div>
                  <div class="prop-group">
                    <label>Imagen Antes</label>
                    <label class="btn-ghost w-100 text-center">
                      <input type="file" @change="handleComparatorUpload($event, selectedElement, 'imageBefore')" accept="image/*" hidden />
                      <i class="ph ph-image"></i>
                      {{ selectedElement.imageBefore ? 'Cambiar Imagen Antes' : 'Subir Imagen Antes' }}
                    </label>
                  </div>
                  <div class="prop-group">
                    <label>Imagen Después</label>
                    <label class="btn-ghost w-100 text-center">
                      <input type="file" @change="handleComparatorUpload($event, selectedElement, 'imageAfter')" accept="image/*" hidden />
                      <i class="ph ph-image"></i>
                      {{ selectedElement.imageAfter ? 'Cambiar Imagen Después' : 'Subir Imagen Después' }}
                    </label>
                  </div>
                  <div class="prop-group">
                    <label>Posición del Deslizador (%)</label>
                    <input type="range" min="0" max="100" v-model.number="selectedElement.sliderPosition" class="pro-input" />
                    <div class="metric-value">{{ selectedElement.sliderPosition }}%</div>
                  </div>
                  <div class="prop-row">
                    <div class="prop-group half">
                      <label>Borde</label>
                      <input type="number" min="0" v-model.number="selectedElement.borderWidth" class="pro-input" />
                    </div>
                    <div class="prop-group half">
                      <label>Radio</label>
                      <input type="number" min="0" v-model.number="selectedElement.borderRadius" class="pro-input" />
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Color Borde</label>
                    <div class="color-picker-wrapper">
                      <input type="color" :value="selectedElement.borderColor" @input="updateColorDebounced(selectedElement, 'borderColor', $event)" class="pro-color-picker" />
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Sombra</label>
                    <input type="text" v-model="selectedElement.boxShadow" class="pro-input" placeholder="0 4px 6px rgba(0,0,0,0.1)" />
                  </div>
                </div>
              </template>

              <template v-if="selectedElement.type === 'marquee' && activeInspectorTab === 'design'">
                <div class="prop-section">
                  <div class="section-title">Marquesina</div>
                  <div class="prop-group">
                    <label>Texto</label>
                    <textarea v-model="selectedElement.content" class="pro-input" rows="3" placeholder="Texto a desplazar..."></textarea>
                  </div>
                  <div class="prop-group">
                    <label>Velocidad (1-100)</label>
                    <input type="range" min="1" max="100" v-model.number="selectedElement.speed" class="pro-input" />
                    <div class="metric-value">{{ selectedElement.speed }}/100</div>
                  </div>
                  <div class="prop-group">
                    <label>Color Texto</label>
                    <div class="color-picker-wrapper">
                      <input type="color" :value="selectedElement.color" @input="updateColorDebounced(selectedElement, 'color', $event)" class="pro-color-picker" />
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Tamaño Fuente</label>
                    <input type="number" min="8" v-model.number="selectedElement.fontSize" class="pro-input" />
                  </div>
                  <div class="prop-group">
                    <label>Peso Fuente</label>
                    <select v-model="selectedElement.fontWeight" class="pro-input">
                      <option value="400">Normal</option>
                      <option value="600">Semibold</option>
                      <option value="700">Bold</option>
                      <option value="800">Extra Bold</option>
                    </select>
                  </div>
                  <div class="prop-group">
                    <label>Tipografía</label>
                    <select v-model="selectedElement.fontFamily" class="pro-input">
                      <option value="Helvetica, Arial, sans-serif">Helvetica</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="'Courier New', monospace">Courier</option>
                      <option value="'Comic Sans MS', cursive">Comic Sans</option>
                    </select>
                  </div>
                  <div class="prop-group">
                    <label>Fondo</label>
                    <div class="color-picker-wrapper">
                      <input type="color" :value="selectedElement.bgColor === 'transparent' ? '#ffffff' : selectedElement.bgColor" @input="updateColorDebounced(selectedElement, 'bgColor', $event)" class="pro-color-picker" />
                    </div>
                  </div>
                </div>
              </template>

              <template v-if="selectedElement.type === 'typewriter' && activeInspectorTab === 'design'">
                <div class="prop-section">
                  <div class="section-title">Máquina de Escribir</div>
                  <div class="prop-group">
                    <label>Texto</label>
                    <textarea v-model="selectedElement.content" class="pro-input" rows="3" placeholder="Texto a escribir..."></textarea>
                  </div>
                  <div class="prop-group">
                    <label>Velocidad de Escritura (ms)</label>
                    <input type="range" min="10" max="500" step="10" v-model.number="selectedElement.typingSpeed" class="pro-input" />
                    <div class="metric-value">{{ selectedElement.typingSpeed }}ms por carácter</div>
                  </div>
                  <div class="prop-group">
                    <label>Color Texto</label>
                    <div class="color-picker-wrapper">
                      <input type="color" :value="selectedElement.color" @input="updateColorDebounced(selectedElement, 'color', $event)" class="pro-color-picker" />
                    </div>
                  </div>
                  <div class="prop-group">
                    <label>Tamaño Fuente</label>
                    <input type="number" min="8" v-model.number="selectedElement.fontSize" class="pro-input" />
                  </div>
                  <div class="prop-group">
                    <label>Peso Fuente</label>
                    <select v-model="selectedElement.fontWeight" class="pro-input">
                      <option value="400">Normal</option>
                      <option value="600">Semibold</option>
                      <option value="700">Bold</option>
                      <option value="800">Extra Bold</option>
                    </select>
                  </div>
                  <div class="prop-group">
                    <label>Tipografía</label>
                    <select v-model="selectedElement.fontFamily" class="pro-input">
                      <option value="Helvetica, Arial, sans-serif">Helvetica</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="'Courier New', monospace">Courier</option>
                      <option value="'Comic Sans MS', cursive">Comic Sans</option>
                    </select>
                  </div>
                  <div class="prop-group">
                    <label>Fondo</label>
                    <div class="color-picker-wrapper">
                      <input type="color" :value="selectedElement.bgColor === 'transparent' ? '#ffffff' : selectedElement.bgColor" @input="updateColorDebounced(selectedElement, 'bgColor', $event)" class="pro-color-picker" />
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <div class="panel-content empty-state" v-else>
              <div class="empty-icon-wrapper empty-panel-icon">
                <i class="ph ph-monitor"></i>
              </div>
              <p class="section-subtitle section-subtitle-center">
                Diapositiva {{ pageNum }}
              </p>

              <div class="prop-section text-left mt-4">
                <div class="section-title">Fondo Base y Transición</div>
                <div class="prop-group mt-2">
                  <label>Transición de Entrada</label>
                  <select v-model="slideConfigs[pageNum].transition" class="pro-input">
                    <option value="none">Ninguna</option>
                    <option value="dissolve">Desvanecer (Dissolve / Fade)</option>
                    <option value="slide-up">Deslizar Arriba</option>
                    <option value="push-left">Empujar Izquierda</option>
                    <option value="push-right">Empujar Derecha</option>
                    <option value="wipe">Barrido (Wipe)</option>
                    <option value="zoom">Zoom</option>
                  </select>
                </div>
                <div class="prop-group mt-2">
                  <label>Color Sólido</label>
                <div class="color-picker-wrapper">
                  <input
                    type="color"
                    :value="slideConfigs[pageNum].bgColor"
                    @input="updateColorDebounced(slideConfigs[pageNum], 'bgColor', $event, () => renderPage(pageNum))"
                    class="pro-color-picker"
                  />
                  <span class="color-hex">{{ slideConfigs[pageNum].bgColor.toUpperCase() }}</span>
                </div>
                </div>
                <div class="prop-group mt-2">
                  <label>Imagen de Fondo</label>
                  <label class="btn-ghost w-100 text-center block">
                    <input type="file" @change="setSlideBackgroundImage" accept="image/*" hidden />
                    <i class="ph ph-image"></i>
                    {{ slideConfigs[pageNum].bgImage ? 'Cambiar Imagen' : 'Subir Imagen' }}
                  </label>
                  <button
                    v-if="slideConfigs[pageNum].bgImage"
                    class="btn-text-danger w-100 mt-1"
                    @click="removeBackgroundImage"
                  >
                    Eliminar imagen actual
                  </button>
                </div>
              </div>

              <div
                class="info-box mt-4 text-left status-card"
                v-if="docType === 'pptx'"
              >
                <span class="status-card-row">
                  <i class="ph ph-check-circle status-card-icon"></i>
                  <small class="status-card-copy"
                    >PPTX convertido a alta calidad mediante API externa. Todo el contenido es
                    nativo.</small
                  >
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div
        v-if="showTemplateModal"
        class="loading-overlay modal-overlay template-gallery-overlay"
        @click.self="showTemplateModal = false"
      >
        <div class="new-project-modal template-gallery-modal">
          <div class="modal-header template-gallery-header">
            <h3><i class="ph ph-layout text-accent"></i> Galería de Plantillas</h3>
            <button class="btn-icon-danger" @click="showTemplateModal = false">
              <i class="ph ph-x"></i>
            </button>
          </div>

          <div class="tsp-grid template-gallery-grid">
            <div class="tsp-card" :class="{ 'is-active': projectConfigs.template === 'blank' }" @click="projectConfigs.template = 'blank'; isCustomTemplateMode = false; showTemplateModal = false; addNewSlide()">
              <div class="tsp-preview tsp-preview-blank">
                <div class="tsp-preview-line tsp-preview-line-blank"></div>
              </div>
              <span class="tsp-name mt-1">En blanco</span>
            </div>

            <div class="tsp-card" :class="{ 'is-active': projectConfigs.template === 'modern' }" @click="projectConfigs.template = 'modern'; isCustomTemplateMode = false; showTemplateModal = false; addNewSlide()">
              <div class="tsp-preview tsp-preview-modern">
                <div class="tsp-preview-header-bar"></div>
                <div class="tsp-preview-content">
                  <div class="tsp-preview-line tsp-preview-line-modern"></div>
                </div>
              </div>
              <span class="tsp-name mt-1">Moderna</span>
            </div>

            <div class="tsp-card" :class="{ 'is-active': projectConfigs.template === 'dark' }" @click="projectConfigs.template = 'dark'; isCustomTemplateMode = false; showTemplateModal = false; addNewSlide()">
              <div class="tsp-preview tsp-preview-dark">
                <div class="tsp-preview-line tsp-preview-line-dark"></div>
              </div>
              <span class="tsp-name mt-1">Oscura</span>
            </div>

            <div
              v-for="tpl in userGalleryTemplates"
              :key="tpl._id"
              class="tsp-card"
              @click="applyExternalTemplate(tpl); showTemplateModal = false;"
            >
              <div
                class="tsp-preview"
                :style="tpl.coverImage ? { backgroundImage: `url(${tpl.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}"
              >
                <span v-if="!tpl.coverImage" style="font-size:1.5rem;">🖼️</span>
              </div>
              <span class="tsp-name mt-1">{{ tpl.title }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
          v-if="showCropperModal"
          class="loading-overlay modal-overlay cropper-modal-overlay"
        >
          <div class="new-project-modal cropper-modal">
            <div class="modal-header">
              <h3>Recortar y Editar Imagen</h3>
              <button class="btn-icon-danger" @click="closeCropper">
                <i class="ph ph-x"></i>
              </button>
            </div>

            <div class="cropper-stage">
              <img
                ref="cropperImgRef"
                :src="selectedElement?.src"
                class="cropper-stage-image"
                crossorigin="anonymous"
              />
            </div>

            <div class="modal-actions modal-actions-split mt-4 pt-4">
              <div class="modal-inline-actions">
                <button class="btn-secondary" @click="rotateImage(-90)" title="Rotar Izquierda">
                  <i class="ph ph-arrow-counter-clockwise"></i>
                </button>
                <button class="btn-secondary" @click="rotateImage(90)" title="Rotar Derecha">
                  <i class="ph ph-arrow-clockwise"></i>
                </button>
                <button class="btn-secondary" @click="flipImage" title="Voltear Horizontal">
                  <i class="ph ph-arrows-left-right"></i>
                </button>
              </div>

              <div style="display: flex; gap: 8px;">
                <button class="btn-ghost" @click="closeCropper">Cancelar</button>
                <button class="btn-primary" @click="applyCrop">
                  <i class="ph ph-check"></i> Aplicar Recorte
                </button>
              </div>
            </div>
          </div>
        </div>
  <IconPickerModal
    v-model="showIconPicker"
    :selected-icon="selectedElement?.iconName"
    @select="(name) => { if (selectedElement) selectedElement.iconName = name }"
  />

  <Chatbot
    :currentPage="pageNum"
    :documentState="documentState"
    :slideConfigs="slideConfigs"
    :numPages="numPages"
    @ai-action="handleAiAction"
  />
</div>
</template>
  <script setup lang="ts">
  import IconPickerModal from '@/components/IconPickerModal.vue'
  import Chatbot from '@/components/AIChatBot.vue'
  const showIconPicker = ref(false)
  import { ref, computed, watch ,markRaw, onMounted, onUnmounted, nextTick, shallowRef, defineAsyncComponent } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import EditorHeader from '@/components/EditorHeader.vue'
  import LeafletMapElement from '@/components/LeafletMapElement.vue'
  import { useAuthStore } from '@/stores/auth';
  import { presentationService } from '@/services/presentacion.service'; // 👈 AÑADE ESTA LÍNEA
  import { templateService } from '@/services/template.service';
  import { PRESENTATIONS_API, API_BASE as API_BASE_CONFIG } from '@/config/api.js'
  import pako from 'pako';
  import Cropper from 'cropperjs';
  import html2canvas from 'html2canvas';
  import JSZip from 'jszip';

const isSafariBrowser = (() => {
  const ua = navigator.userAgent;
  return /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(ua);
})();

// --- REFAC: Lazy load de PdfViewer y pdfjs-dist ---
const PdfViewer = defineAsyncComponent(() => import('@/components/PdfViewer.vue'));

let pdfjsLibInstance: any = null;
const getPdfjsLib = async () => {
  if (pdfjsLibInstance) return pdfjsLibInstance;
  const pdfLib = await import('pdfjs-dist');
  // @ts-ignore
  const { default: PdfWorker } = await import('pdfjs-dist/build/pdf.worker.min.js?worker');
  pdfLib.GlobalWorkerOptions.workerPort = new PdfWorker();
  pdfjsLibInstance = pdfLib;
  return pdfLib;
};

// --- NUEVO: TIMELINE ANIMATOR PARA EL PLAYMODE ---
const currentAnimationStep = ref(0);

const maxAnimationStep = computed(() => {
  if (!currentPageElements.value) return 0;
  return Math.max(0, ...currentPageElements.value.map(el => el.animationOrder || 0));
});

const advancePresentation = () => {
  if (currentAnimationStep.value < maxAnimationStep.value) {
    currentAnimationStep.value++;
  } else if (pageNum.value < numPages.value) {
    changePageTo(pageNum.value + 1);
  }
};

// --- NUEVO: MOTOR DE TEMAS (VARIABLES CSS) ---
const themeVariables = computed(() => {
  const t = projectConfigs.value.template || 'blank';
  if (t === 'modern') return { '--pres-bg': '#f8fafc', '--pres-text': '#1e293b', '--pres-accent': 'var(--accent-primary)' };
  if (t === 'dark') return { '--pres-bg': '#0d1117', '--pres-text': '#f5f7fb', '--pres-accent': 'var(--accent-primary)' };
  return { '--pres-bg': '#ffffff', '--pres-text': '#1e293b', '--pres-accent': 'var(--accent-primary)' };
});

// --- NUEVO: ESTADO PARA LAS MINIATURAS GENERADAS ---
const generatedThumbnails = ref<Record<number, string>>({});
const isSaveInFlight = ref(false);
const hasTemplateClosingSlide = ref(false);
const hasUnsavedChanges = ref(false);
const DRAFT_STORAGE_KEY = 'docflow:editor:draft:v1';
const lastRouteLoadKey = ref('');

// --- NUEVO: EDA FIGMA MODE ---
const isSelectingTargetForEvent = ref<string | null>(null);

const getElementDisplayName = (el: any) => {
  const name = el.name || el.type.toUpperCase();
  let excerpt = '';
  if (el.type === 'text') excerpt = el.content;
  else if (el.type === 'link') excerpt = el.text;
  else if (el.type === 'checkbox' && el.items?.length > 0) excerpt = el.items[0].text;
  else if (el.type === 'accordion' && el.items?.length > 0) excerpt = el.items[0].title;
  else if (el.type === 'list' && el.items?.length > 0) excerpt = el.items[0];
  else if (el.type === 'poll' || el.type === 'chart') excerpt = el.chartTitle;
  else if (el.type === 'interactive') excerpt = el.modalTitle;

  if (excerpt) {
    if (excerpt.length > 20) excerpt = excerpt.substring(0, 20) + '...';
    return `${name}: "${excerpt}"`;
  }
  return `${name} (${el.id.substring(3, 7)})`;
};
  const authStore = useAuthStore();

  // --- REORDENACIÓN DE DIAPOSITIVAS POR DRAG & DROP Y POS. NUMÉRICA ---
const thumbDragSource = ref<number | null>(null)
const thumbDragTarget = ref<number | null>(null)
const thumbEditingPage = ref<number | null>(null)
const thumbPosInputRef = ref<HTMLInputElement | null>(null)


  // --- NUEVO: FUNCIÓN PARA CAPTURAR PREVIEW DEL LIENZO ---
// --- NUEVO: FUNCIÓN PARA CAPTURAR PREVIEW DEL LIENZO (ALTA FIDELIDAD) ---
// --- NUEVO: FUNCIÓN PARA CAPTURAR PREVIEW (A PRUEBA DE BALAS) ---
const captureThumbnail = async () => {
  if (playMode.value || isConverting.value || isLoadingProject.value) return;

  const slideNode = document.querySelector('.canvas-shadow-box') as HTMLElement;
  if (!slideNode) return;

  try {
    // 1. Fijamos un ancho estándar en píxeles para todas las miniaturas (ej. 320px).
    // Esto mantiene el rendimiento al máximo y el peso en RAM al mínimo.
    const THUMBNAIL_WIDTH = 320;

    // 2. Calculamos la escala pura basada SÓLO en la resolución original de tu diapositiva.
    // Al forzar esta escala en html2canvas, anulamos por completo el window.devicePixelRatio (Zoom de Windows).
    const exactScale = THUMBNAIL_WIDTH / baseWidth.value;

    // Safari rompe en html2canvas al clonar el documento (document.write) por scripts inyectados de extensiones.
    // Aquí usamos una ruta alternativa que no usa ese flujo interno.
    if (isSafariBrowser) {
      const { toJpeg } = await import('html-to-image');
      generatedThumbnails.value[pageNum.value] = await toJpeg(slideNode, {
        cacheBust: true,
        skipFonts: true,
        quality: 0.8,
        pixelRatio: 1,
        width: baseWidth.value,
        height: baseHeight.value,
        canvasWidth: Math.round(baseWidth.value * exactScale * 2.0),
        canvasHeight: Math.round(baseHeight.value * exactScale * 2.0),
        backgroundColor: currentBgColor.value || '#ffffff'
      });
      return;
    }

    const canvas = await html2canvas(slideNode, {
      scale: exactScale * 2.0, // Aumentamos la calidad de las miniaturas
      width: baseWidth.value,
      height: baseHeight.value,
      useCORS: true,
      logging: false,
      backgroundColor: currentBgColor.value || '#ffffff',
      allowTaint: true,
      ignoreElements: (el) => el.tagName === 'SCRIPT',

      // ✨ EL TRUCO MAESTRO: Interceptar el clon antes de la foto
      onclone: (clonedDoc) => {
        // Encontramos el contenedor que tiene el zoom y el paneo de tu editor
        const wrapper = clonedDoc.querySelector('.canvas-wrapper');
        if (wrapper) {
          // Le borramos TODO el transform (zoom, panX, panY) en esta copia invisible.
          // De esta forma, html2canvas procesa la diapositiva en su estado nativo y perfecto.
          wrapper.style.transform = 'none';
        }
      }
    });

    // Guardamos la foto generada
    generatedThumbnails.value[pageNum.value] = canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.warn("No se pudo generar la miniatura:", error);
  }
};

const onThumbDragStart = (e: DragEvent, page: number) => {
  if (isTemplateCreatorMode.value) return
  thumbDragSource.value = page
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(page))
  }
}
const handleAiAction = async (actionsData: any) => {
  console.log("🔥 [handleAiAction] TRIGGERED! Recibiendo datos:", actionsData);

  // Garantizamos que actionsData sea un array
  const actions = Array.isArray(actionsData) ? actionsData : [actionsData];

  console.log("📋 [handleAiAction] Acciones parseadas:", {
    actionCount: actions.length,
    currentPage: pageNum.value,
    actions: actions
  });

  if (!actions || actions.length === 0) {
    console.warn("⚠️ [handleAiAction] No hay acciones para ejecutar.");
    return;
  }

  const currentPage = pageNum.value;
  let hasMadeChanges = false;

  // 🔥 PROCESAMOS CADA ACCIÓN
  for (const action of actions) {
    const targetPage = Number(action.targetPage || action.slideNum || pageNum.value);

    console.log(`⚡ [handleAiAction] Ejecutando acción en pág ${targetPage}: ${action.actionType}`, action);

    // 🔒 SEGURIDAD: Garantizamos que la diapositiva específica existe
    if (!documentState.value[targetPage]) {
      console.log(`⚙️ [handleAiAction] Creando documentState[${targetPage}]`);
      documentState.value[targetPage] = [];
    }
    if (!slideConfigs.value[targetPage]) {
      console.log(`⚙️ [handleAiAction] Creando slideConfigs[${targetPage}]`);
      slideConfigs.value[targetPage] = { bgColor: '#ffffff', bgImage: null, transition: 'none' };
    }

    const rawActionType = (action.actionType || action.type || '').toString();
    const actionType = rawActionType.trim();
    const actionTypeNormalized = actionType.replace(/[_\s]/g, '').toLowerCase();
    const isSpecialAction = ['addtext', 'addshape', 'addicon', 'changebackground', 'addslide', 'deleteelement', 'modifyelement', 'addimage', 'addvideo', 'addtable', 'addchart', 'addqrcode', 'addlist', 'addcodeblock', 'addlink', 'deletelastelement', 'add3d', 'addiframe'].includes(actionTypeNormalized);
    const handledExplicitly = false;

    if (!actionType) {
      console.warn("Acción sin tipo:", action);
      continue;
    }

    try {
      // ==========================================
      // 📝 ACCIÓN: AÑADIR TEXTO
      // ==========================================
      if (actionTypeNormalized === 'addtext') {
        const newText = createTemplateElement('text', {
          content: action.content || 'Texto generado por IA',
          x: action.x ?? (baseWidth.value / 2) - 150,
          y: action.y ?? (baseHeight.value / 2) - 30,
          width: action.width ?? 300,
          height: action.height ?? 'auto',
          color: action.color || '#1e293b',
          fontSize: action.fontSize || 48,
          fontWeight: action.fontWeight || '800',
          fontFamily: action.fontFamily || 'Arial',
          textAlign: action.textAlign || 'left',
          opacity: action.opacity ?? 1,
          rotation: action.rotation ?? 0,
          lineHeight: 1.2,
          letterSpacing: 0,
          textShadow: 'none',
          textBgColor: 'transparent',
          boxShadow: 'none',
        });

        // 🔥 CLAVE: Usar spread operator para disparar reactividad
        documentState.value[targetPage] = [...documentState.value[targetPage], newText];
        selectedElementIds.value = [newText.id];
        activeTool.value = 'select';
        hasMadeChanges = true;
        showToast('✨ Texto añadido por la IA', 'success');
      }

      // ==========================================
      // 🟥 ACCIÓN: AÑADIR FORMA
      // ==========================================
      else if (actionType === 'addShape') {
        const newShape = createTemplateElement('shape', {
          bgColor: action.bgColor || action.color || '#2563eb',
          x: action.x ?? (baseWidth.value / 2) - 100,
          y: action.y ?? (baseHeight.value / 2) - 100,
          width: action.width ?? 200,
          height: action.height ?? 200,
          borderRadius: action.borderRadius ?? 12,
          borderStyle: 'none',
          borderColor: '#000000',
          borderWidth: 1,
          opacity: action.opacity ?? 1,
          rotation: action.rotation ?? 0,
          boxShadow: 'none',
        });

        // 🔥 CLAVE: Usar spread operator para disparar reactividad
        documentState.value[targetPage] = [...documentState.value[targetPage], newShape];
        selectedElementIds.value = [newShape.id];
        activeTool.value = 'select';
        hasMadeChanges = true;
        showToast('✨ Forma añadida por la IA', 'success');
      }

      // ==========================================
      // ⭐ ACCIÓN: AÑADIR ICONO
      // ==========================================
      else if (actionType === 'addIcon') {
        const newIcon = createTemplateElement('icon', {
          iconName: action.iconName || 'ph-star',
          x: action.x ?? (baseWidth.value / 2) - 32,
          y: action.y ?? (baseHeight.value / 2) - 32,
          width: action.width ?? 64,
          height: action.height ?? 64,
          color: action.color || '#2563eb',
          opacity: action.opacity ?? 1,
          rotation: action.rotation ?? 0,
          boxShadow: 'none',
        });

        // 🔥 CLAVE: Usar spread operator para disparar reactividad
        documentState.value[targetPage] = [...documentState.value[targetPage], newIcon];
        selectedElementIds.value = [newIcon.id];
        activeTool.value = 'select';
        hasMadeChanges = true;
        showToast('✨ Icono añadido por la IA', 'success');
      }

      // ==========================================
      // 🎨 ACCIÓN: CAMBIAR FONDO
      // ==========================================
      else if (actionType === 'changeBackground') {
        slideConfigs.value[targetPage].bgColor = action.bgColor || action.color || '#000000';
        slideConfigs.value[targetPage].bgImage = null;
        hasMadeChanges = true;
        showToast('✨ Fondo actualizado por la IA', 'success');
      }

      // ==========================================
      // 📄 ACCIÓN: NUEVA DIAPOSITIVA
      // ==========================================
      else if (actionType === 'addSlide') {
        addNewSlide();
        hasMadeChanges = true;
        showToast('✨ Nueva diapositiva creada', 'success');
      }

      // ==========================================
      // 🗑️ ACCIÓN: ELIMINAR ELEMENTO
      // ==========================================
      else if (actionType === 'deleteElement' && action.elementId) {
        // 🔥 CLAVE: Filtrar (no splice) para disparar reactividad
        const beforeCount = documentState.value[targetPage].length;
        documentState.value[targetPage] = documentState.value[targetPage].filter((el) => el.id !== action.elementId);

        if (beforeCount !== documentState.value[targetPage].length) {
          selectedElementIds.value = [];
          hasMadeChanges = true;
          showToast('✨ Elemento eliminado por la IA', 'success');
        }
      }

      // ==========================================
      // ✏️ ACCIÓN: MODIFICAR ELEMENTO
      // ==========================================
      else if (actionType === 'modifyElement' && action.elementId) {
        // Ejecutamos en la página objetivo
        documentState.value[targetPage] = documentState.value[targetPage].map((el) => {
          if (el.id === action.elementId) {
            const updated = { ...el };

            if (action.content !== undefined) updated.content = action.content;
            if (action.color !== undefined) updated.color = action.color;
            if (action.bgColor !== undefined) updated.bgColor = action.bgColor;
            if (action.fontSize !== undefined) updated.fontSize = action.fontSize;
            if (action.fontWeight !== undefined) updated.fontWeight = action.fontWeight;
            if (action.fontFamily !== undefined) updated.fontFamily = action.fontFamily;
            if (action.textAlign !== undefined) updated.textAlign = action.textAlign;
            if (action.x !== undefined) updated.x = action.x;
            if (action.y !== undefined) updated.y = action.y;
            if (action.width !== undefined) updated.width = action.width;
            if (action.height !== undefined) updated.height = action.height;
            if (action.opacity !== undefined) updated.opacity = action.opacity;
            if (action.rotation !== undefined) updated.rotation = action.rotation;
            if (action.borderRadius !== undefined) updated.borderRadius = action.borderRadius;

            return updated;
          }
          return el;
        });

        hasMadeChanges = true;
        showToast('✨ Elemento modificado por la IA', 'success');
      }

      // ==========================================
      // 🖼️ ACCIÓN: AÑADIR IMAGEN
      // ==========================================
      else if (actionType === 'addImage' || actionType === 'add_image' || actionTypeNormalized === 'addimage') {
        const newImage = createTemplateElement('image', {
          src: action.src || '',
          x: action.x ?? (baseWidth.value / 2) - 125,
          y: action.y ?? (baseHeight.value / 2) - 125,
          width: action.width ?? 250,
          height: action.height ?? 250,
          fit: action.fit || 'contain',
          borderRadius: action.borderRadius ?? 0,
          opacity: action.opacity ?? 1,
          rotation: action.rotation ?? 0,
        });

        documentState.value[targetPage] = [...documentState.value[targetPage], newImage];
        selectedElementIds.value = [newImage.id];
        activeTool.value = 'select';
        hasMadeChanges = true;
        showToast('✨ Imagen añadida por la IA', 'success');
      }

      // ==========================================
      // 🎥 ACCIÓN: AÑADIR VÍDEO
      // ==========================================
      else if (actionType === 'addVideo') {
        const newVideo = createTemplateElement('video', {
          src: action.src || '',
          x: action.x ?? (baseWidth.value / 2) - 200,
          y: action.y ?? (baseHeight.value / 2) - 112,
          width: action.width ?? 400,
          height: action.height ?? 225,
          autoplay: action.autoplay ?? false,
          loop: action.loop ?? false,
          muted: action.muted ?? false,
          borderRadius: action.borderRadius ?? 0,
          opacity: action.opacity ?? 1,
          rotation: action.rotation ?? 0,
        });

        documentState.value[targetPage] = [...documentState.value[targetPage], newVideo];
        selectedElementIds.value = [newVideo.id];
        activeTool.value = 'select';
        hasMadeChanges = true;
        showToast('✨ Vídeo añadido por la IA', 'success');
      }

      // ==========================================
      // 📊 ACCIÓN: AÑADIR TABLA
      // ==========================================
      else if (actionType === 'addTable') {
        const newTable = createTemplateElement('table', {
          headers: action.headers || ['Col 1', 'Col 2'],
          rows: action.rows || [['Dato 1', 'Dato 2'], ['Dato 3', 'Dato 4']],
          x: action.x ?? (baseWidth.value / 2) - 200,
          y: action.y ?? (baseHeight.value / 2) - 150,
          width: action.width ?? 400,
          height: action.height ?? 'auto',
          color: action.color || '#334155',
          borderColor: action.borderColor || '#cbd5e1',
          headerBgColor: action.headerBgColor || '#f1f5f9',
          rowBgColor1: action.rowBgColor1 || '#ffffff',
          rowBgColor2: action.rowBgColor2 || '#f8fafc',
          fontSize: action.fontSize ?? 16,
          borderRadius: action.borderRadius ?? 8,
          opacity: action.opacity ?? 1,
          rotation: action.rotation ?? 0,
        });

        documentState.value[targetPage] = [...documentState.value[targetPage], newTable];
        selectedElementIds.value = [newTable.id];
        activeTool.value = 'select';
        hasMadeChanges = true;
        showToast('✨ Tabla añadida por la IA', 'success');
      }

      // ==========================================
      // 📈 ACCIÓN: AÑADIR GRÁFICO
      // ==========================================
      else if (actionType === 'addChart') {
        const newChart = createTemplateElement('chart', {
          chartType: action.chartType || 'bar',
          chartTitle: action.chartTitle || 'Datos',
          chartData: action.chartData || [
            { label: 'Q1', value: 30, color: '#3b82f6' },
            { label: 'Q2', value: 60, color: '#10b981' },
            { label: 'Q3', value: 40, color: '#f59e0b' },
          ],
          x: action.x ?? (baseWidth.value / 2) - 200,
          y: action.y ?? (baseHeight.value / 2) - 150,
          width: action.width ?? 400,
          height: action.height ?? 300,
          color: action.color || '#334155',
          bgColor: action.bgColor || '#ffffff',
          showValues: action.showValues ?? true,
          showLegend: action.showLegend ?? true,
          borderRadius: action.borderRadius ?? 12,
          opacity: action.opacity ?? 1,
          rotation: action.rotation ?? 0,
        });

        documentState.value[targetPage] = [...documentState.value[targetPage], newChart];
        selectedElementIds.value = [newChart.id];
        activeTool.value = 'select';
        hasMadeChanges = true;
        showToast('✨ Gráfico añadido por la IA', 'success');
      }

      // ==========================================
      // 📱 ACCIÓN: AÑADIR CÓDIGO QR
      // ==========================================
      else if (actionType === 'addQrcode') {
        const newQR = createTemplateElement('qrcode', {
          qrUrl: action.qrUrl || 'https://',
          x: action.x ?? (baseWidth.value / 2) - 75,
          y: action.y ?? (baseHeight.value / 2) - 75,
          width: action.width ?? 150,
          height: action.height ?? 150,
          color: action.color || '#0f172a',
          bgColor: action.bgColor || '#ffffff',
          borderRadius: action.borderRadius ?? 8,
          opacity: action.opacity ?? 1,
          rotation: action.rotation ?? 0,
        });

        documentState.value[targetPage] = [...documentState.value[targetPage], newQR];
        selectedElementIds.value = [newQR.id];
        activeTool.value = 'select';
        hasMadeChanges = true;
        showToast('✨ Código QR añadido por la IA', 'success');
      }

      // ==========================================
      // 📝 ACCIÓN: AÑADIR LISTA
      // ==========================================
      else if (actionType === 'addList') {
        const newList = createTemplateElement('list', {
          items: action.items || ['Elemento 1', 'Elemento 2', 'Elemento 3'],
          listType: action.listType || 'ul',
          x: action.x ?? (baseWidth.value / 2) - 150,
          y: action.y ?? (baseHeight.value / 2) - 100,
          width: action.width ?? 300,
          height: action.height ?? 'auto',
          color: action.color || '#1e293b',
          fontSize: action.fontSize ?? 24,
          fontWeight: action.fontWeight || '400',
          itemSpacing: action.itemSpacing ?? 10,
          opacity: action.opacity ?? 1,
          rotation: action.rotation ?? 0,
        });

        documentState.value[targetPage] = [...documentState.value[targetPage], newList];
        selectedElementIds.value = [newList.id];
        activeTool.value = 'select';
        hasMadeChanges = true;
        showToast('✨ Lista añadida por la IA', 'success');
      }

      // ==========================================
      // 💻 ACCIÓN: AÑADIR BLOQUE DE CÓDIGO
      // ==========================================
      else if (actionType === 'addCodeblock') {
        const newCode = createTemplateElement('codeblock', {
          content: action.content || 'console.log("Hello World");',
          language: action.language || 'javascript',
          x: action.x ?? (baseWidth.value / 2) - 225,
          y: action.y ?? (baseHeight.value / 2) - 150,
          width: action.width ?? 450,
          height: action.height ?? 'auto',
          theme: action.theme || 'dark',
          fontSize: action.fontSize ?? 14,
          borderRadius: action.borderRadius ?? 8,
          opacity: action.opacity ?? 1,
          rotation: action.rotation ?? 0,
        });

        documentState.value[targetPage] = [...documentState.value[targetPage], newCode];
        selectedElementIds.value = [newCode.id];
        activeTool.value = 'select';
        hasMadeChanges = true;
        showToast('✨ Bloque de código añadido por la IA', 'success');
      }

      // ==========================================
      // 🔗 ACCIÓN: AÑADIR ENLACE/BOTÓN
      // ==========================================
      else if (actionType === 'addLink') {
        const newLink = createTemplateElement('link', {
          text: action.text || 'Siguiente...',
          targetPage: action.targetPage || 1,
          x: action.x ?? (baseWidth.value / 2) - 80,
          y: action.y ?? (baseHeight.value / 2) - 22,
          width: action.width ?? 160,
          height: action.height ?? 44,
          bgColor: action.bgColor || '#2563eb',
          color: action.color || '#ffffff',
          borderRadius: action.borderRadius ?? 6,
          fontSize: action.fontSize ?? 14,
          fontWeight: action.fontWeight || '600',
          opacity: action.opacity ?? 1,
          rotation: action.rotation ?? 0,
        });

        documentState.value[targetPage] = [...documentState.value[targetPage], newLink];
        selectedElementIds.value = [newLink.id];
        activeTool.value = 'select';
        hasMadeChanges = true;
        showToast('✨ Enlace añadido por la IA', 'success');
      }

      // ==========================================
      // 🧊 ACCIÓN: AÑADIR MODELO 3D
      // ==========================================
      else if (actionTypeNormalized === 'add3d') {
        const new3D = createTemplateElement('3d', {
          src: action.src || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
          x: action.x ?? (baseWidth.value / 2) - 150,
          y: action.y ?? (baseHeight.value / 2) - 150,
          width: action.width ?? 300,
          height: action.height ?? 300,
          autoRotate: action.autoRotate ?? true,
          cameraControls: action.cameraControls ?? true,
        });

        documentState.value[targetPage] = [...documentState.value[targetPage], new3D];
        selectedElementIds.value = [new3D.id];
        activeTool.value = 'select';
        hasMadeChanges = true;
        showToast('✨ Modelo 3D añadido por la IA', 'success');
      }

      // ==========================================
      // 🌐 ACCIÓN: AÑADIR IFRAME
      // ==========================================
      else if (actionTypeNormalized === 'addiframe') {
        const newIframe = createTemplateElement('iframe', {
          src: action.src || 'https://es.wikipedia.org',
          x: action.x ?? (baseWidth.value / 2) - 250,
          y: action.y ?? (baseHeight.value / 2) - 150,
          width: action.width ?? 500,
          height: action.height ?? 300,
          borderRadius: action.borderRadius ?? 8,
          borderWidth: action.borderWidth ?? 0,
          borderColor: action.borderColor || '#000000',
        });

        documentState.value[targetPage] = [...documentState.value[targetPage], newIframe];
        selectedElementIds.value = [newIframe.id];
        activeTool.value = 'select';
        hasMadeChanges = true;
        showToast('✨ Iframe añadido por la IA', 'success');
      }

      // ==========================================
      // 🔮 ACCIÓN: GENÉRICO FALLBACK
      // ==========================================
      else if (actionTypeNormalized.startsWith('add') && !isSpecialAction) {
        const typeSlug = actionTypeNormalized.replace(/^add/, '');
        const newEl = createTemplateElement(typeSlug as ToolType, {
          x: action.x ?? (baseWidth.value / 2) - 100,
          y: action.y ?? (baseHeight.value / 2) - 100,
          width: action.width ?? 200,
          height: action.height ?? 'auto',
          ...action
        });

        documentState.value[targetPage] = [...documentState.value[targetPage], newEl];
        selectedElementIds.value = [newEl.id];
        activeTool.value = 'select';
        hasMadeChanges = true;
        showToast(`✨ Elemento ${typeSlug} añadido por la IA`, 'success');
      }

      // ==========================================
      // 🗑️ ACCIÓN: ELIMINAR ÚLTIMO ELEMENTO
      // ==========================================
      else if (actionType === 'deleteLastElement') {
        if (documentState.value[targetPage].length > 0) {
          // 🔥 CLAVE: Eliminar el último elemento usando splice para disparar reactividad
          documentState.value[targetPage].pop();
          documentState.value[targetPage] = [...documentState.value[targetPage]];
          selectedElementIds.value = [];
          hasMadeChanges = true;
          showToast('✨ Último elemento eliminado por la IA', 'success');
        } else {
          showToast('No hay elementos para eliminar', 'warning');
        }
      }

      else {
        console.warn(`Tipo de acción desconocido: ${actionType}`);
      }
    } catch (error) {
      console.error(`Error ejecutando acción ${actionType}:`, error);
      showToast(`Error: ${error}`, 'error');
    }
  }

  // 🚀 FORZAR REACTIVIDAD DE VUE 3:
  // Las acciones ya dispararon reactividad con spread operators
  // Aquí solo actualizamos las referencias padre para completar el ciclo
  if (hasMadeChanges) {
    console.log("✅ [handleAiAction] Cambios detectados, actualizando reactividad...");
    console.log("📊 Estado después de acciones:", {
      page: currentPage,
      elementCount: documentState.value[currentPage]?.length || 0,
      elements: documentState.value[currentPage],
      slideConfig: slideConfigs.value[currentPage]
    });

    // 🔥 Actualizar referencias padre
    slideConfigs.value = { ...slideConfigs.value };
    documentState.value = { ...documentState.value };

    console.log("🔄 Referencias actualizadas para reactividad");

    // 🚀 GUARDAR EN HISTORIAL (Para Ctrl+Z)
    saveHistory();
    console.log("📝 Historial guardado");

    // 🚀 GUARDAR EN BD (Para persistencia)
    await savePresentation(true);
    console.log("💾 Presentación guardada en BD");
  } else {
    console.warn("⚠️ [handleAiAction] No se hicieron cambios");
  }

  console.log("🏁 [handleAiAction] Finalizado");
}

const onThumbDragOver = (e: DragEvent, page: number) => {
  if (thumbDragSource.value === null || thumbDragSource.value === page) return
  thumbDragTarget.value = page
}

const onThumbDragLeave = () => {
  thumbDragTarget.value = null
}

const onThumbDrop = (e: DragEvent, targetPage: number) => {
  if (thumbDragSource.value === null || thumbDragSource.value === targetPage) {
    thumbDragSource.value = null
    thumbDragTarget.value = null
    return
  }
  moveSlideToPosition(thumbDragSource.value, targetPage)
  thumbDragSource.value = null
  thumbDragTarget.value = null
}

const onThumbDragEnd = () => {
  thumbDragSource.value = null
  thumbDragTarget.value = null
}

const moveSlideToPosition = (fromPage: number, toPage: number) => {
  if (fromPage === toPage) return

  // Extraemos el estado de la página origen
  const srcDocState = JSON.parse(JSON.stringify(documentState.value[fromPage] || []))
  const srcSlideConfig = JSON.parse(JSON.stringify(slideConfigs.value[fromPage] || { bgColor: '#ffffff', bgImage: null, transition: 'none' }))
  const srcPdfPage = pdfPageMap.value[fromPage]

  const direction = fromPage < toPage ? 1 : -1
  const start = fromPage
  const end = toPage

  // Desplazamos todas las páginas intermedias
  if (direction === 1) {
    for (let i = start; i < end; i++) {
      documentState.value[i] = documentState.value[i + 1] || []
      slideConfigs.value[i] = slideConfigs.value[i + 1] || { bgColor: '#ffffff', bgImage: null, transition: 'none' }
      pdfPageMap.value[i] = pdfPageMap.value[i + 1] || 0
    }
  } else {
    for (let i = start; i > end; i--) {
      documentState.value[i] = documentState.value[i - 1] || []
      slideConfigs.value[i] = slideConfigs.value[i - 1] || { bgColor: '#ffffff', bgImage: null, transition: 'none' }
      pdfPageMap.value[i] = pdfPageMap.value[i - 1] || 0
    }
  }

  // Colocamos la página origen en su nueva posición
  documentState.value[toPage] = srcDocState
  slideConfigs.value[toPage] = srcSlideConfig
  pdfPageMap.value[toPage] = srcPdfPage

  // Actualizamos la página activa
  if (pageNum.value === fromPage) {
    changePageTo(toPage)
  } else if (direction === 1 && pageNum.value > fromPage && pageNum.value <= toPage) {
    changePageTo(pageNum.value - 1)
  } else if (direction === -1 && pageNum.value >= toPage && pageNum.value < fromPage) {
    changePageTo(pageNum.value + 1)
  } else {
    renderPage(pageNum.value)
  }
}

const startEditThumbPos = async (page: number) => {
  thumbEditingPage.value = page
  await nextTick()
  const input = thumbPosInputRef.value
  if (input) {
    input.focus()
    input.select()
  }
}

const commitThumbMove = (currentPage: number, e: Event) => {
  const input = e.target as HTMLInputElement
  const newPos = parseInt(input.value)
  thumbEditingPage.value = null
  if (isNaN(newPos) || newPos === currentPage || newPos < 1 || newPos > numPages.value) return
  moveSlideToPosition(currentPage, newPos)
}

  // --- ESTADO GENERAL ---
  const pdfCanvas = ref<HTMLCanvasElement | null>(null)
  const workspaceRef = ref<HTMLElement | null>(null)
  const appContainerRef = ref<HTMLElement | null>(null) // NUEVO REF
  // --- ESTADO DE NAVEGACIÓN (PAN Y ZOOM) ---
  const panX = ref(0)
  const panY = ref(0)
  const isPanning = ref(false)
  const isSpacePressed = ref(false)
  // --- GUÍAS DE ALINEACIÓN (SNAPPING) ---
  const activeGuides = ref<{ type: 'vertical' | 'horizontal'; pos: number }[]>([])
  const SNAP_THRESHOLD = 8 // Distancia en píxeles para que el "imán" actúe
  // 2. Añade estas variables de estado (por ejemplo debajo de "const activeTool = ref...")
  const showCropperModal = ref(false);
  const cropperImgRef = ref<HTMLImageElement | null>(null);
  const API_BASE = API_BASE_CONFIG
  const API_URL = PRESENTATIONS_API
  const presentationId = ref<string | null>(null);
  const presentationTitle = ref<string>('Mi Nueva Presentación');
  const isSaving = ref(false);
  const isAutosaving = ref(false);
  const route = useRoute()
  const isLoadingProject = ref(false) // Para mostrar un spinner si tarda en cargar
  const editingElementId = ref<string | null>(null)
  const router = useRouter() // 👈 Inicializamos el router
  const isTemplateCreatorMode = computed(() => route.query.mode === 'template')
  const isPrivateTemplateTarget = computed(() => route.query.visibility === 'private')

  // --- SISTEMA DE NOTIFICACIONES (TOAST) ---
  const toast = ref({
    show: false,
    message: '',
    type: 'info' // Puede ser 'success', 'error', 'warning', o 'info'
  })
  let toastTimeout: ReturnType<typeof setTimeout> | null = null

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    toast.value.message = message
    toast.value.type = type
    toast.value.show = true

    if (toastTimeout) clearTimeout(toastTimeout)

    // Se oculta automáticamente a los 3.5 segundos
    toastTimeout = setTimeout(() => {
      toast.value.show = false
    }, 3500)
  }

  const closeToast = () => {
    toast.value.show = false
    if (toastTimeout) clearTimeout(toastTimeout)
  }

  // --- DEBOUNCE PARA SELECTORES DE COLOR ---
  let colorDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  const updateColorDebounced = (obj: any, key: string, event: Event, callback?: () => void) => {
    const val = (event.target as HTMLInputElement).value;
    if (colorDebounceTimer) clearTimeout(colorDebounceTimer);
    colorDebounceTimer = setTimeout(() => {
      obj[key] = val;
      if (callback) callback();
    }, 100);
  };

  // --- FUNCIÓN PARA GUARDAR EN BASE DE DATOS ---
  const savePresentation = async (isAutosave = false) => {
    if (!hasDoc.value) return;
    if (isSaveInFlight.value) return;
    isSaveInFlight.value = true;

    // Solo mostramos el icono de carga en el header si es un guardado manual
    if (!isAutosave) {
      isSaving.value = true;
    } else {
      isAutosaving.value = true;
    }

    try {
      let payload: any = {
        userId: authStore.user?._id || authStore.user?.id,
        title: presentationTitle.value,
        docType: docType.value,
        baseWidth: baseWidth.value,
        baseHeight: baseHeight.value,
        documentState: documentState.value,
        slideConfigs: slideConfigs.value,
        pdfPageMap: pdfPageMap.value,
        pdfBase64: _PDF_BASE64_STORE || null,
        coverImage: generatedThumbnails.value[1] || null,
      };

      // Convertir media base64 a URLs antes de comprimir / enviar
      payload = await normalizePayloadMedia(payload)

      // Primero, comprimimos el estado si es posible y necesario.
      const safePayload = tryCompressProjectState(payload)
      const payloadJson = JSON.stringify(safePayload)
      const payloadSizeMB = (payloadJson.length / 1048576).toFixed(2)
      console.log(`📤 Enviando presentación (${payloadSizeMB}MB) (compressed=${Boolean(safePayload.compressedState)})...`)

      // Validar tamaño ANTES de enviar
      if (payloadJson.length > 8 * 1024 * 1024) {
        throw new Error(`El payload es demasiado grande (${payloadSizeMB}MB). Máximo permitido: 8MB en Vercel. Intenta simplificar tu presentación y vuelve a intentar.`)
      }

      const url = presentationId.value ? `${API_URL}/${presentationId.value}` : API_URL
      const method = presentationId.value ? 'PUT' : 'POST'

      // Función para guardar con reintentos
      const saveWithRetries = async (maxRetries = 3, timeoutMs = 120000) => {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            // Usar AbortController para timeout de 120 segundos por intento
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch(url, {
              method: method,
              headers: { 'Content-Type': 'application/json' },
              body: payloadJson,
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              const errorText = await response.text().catch(() => 'Sin detalles');
              throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            return await response.json();
          } catch (error) {
            lastError = error as Error;
            console.warn(`Intento ${attempt}/${maxRetries} fallido al guardar:`, error);

            if (attempt < maxRetries) {
              const delayMs = 1000 * Math.pow(2, attempt - 1);
              console.log(`Reintentando en ${delayMs}ms...`);
              if (!isAutosave) {
                showToast(`Reintentando guardado (intento ${attempt}/${maxRetries})...`, 'info');
              }
              await new Promise(resolve => setTimeout(resolve, delayMs));
            }
          }
        }

        throw lastError || new Error('Error desconocido al guardar');
      };

      let data: any = null

      if (isTemplateCreatorMode.value) {
        const templatePayload = {
          ...safePayload,
          authorName: authStore.user?.username || 'Anónimo',
          isPrivate: isPrivateTemplateTarget.value,
          docType: 'template',
        }

        if (presentationId.value) {
          data = await templateService.updateTemplate(presentationId.value, templatePayload)
        } else {
          data = await templateService.createTemplate(templatePayload)
        }
      } else {
        data = await saveWithRetries();
      }

      // Si es una creación nueva, guardamos el ID y actualizamos la URL
      if (!presentationId.value && data?._id) {
        presentationId.value = data._id;
        // ✨ MAGIA: Cambiamos la URL silenciosamente para que el F5 funcione
        if (!isTemplateCreatorMode.value) {
          router.replace(`/editorpresentaciones/${data._id}`);
        }
      }

      console.log('✅ Presentación guardada exitosamente');
      hasUnsavedChanges.value = false;
      clearDraftState();

      // Solo mostramos el Toast verde si el usuario le dio al botón o a Ctrl+S
      if (!isAutosave) {
        showToast('¡Presentación guardada con éxito!', 'success');
      }

    } catch (error) {
      let errorMsg = 'Hubo un problema al guardar la presentación.';

      const errorStr = error instanceof Error ? error.message : String(error);

      if (errorStr.includes('AbortError') || errorStr.includes('timeout')) {
        errorMsg = 'Timeout al guardar. El servidor está tardando mucho, intenta de nuevo en unos momentos.';
      } else if (errorStr.includes('Failed to fetch')) {
        errorMsg = 'Error de conexión. Verifica tu internet y que el servidor esté disponible.';
      } else if (errorStr.includes('demasiado grande')) {
        errorMsg = errorStr;
      } else if (errorStr.includes('HTTP')) {
        errorMsg = `Error del servidor: ${errorStr}`;
      }

      console.error('❌ Error al guardar la presentación:', error);
      if (!isAutosave) showToast(errorMsg, 'error');
    } finally {
      // Apagamos los loaders
      if (!isAutosave) {
        isSaving.value = false;
      } else {
        isAutosaving.value = false;
      }
      isSaveInFlight.value = false;
    }
  };

  let _RAW_PDF_DOC: any = null
  let _PDF_BASE64_STORE: string = ''
  let timerInterval: ReturnType<typeof setInterval> | null = null

  const docType = ref<'pdf' | 'blank' | 'template' | 'pptx'>('blank')
  const hasDoc = ref(false)
  const playMode = ref(false)

  // --- LÓGICA DE AUTO-OCULTADO DEL MENÚ DE PRESENTACIÓN ---
const showPlayNav = ref(true);
let playNavTimeout: ReturnType<typeof setTimeout> | null = null;

const wakeUpPlayNav = () => {
  if (!playMode.value) return; // Solo funciona en modo presentación

  showPlayNav.value = true;

  if (playNavTimeout) clearTimeout(playNavTimeout);

  playNavTimeout = setTimeout(() => {
    showPlayNav.value = false;
  }, 2000); // 2000ms = 2 segundos
};

  const pageNum = ref(1)
  const numPages = ref(0)
  const zoom = ref(1.0)
  const isConverting = ref(false)
  const isCustomTemplateMode = ref(false)

  const renderTrigger = ref(0)
  const activeTransition = ref('none')

  type ToolType =
    | 'select'
    | 'text'
    | 'sticky'
    | 'mindmap'
    | 'map'
    | 'calendar'
    | 'finance'
    | 'list'
    | 'checkbox'
    | 'table'
    | '3d'
    | 'interactive'
    | 'image'
    | 'imagecomparator'
    | 'video'
    | 'shape'
    | 'arrow'
    | 'link'
    | 'accordion'
    | 'icon'
    | 'draw'
    | 'chart'
    | 'iframe'
    | 'audio'
    | 'qrcode'
    | 'progress'
    | 'timer'
    | 'codeblock'
    | 'magnifier'
    | 'marquee'
    | 'typewriter'
    | 'poll'
    | 'rating'
  const activeTool = ref<ToolType>('select')
  const baseWidth = ref(1280)
  const baseHeight = ref(720)

  const leftSidebarWidth = ref(240)
  const rightSidebarWidth = ref(280)
  const isLeftSidebarOpen = ref(true)
  const isRightSidebarOpen = ref(true)
  const showTemplateModal = ref(false)
  const activeInspectorTab = ref<'design' | 'interactivity' | 'data' | 'animations'>('design')
  const userGalleryTemplates = ref<any[]>([])

  // --- LÓGICA PARA REDIMENSIONAR LOS PANELES LATERALES ---
const startResizeSidebar = (e: MouseEvent, side: 'left' | 'right') => {
  if (playMode.value) return;
  e.preventDefault();

  const startX = e.clientX;
  const startLeftWidth = leftSidebarWidth.value;
  const startRightWidth = rightSidebarWidth.value;

  // Límites para que no se hagan invisibles ni ocupen toda la pantalla
  const MIN_WIDTH = 200;
  const MAX_WIDTH = 600;

  const onMouseMove = (moveEvent: MouseEvent) => {
    if (side === 'left') {
      // Si movemos a la derecha, suma al ancho inicial
      const newWidth = startLeftWidth + (moveEvent.clientX - startX);
      leftSidebarWidth.value = Math.max(MIN_WIDTH, Math.min(newWidth, MAX_WIDTH));
    } else if (side === 'right') {
      // Para el panel derecho, si movemos el ratón a la izquierda (negativo), sumamos ancho
      const newWidth = startRightWidth - (moveEvent.clientX - startX);
      rightSidebarWidth.value = Math.max(MIN_WIDTH, Math.min(newWidth, MAX_WIDTH));
    }

    // Opcional: reajustar el zoom del lienzo al cambiar el tamaño de los paneles
    // fitToScreen();
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    // Recomendado: forzar un reajuste del lienzo al terminar de arrastrar
    setTimeout(fitToScreen, 50);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

  // --- CONFIGURACIÓN DE NUEVO PROYECTO ---
  const showNewProjectModal = ref(false)
  const projectConfigs = ref({
    preset: 'hd',
    width: 1280,
    height: 720,
    template: 'blank',
  })

  // ESTADOS DE DIAPOSITIVAS Y MAPAS
  const documentState = ref<Record<number, any[]>>({})
  const slideConfigs = ref<
    Record<number, { bgColor: string; bgImage: string | null; transition: string }>
  >({})
  const pdfPageMap = ref<Record<number, number>>({})
  const pdfThumbnails = ref<Record<number, string>>({})

  // MULTISELECCIÓN Y MINDMAP
  const selectedElementIds = ref<string[]>([])
  const activeMapNodeId = ref<string | null>(null)
  const clipboardElements = ref<any[]>([])

  const currentPageElements = computed(() => documentState.value[pageNum.value] || [])
  const selectedElement = computed(() =>
    selectedElementIds.value.length === 1
      ? currentPageElements.value.find((el) => el.id === selectedElementIds.value[0])
      : null,
  )
  const isInsideCanvas = (el: any): boolean => {
    const elWidth = typeof el.width === 'number' ? el.width : 150
    const elHeight = typeof el.height === 'number' ? el.height : 50
    // El elemento está "dentro" si al menos parte de él solapa con el lienzo
    return (
      el.x < baseWidth.value &&
      el.y < baseHeight.value &&
      el.x + elWidth > 0 &&
      el.y + elHeight > 0
    )
  }

  const currentBgColor = computed(() => slideConfigs.value[pageNum.value]?.bgColor || '#ffffff')
  const currentBgImage = computed(() => {
    const bg = slideConfigs.value[pageNum.value]?.bgImage;
    if (!bg || bg.trim() === '' || bg === 'none') return 'none';
    return `url("${bg}")`;
  })
  const isAllGrouped = computed(() => {
    const els = currentPageElements.value.filter((e) => selectedElementIds.value.includes(e.id))
    if (els.length < 2) return false
    const firstGroup = els[0].groupId
    return firstGroup && els.every((e) => e.groupId === firstGroup)
  })

  // --- COMPUTED PARA MAPA MENTAL ---
  const activeMapNode = computed(() => {
    if (selectedElement.value && selectedElement.value.type === 'mindmap' && activeMapNodeId.value) {
      return selectedElement.value.nodes.find((n: any) => n.id === activeMapNodeId.value)
    }
    return null
  })
  // --- LÓGICA DE RECORTE DE IMÁGENES (CORREGIDA AL 100%) ---

  // 1. Variable pura de Javascript. NADA de ref() ni reactive().
  // Así Vue no la toca y CropperJS funciona perfectamente.
  let myCropper: any = null;

  const openCropper = async () => {
    if (!selectedElement.value || !selectedElement.value.src) return;
    showCropperModal.value = true;

    // Esperamos que Vue renderice el modal y la etiqueta <img> en el DOM
    await nextTick();

    const imgEl = cropperImgRef.value as HTMLImageElement;
    if (!imgEl) return;

    // Destruimos cualquier instancia fantasma que pudiera quedar
    if (myCropper) {
      myCropper.destroy();
      myCropper = null;
    }

    const initCropper = () => {
      try {
        myCropper = new Cropper(imgEl, {
          viewMode: 2,
          autoCropArea: 1,
          background: false,
          zoomable: true,
          rotatable: true,
          checkCrossOrigin: false, // Evita que Cropper haga doble petición HTTP
        });
      } catch (e) {
        console.error("Error inicializando Cropper:", e);
        showToast("No se pudo iniciar la herramienta de recorte", "error");
      }
    };

    // Verificar si la imagen ya está lista para usarse
    if (imgEl.complete && imgEl.naturalWidth !== 0) {
      initCropper();
    } else {
      imgEl.onload = () => initCropper();
      imgEl.onerror = () => {
        showToast("La imagen no se pudo cargar para recortar.", "error");
        closeCropper();
      };
    }
  };

  const applyCrop = () => {
    if (!myCropper) {
      showToast('La herramienta aún está cargando...', 'warning');
      return;
    }

    // Chequeo de seguridad: asegurar que la instancia está sana
    if (typeof myCropper.getCroppedCanvas !== 'function') {
      console.error("Instancia inválida:", myCropper);
      showToast('Error interno al intentar recortar.', 'error');
      return;
    }

    const croppedCanvas = myCropper.getCroppedCanvas();

    if (croppedCanvas) {
      try {
        const newSrc = croppedCanvas.toDataURL('image/png', 0.9);
        selectedElement.value.src = newSrc;
        saveHistory();

        closeCropper();
        showToast('Imagen recortada con éxito', 'success');
      } catch (error) {
        console.error("Error al generar recorte (bloqueo CORS):", error);
        showToast('Seguridad del navegador: No se puede recortar esta imagen externa.', 'error');
      }
    } else {
      showToast('No se pudo generar el recorte.', 'error');
    }
  };

  const closeCropper = () => {
    if (myCropper) {
      myCropper.destroy();
      myCropper = null;
    }
    showCropperModal.value = false;
  };

  // Botones de rotar y voltear con protección anti-crasheos
  const rotateImage = (deg: number) => {
    if (myCropper && typeof myCropper.rotate === 'function') {
      myCropper.rotate(deg);
    } else {
      showToast('La herramienta aún no está lista', 'warning');
    }
  };

  const flipImage = () => {
    if (myCropper && typeof myCropper.scaleX === 'function') {
      const currentScale = myCropper.getData().scaleX || 1;
      myCropper.scaleX(currentScale === 1 ? -1 : 1);
    } else {
      showToast('La herramienta aún no está lista', 'warning');
    }
  };
  const getNodesByParent = (nodes: any[], parentId: string | null) => {
    return nodes.filter((n) => n.parentId === parentId)
  }

  const getNodeStyle = (node: any, isActive: boolean) => {
    return {
      backgroundColor: node.bgColor,
      color: node.color,
      borderRadius: node.shape === 'round' ? '20px' : node.shape === 'circle' ? '50%' : '6px',
      border: isActive ? '2px solid #58a6ff' : '2px solid transparent',
      minWidth: node.shape === 'circle' ? '80px' : 'auto',
      aspectRatio: node.shape === 'circle' ? '1/1' : 'auto',
      justifyContent: 'center',
    }
  }

  const addMapNode = (el: any, parentId: string | null) => {
    const id = 'm_' + Date.now()
    el.nodes.push({
      id,
      text: 'Nuevo Nodo',
      parentId,
      bgColor: '#21262d',
      color: '#c9d1d9',
      shape: 'round',
      note: '',
      image: '',
    })
    activeMapNodeId.value = id
  }

  const removeMapNode = (el: any, nodeId: string) => {
    if (!nodeId) return
    const getChildrenIds = (pid: string): string[] => {
      const children = el.nodes.filter((n: any) => n.parentId === pid).map((n: any) => n.id)
      return children.concat(...children.map(getChildrenIds))
    }
    const toDelete = [nodeId, ...getChildrenIds(nodeId)]
    el.nodes = el.nodes.filter((n: any) => !toDelete.includes(n.id))
    activeMapNodeId.value = null
  }

  const addMapMarker = (el: any) => {
    if (!el.markers) el.markers = []
    el.markers.push({
      id: 'marker_' + Date.now(),
      label: 'Nuevo pin',
      lat: el.centerLat || 0,
      lng: el.centerLng || 0,
      color: '#ff3333',
    })
  }

  const removeMapMarker = (el: any, markerId: string) => {
    if (!el.markers) return
    el.markers = el.markers.filter((marker: any) => marker.id !== markerId)
  }

  const addMapRoutePoint = (el: any) => {
    if (!el.routePoints) el.routePoints = []
    el.routePoints.push({
      id: 'route_' + Date.now(),
      lat: el.centerLat || 0,
      lng: el.centerLng || 0,
    })
  }

  const removeMapRoutePoint = (el: any, pointId: string) => {
    if (!el.routePoints) return
    el.routePoints = el.routePoints.filter((point: any) => point.id !== pointId)
  }

  // --- DRAG AND DROP EN LA LISTA DE CAPAS ---
  const dragTargetIndex = ref<number | null>(null)
  let draggedIndex: number | null = null

  const onDragStartLayer = (e: DragEvent, index: number) => {
    draggedIndex = index
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.dropEffect = 'move'
      e.dataTransfer.setData('text/plain', index.toString())
    }
  }
  const onDragOverLayer = (e: DragEvent, index: number) => {
    e.preventDefault()
    if (index !== draggedIndex) dragTargetIndex.value = index
  }
  const onDragLeaveLayer = () => {
    dragTargetIndex.value = null
  }
  const onDropLayer = (e: DragEvent, dropIndex: number) => {
    e.preventDefault()
    dragTargetIndex.value = null
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const list = documentState.value[pageNum.value]
      const item = list.splice(draggedIndex, 1)[0]
      list.splice(dropIndex, 0, item)
      documentState.value[pageNum.value] = [...list]
    }
    draggedIndex = null
  }

  // --- MAPA DE ICONOS DE LA BARRA LATERAL ---
  const ICON_MAP: Record<string, string> = {
    text: 'ph-text-t',
    sticky: 'ph-note',
    mindmap: 'ph-tree-structure',
    list: 'ph-list-bullets',
    checkbox: 'ph-check-square',
    table: 'ph-table',
    shape: 'ph-square',
    arrow: 'ph-arrow-right',
    image: 'ph-image',
    video: 'ph-video-camera',
    '3d': 'ph-cube',
    interactive: 'ph-lightning',
    link: 'ph-link',
    accordion: 'ph-list-dashes',
    icon: 'ph-star',
    draw: 'ph-pencil-simple',
    chart: 'ph-chart-bar',
    iframe: 'ph-globe',
    map: 'ph-map-trifold',
    calendar: 'ph-calendar-blank',
    finance: 'ph-trend-up',
    audio: 'ph-speaker-high',
    qrcode: 'ph-qr-code',
    progress: 'ph-sliders-horizontal',
    timer: 'ph-timer',
    codeblock: 'ph-code',
    magnifier: 'ph-magnifying-glass',
    poll: 'ph-chart-pie-slice',
    rating: 'ph-star-half',
    imagecomparator: 'ph-swap',
    marquee: 'ph-text-aa',
    typewriter: 'ph-keyboard',
  }
  const getIconClassForType = (type: string) => ICON_MAP[type] || 'ph-file'

  // --- FÁBRICA DE ELEMENTOS ---
  const ELEMENT_DEFAULTS: Record<string, any> = {
    link: {
      name: 'Botón',
      width: 160,
      height: 44,
      text: 'Siguiente...',
      targetPage: 1,
      bgColor: 'var(--pres-accent)',
      color: '#ffffff',
      borderRadius: 6,
      borderWidth: 0,
      borderColor: '#ffffff',
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontSize: 14,
      fontWeight: '600',
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    accordion: {
      name: 'Acordeón',
      width: 320,
      height: 'auto',
      bgColor: '#ffffff',
      color: '#334155',
      items: [{ title: 'Sección 1', content: 'Detalle...', isOpen: false }],
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    text: {
      name: 'Texto',
      width: 300,
      height: 'auto',
      content: 'Escribe aquí...',
      color: 'var(--pres-text)',
      fontSize: 32,
      fontWeight: '400',
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontStyle: 'normal',
      textAlign: 'left',
      textTransform: 'none',
      textDecoration: 'none',
      lineHeight: 1.2,
      letterSpacing: 0,
      textShadow: 'none',
      textBgColor: 'transparent',
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    list: {
      name: 'Lista',
      width: 300,
      height: 'auto',
      items: ['Elemento 1', 'Elemento 2', 'Elemento 3'],
      listType: 'ul',
      bulletStyle: 'disc',
      color: 'var(--pres-text)',
      fontSize: 24,
      fontWeight: '400',
      fontFamily: 'Helvetica, Arial, sans-serif',
      itemSpacing: 10,
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    checkbox: {
      name: 'Tareas',
      width: 300,
      height: 'auto',
      items: [
        { text: 'Tarea 1', checked: false },
        { text: 'Tarea 2', checked: true },
      ],
      checkedColor: 'var(--pres-accent)',
      color: 'var(--pres-text)',
      fontSize: 20,
      fontWeight: '400',
      fontFamily: 'Helvetica, Arial, sans-serif',
      itemSpacing: 12,
      strikeThrough: true,
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    table: {
      name: 'Tabla',
      width: 400,
      height: 'auto',
      headers: ['Col 1', 'Col 2'],
      rows: [
        ['Dato 1', 'Dato 2'],
        ['Dato 3', 'Dato 4'],
      ],
      color: 'var(--pres-text)',
      borderColor: '#cbd5e1',
      borderWidth: 1,
      headerBgColor: 'var(--pres-bg)',
      rowBgColor1: 'transparent',
      rowBgColor2: 'rgba(0,0,0,0.05)',
      fontSize: 16,
      fontFamily: 'Helvetica, Arial, sans-serif',
      textAlign: 'left',
      borderRadius: 8,
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    sticky: {
      name: 'Nota',
      width: 200,
      height: 200,
      content: 'Idea clave...',
      color: '#0f172a',
      fontSize: 24,
      fontWeight: '400',
      fontFamily: "'Comic Sans MS', cursive, sans-serif",
      fontStyle: 'normal',
      textAlign: 'center',
      textTransform: 'none',
      textDecoration: 'none',
      lineHeight: 1.4,
      letterSpacing: 0,
      textShadow: 'none',
      textBgColor: '#fef08a',
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
      boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
    },
    mindmap: {
      name: 'Mapa Mental',
      width: 600,
      height: 400,
      lineColor: '#94a3b8',
      lineWidth: 2,
      fontFamily: 'Helvetica, Arial, sans-serif',
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
      nodes: [
        {
          id: 'm1',
          text: 'Tema Central',
          parentId: null,
          bgColor: 'var(--pres-accent)',
          color: '#ffffff',
          shape: 'round',
          note: '',
          image: '',
        },
        {
          id: 'm2',
          text: 'Idea 1',
          parentId: 'm1',
          bgColor: '#f1f5f9',
          color: '#1e293b',
          shape: 'round',
          note: '',
          image: '',
        },
        {
          id: 'm3',
          text: 'Idea 2',
          parentId: 'm1',
          bgColor: '#f1f5f9',
          color: '#1e293b',
          shape: 'round',
          note: '',
          image: '',
        },
      ],
    },
    shape: {
      name: 'Forma',
      width: 150,
      height: 150,
      bgColor: 'var(--pres-bg)',
      gradientType: 'none',
      gradientColor: 'var(--pres-accent)',
      borderRadius: 8,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'var(--pres-accent)',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      isGlass: false,
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    arrow: {
      name: 'Flecha',
      width: 200,
      height: 'auto',
      color: 'var(--pres-accent)',
      strokeWidth: 3,
      arrowHead: 'end',
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    image: {
      name: 'Imagen',
      width: 250,
      height: 250,
      src: '',
      fit: 'contain',
      borderRadius: 0,
      borderWidth: 0,
      borderColor: '#000000',
      grayscale: 0,
      blur: 0,
      sepia: 0,
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    video: {
      name: 'Vídeo',
      width: 400,
      height: 225,
      src: '',
      fit: 'cover',
      autoplay: false,
      loop: false,
      muted: false,
      borderRadius: 0,
      borderWidth: 0,
      borderColor: '#000000',
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    '3d': {
      name: 'Modelo 3D',
      width: 300,
      height: 300,
      src: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
      autoRotate: true,
      cameraControls: true,
      envImage: '',
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    interactive: {
      name: 'Hotspot',
      width: 40,
      height: 40,
      color: 'var(--pres-accent)',
      modalTitle: 'Info',
      contentHtml: '<p>Edita el HTML.</p>',
      isOpen: false,
      modalBgColor: '#ffffff',
      modalTextColor: '#1e293b',
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    icon: {
      name: 'Icono',
      width: 64,
      height: 64,
      color: 'var(--pres-text)',
      bgColor: 'transparent',
      borderRadius: 0,
      iconName: 'star',
      fontSize: 64,
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    chart: {
      name: 'Gráfico',
      width: 400,
      height: 300,
      color: 'var(--pres-text)',
      bgColor: 'transparent',
      chartType: 'bar',
      chartTitle: 'Datos',
      showValues: true,
      showLegend: true,
      borderRadius: 12,
      chartData: [
        { label: 'Q1', value: 30, color: 'var(--pres-accent)' },
        { label: 'Q2', value: 60, color: '#10b981' },
        { label: 'Q3', value: 40, color: '#f59e0b' },
      ],
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    iframe: {
      name: 'Iframe',
      width: 400,
      height: 300,
      src: '',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#cbd5e1',
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    map: {
      name: 'Mapa',
      width: 400,
      height: 300,
      location: 'Madrid, España',
      centerLat: 40.4168,
      centerLng: -3.7038,
      mapType: 'm',
      zoomLevel: 14,
      markers: [
        { id: 'marker_1', label: 'Punto principal', lat: 40.4168, lng: -3.7038, color: '#ff3333' },
      ],
      routePoints: [],
      borderRadius: 8,
      borderWidth: 0,
      borderColor: '#000000',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    calendar: {
      name: 'Calendario',
      width: 450,
      height: 'auto',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      color: 'var(--pres-text)',
      bgColor: 'var(--pres-bg)',
      accentColor: 'var(--pres-accent)',
      events: [],
      activeAgendaDay: null,
      fontFamily: 'Helvetica, Arial, sans-serif',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#cbd5e1',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    finance: {
      name: 'Finanzas',
      width: 500,
      height: 350,
      symbol: 'NASDAQ:AAPL',
      theme: 'light',
      chartType: '1',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#cbd5e1',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    audio: {
      name: 'Audio',
      width: 160,
      height: 48,
      src: '',
      bgColor: 'var(--pres-bg)',
      color: 'var(--pres-text)',
      borderRadius: 24,
      loop: false,
      autoplay: false,
      isPlaying: false,
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
      variant: 'pill',
    },
    draw: {
      name: 'Pizarra',
      width: 400,
      height: 300,
      brushSize: 4,
      brushColor: '#ef4444',
      lines: [],
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    qrcode: {
      name: 'Código QR',
      width: 150,
      height: 150,
      qrUrl: 'https://',
      color: '#0f172a',
      bgColor: '#ffffff',
      borderRadius: 8,
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    progress: {
      name: 'Progreso',
      width: 300,
      height: 12,
      progress: 50,
      color: 'var(--pres-accent)',
      bgColor: 'rgba(0,0,0,0.1)',
      borderRadius: 6,
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    timer: {
      name: 'Temporizador',
      width: 180,
      height: 60,
      duration: 5,
      color: 'var(--pres-text)',
      bgColor: 'var(--pres-bg)',
      fontSize: 36,
      borderRadius: 8,
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
      timeLeft: 300,
      isRunning: false,
    },
    codeblock: {
      name: 'Código',
      width: 450,
      height: 'auto',
      content: 'console.log("Hello World");',
      language: 'javascript',
      theme: 'dark',
      fontSize: 14,
      borderRadius: 8,
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    magnifier: {
      name: 'Lupa',
      width: 180,
      height: 180,
      src: '',
      zoomLevel: 2,
      focusX: 50,
      focusY: 50,
      borderWidth: 4,
      borderColor: '#ffffff',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    poll: {
      name: 'Encuesta',
      width: 350,
      height: 'auto',
      color: 'var(--pres-text)',
      bgColor: 'var(--pres-bg)',
      chartTitle: 'Resultados',
      borderRadius: 12,
      chartData: [
        { label: 'Opción A', value: 65, color: 'var(--pres-accent)' },
        { label: 'Opción B', value: 35, color: 'rgba(0,0,0,0.1)' },
      ],
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    rating: {
      name: 'Puntuación',
      width: 200,
      height: 'auto',
      rating: 3,
      maxStars: 5,
      color: 'var(--pres-accent)',
      fontSize: 32,
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
      isInteractive: true,
    },
    imagecomparator: {
      name: 'Comparador de Imágenes',
      width: 400,
      height: 300,
      imageBefore: '',
      imageAfter: '',
      sliderPosition: 50,
      borderRadius: 0,
      borderWidth: 0,
      borderColor: '#000000',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    marquee: {
      name: 'Marquesina',
      width: 400,
      height: 60,
      content: 'Texto en movimiento • Marquesina • Efecto de desplazamiento',
      color: 'var(--pres-text)',
      fontSize: 24,
      fontWeight: '600',
      fontFamily: 'Helvetica, Arial, sans-serif',
      bgColor: 'transparent',
      speed: 50,
      borderRadius: 0,
      borderWidth: 0,
      borderColor: '#000000',
      boxShadow: 'none',
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
    typewriter: {
      name: 'Máquina de Escribir',
      width: 400,
      height: 'auto',
      content: 'Este es un efecto de máquina de escribir.',
      color: 'var(--pres-text)',
      fontSize: 24,
      fontWeight: '400',
      fontFamily: 'Helvetica, Arial, sans-serif',
      bgColor: 'transparent',
      typingSpeed: 100,
      borderRadius: 0,
      borderWidth: 0,
      borderColor: '#000000',
      boxShadow: 'none',
      displayedText: '',
      isTyping: false,
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
    },
  }

  // --- EXTENSIÓN: MOTOR DE EVENTOS (EDA) ---
  Object.keys(ELEMENT_DEFAULTS).forEach(key => {
    ELEMENT_DEFAULTS[key].events = [];
  });

  // --- LIFECYCLE E INTERACCIÓN ---

      onMounted(() => {
    if (!customElements.get('model-viewer')) {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js'
      document.head.appendChild(script)
    }
    document.addEventListener('keydown', handleGlobalKeydown)
    document.addEventListener('keyup', handleGlobalKeyup)
    document.addEventListener('pointerdown', handleGlobalPointerDown, true)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', onFullscreenChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // 👉 NUEVO: Escuchar movimiento de ratón y teclas para despertar el menú
    document.addEventListener('mousemove', wakeUpPlayNav);
    document.addEventListener('keydown', wakeUpPlayNav);

    // Cargar plantillas del usuario
    loadGalleryTemplates()

    initEditorFromRoute(true)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleGlobalKeydown)
    document.removeEventListener('keyup', handleGlobalKeyup)
    document.removeEventListener('pointerdown', handleGlobalPointerDown, true)
    document.removeEventListener('fullscreenchange', onFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
    window.removeEventListener('beforeunload', handleBeforeUnload)

    // 👉 NUEVO: Limpiar los eventos de movimiento al salir
    document.removeEventListener('mousemove', wakeUpPlayNav);
    document.removeEventListener('keydown', wakeUpPlayNav);
    if (playNavTimeout) clearTimeout(playNavTimeout);

    if (timerInterval) clearInterval(timerInterval)

    // 🚀 Limpieza del motor PDF en RAM para prevenir Memory Leaks
    if (_RAW_PDF_DOC) {
      try { _RAW_PDF_DOC.destroy(); } catch (e) {}
      _RAW_PDF_DOC = null;
    }
  })

  // --- LÓGICA DE ATAJOS DE TECLADO ---

  const copySelectedElements = () => {
    if (selectedElementIds.value.length === 0 || playMode.value) return

    // Guardar copias profundas de los elementos seleccionados
    clipboardElements.value = currentPageElements.value
      .filter(el => selectedElementIds.value.includes(el.id))
      .map(el => JSON.parse(JSON.stringify(el)))

    console.log(`${clipboardElements.value.length} elementos copiados.`)
  }

  const pasteElements = () => {
    if (clipboardElements.value.length === 0 || playMode.value) return

    selectedElementIds.value = [] // Limpiar selección actual
    const newGroupId = clipboardElements.value.length > 1 ? `group_${Date.now()}` : null;

    clipboardElements.value.forEach((clipboardEl) => {
      // Crear un nuevo elemento basado en el copiado, con nuevo ID y ligero desplazamiento
      const newElement = {
        ...JSON.parse(JSON.stringify(clipboardEl)),
        id: `el_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        x: clipboardEl.x + 20, // Desplazar un poco para que no se superponga exactamente
        y: clipboardEl.y + 20,
      }

      // Si formaban parte de un grupo, asignarles un nuevo grupo juntos
      if (clipboardEl.groupId) {
          newElement.groupId = newGroupId;
      }

      if (!documentState.value[pageNum.value]) documentState.value[pageNum.value] = []
      documentState.value[pageNum.value].push(newElement)
      selectedElementIds.value.push(newElement.id)
    })

    // Actualizar el portapapeles con las nuevas posiciones para que el siguiente "pegar" se desplace otra vez
    clipboardElements.value = clipboardElements.value.map(el => ({
      ...el,
      x: el.x + 20,
      y: el.y + 20
    }))
  }

  // --- EDICIÓN DIRECTA DE TEXTO ---
  const findElementById = (elementId: string) => {
    for (const pageElements of Object.values(documentState.value || {})) {
      const match = (pageElements as any[])?.find((item: any) => item?.id === elementId)
      if (match) return match
    }
    return null
  }

  const closeActiveTextEditor = () => {
    if (!editingElementId.value) return

    const editingId = editingElementId.value
    const editedModel = findElementById(editingId)
    const editedNode = document.querySelector('.el-text.is-editing') as HTMLElement | null

    if (editedModel && editedNode) {
      editedModel.content = editedNode.innerText || ' '
    }

    editingElementId.value = null
  }

  const handleGlobalPointerDown = (e: PointerEvent) => {
    if (!editingElementId.value) return
    const target = e.target as HTMLElement | null
    if (target?.closest('.el-text.is-editing')) return
    closeActiveTextEditor()
  }

  const enableTextEdit = async (e: MouseEvent, el: any) => {
    if (playMode.value || el.isLocked) return;

    // Seleccionamos la herramienta de selección normal por si acaso
    activeTool.value = 'select';

    // Activamos el modo edición para este elemento
    editingElementId.value = el.id;

    await nextTick(); // Esperamos que el DOM aplique el contenteditable

    const target = e.currentTarget as HTMLElement;
    target.focus();

    // Seleccionamos automáticamente todo el texto como hace Figma
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(target);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const onTextBlur = (e: Event, el: any) => {
    if (editingElementId.value !== el.id) return;

    const target = e.target as HTMLElement;
    // Guardamos el texto (usamos innerText para no inyectar etiquetas HTML indeseadas)
    el.content = target.innerText || ' ';

    // Salimos del modo edición
    editingElementId.value = null;
  };

  const persistDraftState = () => {
    if (!hasDoc.value) return
    if (presentationId.value) return
    if (route.params.id || route.query.templateId) return

    try {
      const draftPayload = {
        title: presentationTitle.value,
        docType: docType.value,
        baseWidth: baseWidth.value,
        baseHeight: baseHeight.value,
        documentState: documentState.value,
        slideConfigs: slideConfigs.value,
        pdfPageMap: pdfPageMap.value,
        updatedAt: Date.now(),
      }
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload))
    } catch (error) {
      console.warn('No se pudo persistir borrador local:', error)
    }
  }

  const clearDraftState = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch (error) {
      console.warn('No se pudo limpiar borrador local:', error)
    }
  }

  const restoreDraftState = async () => {
    if (route.params.id || route.query.templateId) return false

    try {
      const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (!rawDraft) return false

      const draft = JSON.parse(rawDraft)
      if (!draft?.documentState || typeof draft.documentState !== 'object') return false

      presentationId.value = null
      presentationTitle.value = draft.title || 'Mi Nueva Presentación'
      docType.value = draft.docType || 'blank'
      baseWidth.value = draft.baseWidth || 1280
      baseHeight.value = draft.baseHeight || 720
      documentState.value = draft.documentState || {}
      slideConfigs.value = draft.slideConfigs || {}
      pdfPageMap.value = draft.pdfPageMap || {}

      const pagesArray = Object.keys(documentState.value).map(Number)
      numPages.value = pagesArray.length > 0 ? Math.max(...pagesArray) : 1
      pageNum.value = 1
      hasDoc.value = true
      hasUnsavedChanges.value = true

      initializeConfigs()
      resetHistory()
      await nextTick()
      await renderPage(1)
      setTimeout(fitToScreen, 100)
      showToast('Se recuperó tu borrador local.', 'info')
      return true
    } catch (error) {
      console.warn('No se pudo restaurar borrador local:', error)
      return false
    }
  }

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (!hasUnsavedChanges.value) return
    persistDraftState()
    e.preventDefault()
    e.returnValue = ''
  }

  const selectAllElements = () => {
    if (playMode.value) return
    selectedElementIds.value = currentPageElements.value
      .filter(el => !el.isLocked)
      .map(el => el.id)
  }

  // --- SISTEMA DE DESHACER / REHACER (HISTORIAL) ---
  const history = ref<any[]>([])
  const historyIndex = ref(-1)
  let isUndoRedoAction = false
  let historyTimeout: ReturnType<typeof setTimeout> | null = null

  const resetHistory = () => {
    history.value = []
    historyIndex.value = -1
  }

  const saveHistory = () => {
    if (isUndoRedoAction) return // No guardar si el cambio viene de un Deshacer

    // Si estamos atrás en el tiempo y hacemos un cambio, reescribimos el futuro
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }

    // Guardar un clon absoluto (profundo) del estado actual
    history.value.push(JSON.parse(JSON.stringify(documentState.value)))

    // 🚀 Limitar a 25 pasos. Reduce masivamente el peso inactivo en la RAM.
    if (history.value.length > 25) {
      history.value.shift()
    } else {
      historyIndex.value++
    }
  }

  const undo = () => {
    if (playMode.value || historyIndex.value <= 0) return // Índice 0 es el estado base original

    isUndoRedoAction = true
    historyIndex.value--
    documentState.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    selectedElementIds.value = [] // Limpiar selección por si el elemento ya no existe

    // Pequeño retardo para que el watcher no lo capte
    setTimeout(() => { isUndoRedoAction = false }, 50)
  }

  const redo = () => {
    if (playMode.value || historyIndex.value >= history.value.length - 1) return

    isUndoRedoAction = true
    historyIndex.value++
    documentState.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    selectedElementIds.value = []

    setTimeout(() => { isUndoRedoAction = false }, 50)
  }

  // --- NUEVO: AUTOCAPTURA DE MINIATURA "CASI EN TIEMPO REAL" ---
let thumbnailTimeout: ReturnType<typeof setTimeout> | null = null;

watch(
  [() => documentState.value, () => slideConfigs.value],
  () => {
    if (playMode.value || !hasDoc.value) return;

    if (thumbnailTimeout) clearTimeout(thumbnailTimeout);

    // Retraso de 1.5s. Si el usuario sigue editando, el temporizador se reinicia.
    thumbnailTimeout = setTimeout(() => {
      captureThumbnail();
    }, 2500);
  },
  { deep: true }
);

  // Ojo vigía mágico de Vue 👁️
  watch(
    () => documentState.value,
    () => {
      if (isUndoRedoAction) return
      if (historyTimeout) clearTimeout(historyTimeout)

      // Espera 400ms después de que el usuario termine de hacer cambios rápidos (ej: arrastrar o escribir)
      historyTimeout = setTimeout(() => {
        saveHistory()
      }, 400)
    },
    { deep: true } // "deep: true" revisa cada rincón de los objetos anidados
  )
  // --- SISTEMA DE AUTOGUARDADO ---
  let autosaveTimeout: ReturnType<typeof setTimeout> | null = null;

  watch(
    [() => documentState.value, () => slideConfigs.value, () => presentationTitle.value],
    () => {
      // Evitamos autoguardar mientras el proyecto se está descargando inicialmentel
      if (isLoadingProject.value || !hasDoc.value) return;

      hasUnsavedChanges.value = true;
      persistDraftState();

      if (autosaveTimeout) clearTimeout(autosaveTimeout);

      // Espera 5 segundos de inactividad antes de guardar
      autosaveTimeout = setTimeout(() => {
        savePresentation(true); // true indica que es autoguardado (silencioso)
      }, 5000);
    },
    { deep: true }
  );

  watch(
    () => route.fullPath,
    () => {
      initEditorFromRoute()
    }
  )

  const handleGlobalKeydown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    if (e.key === 'Escape' && editingElementId.value) {
      e.preventDefault();
      closeActiveTextEditor();
      return;
    }

    // --- NUEVO: GUARDAR (Ctrl + S o Cmd + S) ---
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault(); // Evita que se abra el diálogo de guardar HTML del navegador
      savePresentation();
      return;
    }
    // --- ATAJOS DEL MODO PRESENTACIÓN (PLAY MODE) ---
    if (playMode.value) {
      if (e.key === 'Escape') {
        const isFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
        if (!isFullscreen) togglePlayMode()
      }

      if (['ArrowRight', ' ', 'ArrowLeft'].includes(e.key)) {
        e.preventDefault()
        e.key === 'ArrowLeft' ? changePageTo(pageNum.value - 1) : advancePresentation();
      }
      return; // Si estamos en Play Mode, no procesar atajos del editor
    }
    // --- ATAJOS DEL EDITOR ---

    // DESHACER (Ctrl + Z o Cmd + Z)
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undo();
    }

    // REHACER (Ctrl + Shift + Z o Cmd + Shift + Z, o Ctrl + Y)
    if ((e.ctrlKey || e.metaKey) && ((e.shiftKey && e.key.toLowerCase() === 'z') || e.key.toLowerCase() === 'y')) {
      e.preventDefault();
      redo();
    }

    // Atajos bloqueados mientras se escribe (Supr, Copiar, Pegar, Espacio...)
    if (!isTyping) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copySelectedElements();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteElements();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectAllElements();
      }
      if (e.code === 'Space') {
        isSpacePressed.value = true;
        e.preventDefault();
      }
    }
  }

  const handleGlobalKeyup = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpacePressed.value = false;
    }
  }

  onUnmounted(() => {
    // ... resto de tu código onUnmounted
    document.removeEventListener('keydown', handleGlobalKeydown)
    document.removeEventListener('keyup', handleGlobalKeyup)
  })


  // --- UTILS ---
  const YT_REGEX = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  const isYouTube = (url: string) => url && YT_REGEX.test(url)

  const getYouTubeEmbedUrl = (url: string) => {
    // Reutilizamos YT_REGEX aquí abajo en lugar de reescribirlo
    const match = url.match(YT_REGEX);
    // Añadimos &origin=... para evitar bloqueos por CORS en archivos locales
    return match && match[1] ? 'https://www.youtube-nocookie.com/embed/' + match[1] + '?rel=0&origin=https://google.com' : '';
  };
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const initializeConfigs = () => {
    for (let i = 1; i <= numPages.value; i++) {
      if (!documentState.value[i]) documentState.value[i] = []
      if (!slideConfigs.value[i])
        slideConfigs.value[i] = { bgColor: '#ffffff', bgImage: null, transition: 'none' }
      if (pdfPageMap.value[i] === undefined) pdfPageMap.value[i] = i
    }
  }

  const getChartMax = (data: any[]) =>
    Math.max(...(data || []).map((d: any) => parseFloat(d.value) || 0), 1)
  const getPieGradient = (data: any[]) => {
    if (!data || !data.length) return 'transparent'
    const total = data.reduce((sum: number, d: any) => sum + (parseFloat(d.value) || 0), 0) || 1
    let currentAngle = 0
    return `conic-gradient(${data
      .map((d: any) => {
        const pct = ((parseFloat(d.value) || 0) / total) * 100
        const stop = `${d.color} ${currentAngle}% ${currentAngle + pct}%`
        currentAngle += pct
        return stop
      })
      .join(', ')})`
  }

  // Helpers Tabla y Lista
  const updateListItems = (el: any, event: Event) => {
    el.items = (event.target as HTMLTextAreaElement).value.split('\n')
  }
  const addTableRow = (el: any) => el.rows.push(el.headers.map(() => ''))
  const addTableColumn = (el: any) => {
    el.headers.push('Nueva')
    el.rows.forEach((r: any) => r.push(''))
  }
  const removeTableRow = (el: any, idx: number) => el.rows.splice(idx, 1)
  const removeTableColumn = (el: any, idx: number) => {
    el.headers.splice(idx, 1)
    el.rows.forEach((r: any) => r.splice(idx, 1))
  }

  const EMU_PER_INCH = 914400
  const CSS_PX_PER_INCH = 96
  const emuToPx = (emu: string | number | null | undefined) =>
    (Number(emu || 0) * CSS_PX_PER_INCH) / EMU_PER_INCH

  const getByLocalName = (root: Element | Document, localName: string): Element[] => {
    return Array.from(root.getElementsByTagName('*')).filter((node: Element) => node.localName === localName)
  }

  const getFirstByLocalName = (root: Element | Document, localName: string): Element | null => {
    return getByLocalName(root, localName)[0] || null
  }

  const stripPptxAnimationXml = (xml: string) => {
    return xml
      .replace(/<p:timing[\s\S]*?<\/p:timing>/gi, '')
      .replace(/<p:timing\s*\/>/gi, '')
      .replace(/<p:anim[^>]*\/>/gi, '')
      .replace(/<p:anim[^>]*>[\s\S]*?<\/p:anim[^>]*>/gi, '')
  }

  const extractXfrmBounds = (node: Element) => {
    const xfrm = getFirstByLocalName(node, 'xfrm')
    if (!xfrm) return null

    const off = Array.from(xfrm.children).find((child) => child.localName === 'off')
    const ext = Array.from(xfrm.children).find((child) => child.localName === 'ext')
    if (!off || !ext) return null

    return {
      x: Number(off.getAttribute('x') || 0),
      y: Number(off.getAttribute('y') || 0),
      cx: Number(ext.getAttribute('cx') || 0),
      cy: Number(ext.getAttribute('cy') || 0),
    }
  }

  const extractParagraphTextFromPptx = (paragraph: Element) => {
    let output = ''
    for (const node of Array.from(paragraph.childNodes)) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue

      const el = node as Element
      if (el.localName === 'r' || el.localName === 'fld') {
        const textNodes = getByLocalName(el, 't')
        const textValue = textNodes.map((txt) => txt.textContent || '').join('')
        output += textValue
      } else if (el.localName === 'br') {
        output += '\n'
      } else if (el.localName === 'tab') {
        output += '\t'
      }
    }
    return output.replace(/\s+$/g, '')
  }

  const parseTableCellTextFromPptx = (cell: Element) => {
    const paragraphs = getByLocalName(cell, 'p')
      .map((p) => extractParagraphTextFromPptx(p))
      .filter((txt) => txt.length > 0)

    if (paragraphs.length === 0) return ''
    return paragraphs.join('\n')
  }

  const parsePptxStructure = async (file: File) => {
    const zip = await JSZip.loadAsync(await file.arrayBuffer())
    const presentationXml = await zip.file('ppt/presentation.xml')?.async('text')

    let slideCx = 12192000
    let slideCy = 6858000

    if (presentationXml) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(presentationXml, 'application/xml')
      const sldSz = getFirstByLocalName(doc, 'sldSz')
      if (sldSz) {
        slideCx = Number(sldSz.getAttribute('cx') || slideCx)
        slideCy = Number(sldSz.getAttribute('cy') || slideCy)
      }
    }

    const parsedBaseWidth = Math.max(1, Math.round(emuToPx(slideCx)))
    const parsedBaseHeight = Math.max(1, Math.round(emuToPx(slideCy)))

    const slidePaths = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
      .sort((a, b) => {
        const aNum = Number((a.match(/slide(\d+)\.xml$/i) || [])[1] || 0)
        const bNum = Number((b.match(/slide(\d+)\.xml$/i) || [])[1] || 0)
        return aNum - bNum
      })

    const slides: any[][] = []
    const parser = new DOMParser()

    for (const slidePath of slidePaths) {
      const rawSlideXml = await zip.file(slidePath)?.async('text')
      if (!rawSlideXml) {
        slides.push([])
        continue
      }

      const sanitizedXml = stripPptxAnimationXml(rawSlideXml)
      const slideDoc = parser.parseFromString(sanitizedXml, 'application/xml')
      const parserError = slideDoc.getElementsByTagName('parsererror')
      if (parserError.length > 0) {
        slides.push([])
        continue
      }

      const slideElements: any[] = []

      for (const shape of getByLocalName(slideDoc, 'sp')) {
        const txBody = getFirstByLocalName(shape, 'txBody')
        if (!txBody) continue

        const paragraphs = getByLocalName(txBody, 'p')
          .map((p) => extractParagraphTextFromPptx(p))
          .filter((txt) => txt.trim().length > 0)

        if (paragraphs.length === 0) continue

        const bounds = extractXfrmBounds(shape)
        const paraStyle = getFirstByLocalName(txBody, 'rPr') || getFirstByLocalName(txBody, 'defRPr')
        const fontSizePt = Number(paraStyle?.getAttribute('sz') || 2800) / 100
        const fontSizePx = Math.max(12, Math.round((fontSizePt * CSS_PX_PER_INCH) / 72))

        const widthPx = bounds ? Math.max(80, Math.round(emuToPx(bounds.cx))) : 260
        const xPx = bounds ? Math.max(-50, Math.round(emuToPx(bounds.x))) : 40
        const yPx = bounds ? Math.max(-50, Math.round(emuToPx(bounds.y))) : 40

        slideElements.push({
          id: `el_pptx_text_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          type: 'text',
          x: xPx,
          y: yPx,
          width: widthPx,
          height: 'auto',
          content: paragraphs.join('\n'),
          color: '#1e293b',
          fontSize: fontSizePx,
          fontWeight: '400',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontStyle: 'normal',
          textAlign: 'left',
          textTransform: 'none',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: 0,
          textShadow: 'none',
          textBgColor: 'transparent',
          opacity: 1,
          rotation: 0,
          mixBlendMode: 'normal',
          isHidden: false,
          isLocked: false,
          groupId: null,
          animationType: 'none',
          animationTrigger: 'onClick',
          animationOrder: 0,
        })
      }

      for (const frame of getByLocalName(slideDoc, 'graphicFrame')) {
        const table = getFirstByLocalName(frame, 'tbl')
        if (!table) continue

        const rows = getByLocalName(table, 'tr').map((row) =>
          getByLocalName(row, 'tc').map((cell) => parseTableCellTextFromPptx(cell)),
        )

        const headerRow = rows[0]
        if (!headerRow || headerRow.length === 0) continue

        const bounds = extractXfrmBounds(frame)
        const xPx = bounds ? Math.max(-50, Math.round(emuToPx(bounds.x))) : 60
        const yPx = bounds ? Math.max(-50, Math.round(emuToPx(bounds.y))) : 120
        const widthPx = bounds ? Math.max(240, Math.round(emuToPx(bounds.cx))) : 520
        const heightPx = bounds ? Math.max(120, Math.round(emuToPx(bounds.cy))) : 260

        slideElements.push({
          id: `el_pptx_table_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          type: 'table',
          x: xPx,
          y: yPx,
          width: widthPx,
          height: heightPx,
          headers: headerRow.map((header) => header || ''),
          rows: rows.slice(1).map((row) => row.map((cell) => cell || '')),
          color: '#1e293b',
          fontSize: 16,
          fontWeight: '400',
          fontFamily: 'Helvetica, Arial, sans-serif',
          textAlign: 'left',
          headerBgColor: '#2563eb',
          rowBgColor1: '#ffffff',
          rowBgColor2: '#f8fafc',
          borderWidth: 1,
          borderColor: '#cbd5e1',
          borderRadius: 8,
          opacity: 1,
          rotation: 0,
          mixBlendMode: 'normal',
          isHidden: false,
          isLocked: false,
          groupId: null,
          animationType: 'none',
          animationTrigger: 'onClick',
          animationOrder: 0,
        })
      }

      slides.push(slideElements)
    }

    return {
      baseWidth: parsedBaseWidth,
      baseHeight: parsedBaseHeight,
      slides,
    }
  }

  const applyPptxStructuredImport = async (file: File) => {
    const parsed = await parsePptxStructure(file)
    if (!parsed.slides.length) {
      showToast('PPTX importado. No se detectaron bloques estructurados adicionales.', 'warning')
      return
    }

    baseWidth.value = parsed.baseWidth || baseWidth.value
    baseHeight.value = parsed.baseHeight || baseHeight.value
    numPages.value = Math.max(numPages.value, parsed.slides.length)
    initializeConfigs()

    for (let index = 0; index < parsed.slides.length; index++) {
      const page = index + 1
      const pageElements = documentState.value[page] || []

      const withoutPdfText = pageElements.filter(
        (el: any) => !(typeof el?.id === 'string' && el.id.startsWith('el_pdf_')),
      )

      documentState.value[page] = [...withoutPdfText, ...parsed.slides[index]]
    }

    docType.value = 'pptx'
    hasDoc.value = true

    await renderPage(pageNum.value)
    setTimeout(fitToScreen, 100)
    showToast('PPTX importado con texto y tablas estructurados.', 'success')
  }

  const getCalendarDays = (month: number, year: number) => {
    const safeMonth = Math.min(12, Math.max(1, Number(month) || 1))
    const safeYear = Math.max(1, Number(year) || new Date().getFullYear())
    const firstWeekday = (new Date(safeYear, safeMonth - 1, 1).getDay() + 6) % 7
    const daysInMonth = new Date(safeYear, safeMonth, 0).getDate()
    const days: Array<{ day: number | null; empty: boolean }> = []

    for (let i = 0; i < firstWeekday; i++) {
      days.push({ day: null, empty: true })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, empty: false })
    }

    return days
  }

  const getDayEvents = (el: any, day: number) => {
    const events = Array.isArray(el?.events) ? el.events : []
    const dayNum = Number(day)

    return events.filter((ev: any) => {
      if (!ev || ev.trigger || ev.action) return false

      const type = ev.type || 'single'
      const startDay = Number(ev.startDay)
      const endDay = Number(ev.endDay)

      if (type === 'range') {
        const start = Number.isFinite(startDay) ? startDay : dayNum
        const end = Number.isFinite(endDay) ? endDay : start
        return dayNum >= Math.min(start, end) && dayNum <= Math.max(start, end)
      }

      return dayNum === (Number.isFinite(startDay) ? startDay : 1)
    })
  }

  const addCalendarEvent = (el: any) => {
    el.events = Array.isArray(el.events) ? el.events : []
    el.events.push({
      id: `cal_ev_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      type: 'single',
      startDay: 1,
      endDay: 1,
      color: '#3b82f6',
      content: '',
    })
  }

  const removeCalendarEvent = (el: any, index: number) => {
    if (!Array.isArray(el?.events)) return
    el.events.splice(index, 1)
  }

  // --- ARCHIVOS, PDF Y THUMBNAILS ---
  const generatePdfThumbnails = async () => {
    if (!_RAW_PDF_DOC) return
    for (let i = 1; i <= _RAW_PDF_DOC.numPages; i++) {
      try {
        const page = await _RAW_PDF_DOC.getPage(i)
        const viewport = page.getViewport({ scale: 0.25 })
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (ctx) {
          canvas.width = viewport.width
          canvas.height = viewport.height
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          await page.render({ canvasContext: ctx, viewport }).promise
          pdfThumbnails.value[i] = canvas.toDataURL('image/jpeg', 0.8)
        }
      } catch (e) {}
    }
  }

  const handleFileUpload = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    const fileExtension = file.name.split('.').pop()?.toLowerCase()

    if (fileExtension === 'pdf') await processPdfFile(file)
    else if (['pptx', 'ppsx', 'potx'].includes(fileExtension || ''))
      await convertPptxToPdfViaAPI(file)
    else if (fileExtension === 'html') await processHtmlFile(file)
  }

  const toBase64 = (u8: Uint8Array): string => {
    let binary = ''
    for (let i = 0; i < u8.length; i++) {
      binary += String.fromCharCode(u8[i])
    }
    return btoa(binary)
  }

  const fromBase64 = (base64: string): Uint8Array => {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  }

  const tryDecompressProjectState = (data: any) => {
    if (!data || !data.compressedState) return

    try {
      const compressedBytes = fromBase64(data.compressedState)
      const decompressed = pako.ungzip(compressedBytes, { to: 'string' })
      const parsed = JSON.parse(decompressed)

      data.documentState = parsed.documentState || {}
      data.slideConfigs = parsed.slideConfigs || {}
      data.pdfPageMap = parsed.pdfPageMap || {}

      // No seguimos necesitando la propiedad en memoria
      delete data.compressedState
    } catch (error) {
      console.warn('No se pudo descomprimir el estado de proyecto:', error)
    }
  }

  const tryCompressProjectState = (payload: any) => {
    const rawState = {
      documentState: payload.documentState || {},
      slideConfigs: payload.slideConfigs || {},
      pdfPageMap: payload.pdfPageMap || {},
    }

    const rawJson = JSON.stringify(rawState)
    const fullJson = JSON.stringify(payload)

    // Si el documento es grande en contenido de estado (o el payload total supera 2.5MB), forzamos la compresión.
    const shouldCompress = rawJson.length >= 2 * 1024 * 1024 || fullJson.length >= 3 * 1024 * 1024

    if (!shouldCompress) {
      return payload
    }

    try {
      const compressed = pako.gzip(rawJson, { level: 6 }) // level 6 = mejor balance compresión/velocidad
      payload.compressedState = toBase64(compressed)
      payload.documentState = {}
      payload.slideConfigs = {}
      payload.pdfPageMap = {}
    } catch (error) {
      console.warn('⚠️ No se pudo comprimir el estado de la presentación:', error)
    }

    return payload
  }

  const isDataURL = (value: any) => {
    return typeof value === 'string' && value.startsWith('data:') && value.includes(';base64,')
  }

  const isLikelyBase64 = (value: any) => {
    if (typeof value !== 'string' || value.length < 500) return false
    const candidate = value.replace(/\s+/g, '')
    return /^[A-Za-z0-9+/=]+$/.test(candidate)
  }

  const uploadDataURL = async (dataURL: string, suggestedName = 'file', forceMimeType?: string) => {
    try {
      let normalized = dataURL
      let mime = forceMimeType

      if (!isDataURL(dataURL) && isLikelyBase64(dataURL)) {
        // Base64 sin prefijo -> asumimos mimeType conocido si se pasó, o binario.
        mime = mime || 'application/octet-stream'
        normalized = `data:${mime};base64,${dataURL.trim()}`
      }

      const matches = normalized.match(/^data:(.*?);base64,(.*)$/)
      if (!matches) {
        return dataURL
      }

      mime = mime || matches[1]
      const rawBase64 = matches[2]
      const bytes = atob(rawBase64)
      const array = new Uint8Array(bytes.length)
      for (let i = 0; i < bytes.length; i++) {
        array[i] = bytes.charCodeAt(i)
      }

      const extension = (mime.split('/')[1] || 'bin').split(';')[0]
      const blob = new Blob([array], { type: mime })
      const formData = new FormData()
      formData.append('file', blob, `${suggestedName}.${extension}`)

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        console.warn('No se pudo subir dataURL:', response.statusText)
        return dataURL
      }

      const jsonRes = await response.json()
      let finalUrl = dataURL;
      if (jsonRes.url && jsonRes.url.includes('.vercel-storage.com')) {
        finalUrl = `${API_BASE}/upload/file?url=${encodeURIComponent(jsonRes.url)}`;
      } else if (jsonRes.url) {
        finalUrl = jsonRes.url;
      }
      if (typeof finalUrl === 'string' && finalUrl.startsWith('/')) {
        const origin = API_BASE.replace(/\/api\/?$/, '');
        finalUrl = `${origin}${finalUrl}`;
      }
      return finalUrl;
    } catch (error) {
      console.warn('Error al subir dataURL:', error)
      return dataURL
    }
  }

  const normalizePayloadMedia = async (payload: any) => {
    if (payload.pdfBase64 && (isDataURL(payload.pdfBase64) || isLikelyBase64(payload.pdfBase64))) {
      payload.pdfBase64 = await uploadDataURL(payload.pdfBase64, 'presentation_pdf', 'application/pdf')
      // Evita re-subir los ~30MB de PDF si el usuario pulsa Guardar varias veces
      _PDF_BASE64_STORE = payload.pdfBase64;
    }

    // También optimizamos los fondos de diapositiva que antes se quedaban atrapados en un bucle Base64
    if (payload.slideConfigs) {
      for (const page in payload.slideConfigs) {
        const config = payload.slideConfigs[page]
        if (config.bgImage && (isDataURL(config.bgImage) || isLikelyBase64(config.bgImage))) {
          // Quitamos la restricción de 'image/jpeg' para no corromper la lectura de los fondos nativos WebP
          config.bgImage = await uploadDataURL(config.bgImage, 'bg_image')
        }
      }
    }

    if (payload.documentState) {
      for (const page in payload.documentState) {
        const elements = payload.documentState[page]
        if (Array.isArray(elements)) {
          for (const element of elements) {
            if (element && element.src && isDataURL(element.src)) {
              element.src = await uploadDataURL(element.src, `element_${element.type || 'img'}`)
            }
          }
        }
      }
    }

    return payload
  }

  const loadProjectFromDB = async (id: string) => {
    isLoadingProject.value = true;
    try {
      const data = await presentationService.getPresentation(id);

      tryDecompressProjectState(data);

      // 1. Asignamos los datos básicos
      presentationId.value = data._id;
      presentationTitle.value = data.title || 'Sin título';
      docType.value = data.docType || 'blank';
      baseWidth.value = data.baseWidth || 1280;
      baseHeight.value = data.baseHeight || 720;

      // 2. Asignamos los objetos, configuraciones y mapeo
      documentState.value = data.documentState || {};
      slideConfigs.value = data.slideConfigs || {};
      pdfPageMap.value = data.pdfPageMap || {};

      // 3. Calculamos cuántas páginas tiene
      const pagesArray = Object.keys(documentState.value).map(Number);
      numPages.value = pagesArray.length > 0 ? Math.max(...pagesArray) : 1;
      pageNum.value = 1;

      initializeConfigs();

      // Función para normalizar URLs de PDFs antiguos que puedan estar rotos
      const normalizePdfSource = (src: string) => {
        if (!src) return src;

        // ✨ VERCEL BLOB: Evitar que el reparador rompa las nuevas URLs de la nube
        if (src.includes('.blob.vercel-storage.com')) {
          return src;
        }

        const currentBackend = import.meta.env.VITE_BACKEND_URL || 'https://pdfs-bakend.vercel.app';
        // Reparar URLs de backend antiguo: tu-backend-en-vercel o cualquier otro host inválido
        if (src.includes('tu-backend-en-vercel.vercel.app')) {
          src = src.replace(/https?:\/\/tu-backend-en-vercel\.vercel\.app/, currentBackend);
        }
        // Si viene de un deploy antiguo con localhost o rutas locales, intentar mapear
        if (src.includes('/uploads/') && !src.includes('cloudinary') && !src.includes('res.cloudinary') && !src.includes('blob.vercel-storage.com')) {
          // Para proyectos antiguos, intentar reconstruir desde base64 si existe
          if (data.pdfBase64 && !data.pdfBase64.startsWith('http')) {
            return data.pdfBase64; // Usar base64 como fallback
          }
          // O intentar cambiar el dominio
          return src.replace(/^https?:\/\/[^/]+/, currentBackend);
        }
        return src;
      };

      // 4. Si es PDF, lo reconstruimos a partir del Base64
      if (docType.value === 'pdf' && data.pdfBase64) {
        _PDF_BASE64_STORE = normalizePdfSource(data.pdfBase64);

        let loadingTask;

        // Si el string guardado empieza por http, es nuestro nuevo sistema optimizado (URL)
        if (_PDF_BASE64_STORE.startsWith('http')) {
          try {
            const pdfjsLib = await getPdfjsLib();
            loadingTask = pdfjsLib.getDocument(_PDF_BASE64_STORE);
            _RAW_PDF_DOC = markRaw(await loadingTask.promise);
          } catch (pdfError) {
            console.warn('Error cargando PDF desde URL, intentando base64:', pdfError);
            // Fallback a base64 si la URL falla
            if (data.pdfBase64 && !data.pdfBase64.startsWith('http')) {
              const pdfData = atob(data.pdfBase64);
              const uint8Array = new Uint8Array(pdfData.length);
              for (let i = 0; i < pdfData.length; i++) {
                uint8Array[i] = pdfData.charCodeAt(i);
              }
              loadingTask = pdfjsLib.getDocument({ data: uint8Array });
              _RAW_PDF_DOC = markRaw(await loadingTask.promise);
            } else {
              throw pdfError;
            }
          }
        } else {
          // Si no, es un proyecto antiguo en Base64 (lo mantenemos para no romper nada viejo)
          const pdfData = atob(_PDF_BASE64_STORE);
          const uint8Array = new Uint8Array(pdfData.length);
          for (let i = 0; i < pdfData.length; i++) {
            uint8Array[i] = pdfData.charCodeAt(i);
          }
          const pdfjsLib = await getPdfjsLib();
          loadingTask = pdfjsLib.getDocument({ data: uint8Array });
          _RAW_PDF_DOC = markRaw(await loadingTask.promise);
        }

        await generatePdfThumbnails();
      } else {
        _RAW_PDF_DOC = null;
        pdfThumbnails.value = {};
      }
      // 5. Activamos la interfaz
      hasDoc.value = true;
      hasUnsavedChanges.value = false;
      resetHistory();

      await renderPage(1);
      setTimeout(fitToScreen, 100);

    } catch (error) {
      console.error('Error al cargar la presentación:', error);
      showToast('Error al cargar el proyecto. Puede que el archivo no esté disponible.', 'error');
      // ✨ Redirigimos a la biblioteca para sacarlo del error
      router.push('/biblioteca');
    } finally {
      isLoadingProject.value = false;

      // 👉 NUEVO: Iniciar el escáner de optimización en segundo plano al terminar de cargar
      if (hasDoc.value) {
        setTimeout(() => {
          autoOptimizeProjectImages();
        }, 1000);}
    }
  }

  // --- NUEVO: EXTRACTOR DE TEXTO A ELEMENTOS NATIVOS ---
// --- NUEVO Y MEJORADO: EXTRACTOR Y AGRUPADOR DE TEXTO ---
const extractTextToNativeElements = async (page: any, pageIndex: number, viewport: any) => {
  const textContent = await page.getTextContent();
  const rawItems: any[] = [];
  const pdfjsLib = await getPdfjsLib();

  // 1. Extraer y corregir coordenadas de todos los fragmentos
  textContent.items.forEach((item: any) => {
    if (!item.str.trim() && item.str !== ' ') return; // Ignorar basura vacía, pero mantener espacios

    // Matriz de transformación matemática del PDF a tu Lienzo
    const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);

    // Altura real de la fuente calculada desde la matriz.
    // Usamos fallback a tx[3] por si la rotación/escala difiere en ciertos PDFs
    const fontHeight = Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3])) || Math.abs(tx[3]);

    // Calculamos el ancho real asumiendo la escala exacta del viewport
    const calculatedWidth = Math.abs(item.width * viewport.scale);

    // CORRECCIÓN DE DESPLAZAMIENTO: Ajuste con line-height web (1.2)
    // La línea base suele estar en el 80% del alto. Con line-height 1.2,
    // la caja visual de HTML se empuja hacia arriba la mitad del espacio extra.
    const lineHeightMultiplier = 1.2;
    const boxHeight = fontHeight * lineHeightMultiplier;
    const offsetHeight = (boxHeight - fontHeight) / 2;
    const yTopLeft = tx[5] - (fontHeight * 0.8) - offsetHeight;

    rawItems.push({
      str: item.str,
      x: tx[4],
      y: yTopLeft,
      fontSize: fontHeight,
      fontName: item.fontName || 'Helvetica, Arial, sans-serif',
      width: calculatedWidth,
      right: tx[4] + calculatedWidth
    });
  });

  // 2. Ordenar fragmentos (arriba hacia abajo, izquierda a derecha)
  rawItems.sort((a, b) => {
    if (Math.abs(a.y - b.y) < Math.max(a.fontSize, b.fontSize) * 0.5) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  // 3. Paso 1 - Agrupación en Líneas (X-Proximity)
  const lines: any[] = [];
  let currentLine: any = null;

  for (const item of rawItems) {
    if (!item.str.trim()) continue;

    if (!currentLine) {
      currentLine = { ...item };
      lines.push(currentLine);
      continue;
    }

    const isSameLine = Math.abs(currentLine.y - item.y) < currentLine.fontSize * 0.3;
    // Tolerancia horizontal basada estrictamente en el tamaño del espacio (aprox 0.25 del fontHeight)
    const spaceWidth = currentLine.fontSize * 0.25;
    const gap = item.x - currentLine.right;
    const isCloseHorizontally = gap <= (spaceWidth * 2.5); // Permitimos hasta ~2.5 espacios de distancia para la misma línea
    const isSameFont = Math.abs(currentLine.fontSize - item.fontSize) < 3;

    if (isSameLine && isCloseHorizontally && isSameFont) {
      if (gap > spaceWidth * 0.8 && !currentLine.str.endsWith(' ')) {
        currentLine.str += ' ';
      }

      currentLine.str += item.str;
      currentLine.right = item.right;
      currentLine.width = currentLine.right - currentLine.x;
      currentLine.y = Math.min(currentLine.y, item.y);
      currentLine.fontSize = Math.max(currentLine.fontSize, item.fontSize);
    } else {
      currentLine = { ...item };
      lines.push(currentLine);
    }
  }

  // 4. Paso 2 - Agrupación en Párrafos (Y-Proximity & Alignment)
  lines.sort((a, b) => a.y - b.y);

  const paragraphs: any[] = [];
  let currentPara: any = null;

  for (const line of lines) {
    if (!currentPara) {
      currentPara = { ...line, lastLineY: line.y };
      paragraphs.push(currentPara);
      continue;
    }

    const deltaY = line.y - currentPara.lastLineY;
    // Diferencia exacta (deltaY) entre 1.0x y 1.5x el tamaño de la fuente
    const isBelow = deltaY >= currentPara.fontSize * 1.0 && deltaY <= currentPara.fontSize * 1.5;
    const isSameFont = Math.abs(currentPara.fontSize - line.fontSize) < 3;
    const isAligned = line.x >= currentPara.x - currentPara.fontSize * 2 &&
                      line.x <= currentPara.right + currentPara.fontSize * 2;

    if (isBelow && isSameFont && isAligned) {
      currentPara.str += '\n' + line.str;
      currentPara.x = Math.min(currentPara.x, line.x);
      currentPara.right = Math.max(currentPara.right, line.right);
      // El width resultante sea igual al de la línea más ancha del bloque
      currentPara.width = Math.max(currentPara.width, line.width);
      currentPara.lastLineY = line.y;
    } else {
      currentPara = { ...line, lastLineY: line.y };
      paragraphs.push(currentPara);
    }
  }

  // 5. Inyectar los párrafos agrupados en el Editor
  const newElements = paragraphs.map((para) => {
    const safeX = Math.max(-50, Math.round(para.x));
    const safeY = Math.max(-50, Math.round(para.y));

    return {
      id: `el_pdf_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      type: 'text',
      x: safeX,
      y: safeY,
      // width de la línea más ancha + un pequeño padding de +4px
      width: Math.round(para.width) + 4,
      height: 'auto',
      content: para.str.trim(),
      color: '#1e293b',
      fontSize: Math.max(12, Math.round(para.fontSize)),
      fontWeight: '400',
      fontFamily: para.fontName,
      fontStyle: 'normal',
      textAlign: 'left',
      textTransform: 'none',
      textDecoration: 'none',
      lineHeight: 1.2,
      letterSpacing: 0,
      textShadow: 'none',
      textBgColor: 'transparent',
      animation: 'none',
      opacity: 1, // Fuerza opacidad 1
      rotation: 0,
      mixBlendMode: 'normal',
      isHidden: false,
      isLocked: false,
      groupId: null,
    };
  });

  if (!documentState.value[pageIndex]) documentState.value[pageIndex] = [];
  documentState.value[pageIndex].push(...newElements);
};

  const processPdfFile = async (
    file: File | Blob,
    options: {
      extractText?: boolean
      targetDocType?: 'pdf' | 'pptx'
      successMessage?: string | null
    } = {},
  ) => {
  const shouldExtractText = options.extractText ?? true;
  docType.value = options.targetDocType || 'pdf';
  presentationId.value = null;

  // Validar tamaño (máximo 100MB por seguridad)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    showToast(`El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo permitido: ${maxSize / 1024 / 1024}MB`, 'error');
    return;
  }

  isConverting.value = true;
  showToast('Procesando documento para convertir a HTML editable...', 'info');

  const formData = new FormData();
  formData.append('file', file as Blob, 'documento.pdf');

  // Función auxiliar para subir con reintentos
  const uploadWithRetries = async (maxRetries = 3, timeoutMs = 120000) => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Intento ${attempt}/${maxRetries} fallido:`, error);

        if (attempt < maxRetries) {
          // Backoff exponencial: 2s, 4s, 8s
          const delayMs = 1000 * Math.pow(2, attempt - 1);
          console.log(`Reintentando en ${delayMs}ms...`);
          showToast(`Reintentando conexión (intento ${attempt}/${maxRetries})...`, 'info');
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError || new Error('Error desconocido al subir el archivo');
  };

  try {
    // 1. Enviamos el archivo al backend con reintentos
    const data = await uploadWithRetries();
    let safeUrl = data.url;
    if (safeUrl && safeUrl.includes('.vercel-storage.com')) {
      safeUrl = `${API_BASE}/upload/file?url=${encodeURIComponent(safeUrl)}`;
    }

    _PDF_BASE64_STORE = safeUrl;

    const pdfjsLib = await getPdfjsLib();
    // 2. Cargamos el PDF
    const loadingTask = pdfjsLib.getDocument(safeUrl);
    _RAW_PDF_DOC = markRaw(await loadingTask.promise);

    // ✨ MAGIA: Ajuste Dinámico de Resolución
    // Leemos la página 1 para configurar las dimensiones globales del lienzo al formato 1:1 del PDF
    const firstPage = await _RAW_PDF_DOC.getPage(1);
    const firstViewport = firstPage.getViewport({ scale: 1.0 });
    baseWidth.value = Math.round(firstViewport.width);
    baseHeight.value = Math.round(firstViewport.height);

    numPages.value = _RAW_PDF_DOC.numPages;
    hasDoc.value = true;
    resetHistory();
    documentState.value = {};
    slideConfigs.value = {};
    pdfPageMap.value = {};
    pdfThumbnails.value = {};

    initializeConfigs();
    await generatePdfThumbnails();

    // 3. Extraer textos cuando aplique
    if (shouldExtractText) {
      for (let i = 1; i <= _RAW_PDF_DOC.numPages; i++) {
        const page = await _RAW_PDF_DOC.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        await extractTextToNativeElements(page, i, viewport);
      }
    }

    await renderPage(1);

    setTimeout(() => {
      fitToScreen();
      savePresentation(true);

      const finalMessage = options.successMessage !== undefined
        ? options.successMessage
        : shouldExtractText
          ? '¡Documento importado con textos editables!'
          : 'Documento importado correctamente.'

      if (finalMessage) {
        showToast(finalMessage, 'success');
      }
    }, 100);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error procesando PDF:', error);

    // Mensajes de error más claros según el tipo de problema
    if (errorMsg.includes('AbortError') || errorMsg.includes('timeout')) {
      showToast(
        'La conexión tardó demasiado. Intenta con un archivo más pequeño o verifica tu conexión.',
        'error'
      );
    } else if (errorMsg.includes('HTTP 413')) {
      showToast(
        'El archivo es demasiado grande para el servidor. Por favor, reduce su tamaño.',
        'error'
      );
    } else if (errorMsg.includes('HTTP')) {
      showToast(
        `Error del servidor: ${errorMsg}. Intenta nuevamente en unos momentos.`,
        'error'
      );
    } else if (errorMsg.includes('Failed to fetch')) {
      showToast(
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        'error'
      );
    } else {
      showToast(
        `Error al subir el PDF: ${errorMsg}`,
        'error'
      );
    }
  } finally {
    isConverting.value = false;
  }
};

  const convertPptxToPdfViaAPI = async (file: File) => {
    // Validar tamaño (máximo 50MB para compatibilidad con API)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      showToast(`El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo permitido para PPTX: ${maxSize / 1024 / 1024}MB`, 'error');
      return;
    }

    isConverting.value = true;

    const formData = new FormData();
    // Gotenberg exige que el campo se llame 'files'
    formData.append('files', file);

    const convertWithRetries = async (maxRetries = 3) => {
      let lastError: Error | null = null;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Asegúrate de definir esta variable de entorno en Vercel, o reemplázala con tu URL fija
          // ✨ Reemplaza 'tuusuario' y 'mi-conversor-pptx' por los tuyos de Hugging Face
          const gotenbergUrl = import.meta.env.VITE_GOTENBERG_URL || 'https://andrees04-mi-conversor-pptx.hf.space/forms/libreoffice/convert';

          const response = await fetch(gotenbergUrl, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

          // Gotenberg devuelve el binario PDF directamente, cero decodificaciones extra 🚀
          return await response.blob();
        } catch (error) {
          lastError = error as Error;
          console.warn(`Intento ${attempt}/${maxRetries} fallido al convertir PPTX:`, error);
          if (attempt < maxRetries) {
            const delayMs = 1000 * Math.pow(2, attempt - 1);
            showToast(`Reintentando conversión (intento ${attempt}/${maxRetries})...`, 'info');
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        }
      }
      throw lastError || new Error('Error de red al convertir el archivo PPTX.');
    };

    try {
      showToast('Convirtiendo PowerPoint a PDF (Gratis)...', 'info');
      const pdfBlob = await convertWithRetries();
      await processPdfFile(pdfBlob, {
        extractText: false,
        targetDocType: 'pptx',
        successMessage: null,
      });
      await applyPptxStructuredImport(file);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Error al convertir PowerPoint:', error);
      showToast(`Error al convertir PowerPoint: ${errorMsg}`, 'error');
    } finally {
      isConverting.value = false;
    }
  };

  const processHtmlFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const htmlText = e.target?.result as string

        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlText, 'text/html')

        const stateDataNode = doc.getElementById('app-state-data')
        const configsDataNode = doc.getElementById('app-configs-data')

        if (!stateDataNode || !configsDataNode) {
          throw new Error('El archivo HTML no es un proyecto válido de PresentPro.')
        }
        resetHistory()
        documentState.value = JSON.parse(stateDataNode.textContent || '{}')
        slideConfigs.value = JSON.parse(configsDataNode.textContent || '{}')

        const pdfMapNode = doc.getElementById('app-pdf-map')
        if (pdfMapNode) pdfPageMap.value = JSON.parse(pdfMapNode.textContent || '{}')

        const metaNode = doc.getElementById('app-meta-data')
        if (metaNode) {
          const meta = JSON.parse(metaNode.textContent || '{}')
          baseWidth.value = meta.baseWidth || 1280
          baseHeight.value = meta.baseHeight || 720
          docType.value = meta.docType || 'blank'
        } else {
          const widthMatch = htmlText.match(/const baseWidth = ref\((.*?)\);/)
          const heightMatch = htmlText.match(/const baseHeight = ref\((.*?)\);/)
          const docTypeMatch = htmlText.match(/const docType = ref\('(.*?)'\);/)
          baseWidth.value = widthMatch ? parseInt(widthMatch[1]) : 1280
          baseHeight.value = heightMatch ? parseInt(heightMatch[1]) : 720
          docType.value = (docTypeMatch ? docTypeMatch[1] : 'blank') as 'pdf' | 'blank' | 'template' | 'pptx'
        }

        const pdfDataNode = doc.getElementById('app-pdf-data')
        _PDF_BASE64_STORE = pdfDataNode?.textContent || ''

        numPages.value = Math.max(...Object.keys(documentState.value).map(Number), 1)
        pageNum.value = 1
        initializeConfigs()
        hasDoc.value = true

        if (docType.value === 'pdf' && _PDF_BASE64_STORE) {
          let loadingTask;
          const pdfStr = _PDF_BASE64_STORE.trim();
          const pdfjsLib = await getPdfjsLib();
          if (pdfStr.startsWith('http') || pdfStr.startsWith('/')) {
            loadingTask = pdfjsLib.getDocument(pdfStr);
          } else {
            let rawBase64 = pdfStr.replace(/\\s+/g, '');
            if (rawBase64.includes('base64,')) {
              rawBase64 = rawBase64.split('base64,')[1];
            }
            const pdfData = atob(rawBase64);
            const uint8Array = new Uint8Array(pdfData.length);
            for (let i = 0; i < pdfData.length; i++) uint8Array[i] = pdfData.charCodeAt(i);

            loadingTask = pdfjsLib.getDocument({ data: uint8Array });
          }

          const pdfDocHtml = markRaw(await loadingTask.promise)
          showToast('Migrando HTML antiguo al formato hiperligero...', 'info');
          await migratePdfDocToNative(pdfDocHtml, false);
        } else {
          _RAW_PDF_DOC = null
          pdfThumbnails.value = {}
        }

        await renderPage(1)
        setTimeout(fitToScreen, 100)
      } catch (error) {
        console.error(error)
        showToast('Error al importar. Formato de archivo inválido.', 'error');
      }
    }
    reader.readAsText(file)
  }

 const renderPage = async (num: number) => {
   // La renderización ha sido delegada a PdfViewer.vue
   return;
 }

  // --- CREACIÓN DE PROYECTO (MODAL) ---
  const confirmCreateProject = () => {
    presentationId.value = null; // 👈 AÑADE ESTO
    _RAW_PDF_DOC = null
    _PDF_BASE64_STORE = ''
    docType.value = isTemplateCreatorMode.value ? 'template' : 'blank'

    if (projectConfigs.value.preset === 'hd') {
      baseWidth.value = 1280
      baseHeight.value = 720
    } else if (projectConfigs.value.preset === 'fhd') {
      baseWidth.value = 1920
      baseHeight.value = 1080
    } else if (projectConfigs.value.preset === 'sd') {
      baseWidth.value = 1024
      baseHeight.value = 768
    } else if (projectConfigs.value.preset === 'square') {
      baseWidth.value = 1080
      baseHeight.value = 1080
    } else {
      baseWidth.value = projectConfigs.value.width || 1280
      baseHeight.value = projectConfigs.value.height || 720
    }

    isCustomTemplateMode.value = projectConfigs.value.template === 'custom'
    resetHistory()
    documentState.value = {}
    slideConfigs.value = {}
    pdfPageMap.value = {}
    pdfThumbnails.value = {}
    hasTemplateClosingSlide.value = false

    if (isTemplateCreatorMode.value) {
      hasTemplateClosingSlide.value = true
      numPages.value = 3
      pageNum.value = 1

      for (let i = 1; i <= 3; i++) {
        documentState.value[i] = []
        slideConfigs.value[i] = { bgColor: '#ffffff', bgImage: null, transition: 'none' }
        pdfPageMap.value[i] = i
      }

      documentState.value[1].push(
        createTemplateElement('text', {
          content: 'Diseña tu Portada aquí',
          fontSize: 48,
          x: 100,
          y: 100,
          width: baseWidth.value - 200,
          color: '#111827',
        }),
      )
      documentState.value[2].push(
        createTemplateElement('text', {
          content: 'Diseña la Diapositiva Base',
          fontSize: 48,
          x: 100,
          y: 100,
          width: baseWidth.value - 200,
          color: '#111827',
        }),
      )
      documentState.value[3].push(
        createTemplateElement('text', {
          content: 'Diseña el Cierre',
          fontSize: 48,
          x: 100,
          y: 100,
          width: baseWidth.value - 200,
          color: '#111827',
        }),
      )
    } else {
      numPages.value = 1
      pageNum.value = 1
      applyTemplate(projectConfigs.value.template)
    }

    initializeConfigs()

    hasDoc.value = true
    showNewProjectModal.value = false
    renderPage(1)

    setTimeout(() => {
      fitToScreen();
      savePresentation(true); // Guarda inmediatamente para crear la URL
    }, 100);
  }

  const createTemplateElement = (type: ToolType, overrides: any) => {
    return {
      id: `el_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      type,
      opacity: 1,
      rotation: 0,
      mixBlendMode: 'normal',
      isHidden: false,
      isLocked: false,
      groupId: null,
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
      ...JSON.parse(JSON.stringify(ELEMENT_DEFAULTS[type] || {})),
      ...overrides,
    }
  }

  const loadGalleryTemplates = async () => {
    const userId = authStore.user?._id
    if (!userId) return
    try {
      const result = await templateService.getUserTemplates(userId)
      userGalleryTemplates.value = Array.isArray(result) ? result : []
    } catch {
      userGalleryTemplates.value = []
    }
  }

  const applyExternalTemplate = (tpl: any) => {
    tryDecompressProjectState(tpl)

    if (tpl.documentState) {
      documentState.value = JSON.parse(JSON.stringify(tpl.documentState))
    }
    if (tpl.slideConfigs) {
      slideConfigs.value = JSON.parse(JSON.stringify(tpl.slideConfigs))
    }
    if (tpl.baseWidth) baseWidth.value = tpl.baseWidth
    if (tpl.baseHeight) baseHeight.value = tpl.baseHeight
    presentationId.value = null
    presentationTitle.value = tpl.title || 'Plantilla sin título'
    numPages.value = Math.max(1, Object.keys(documentState.value || {}).length)
    hasDoc.value = true
    docType.value = 'blank'
    hasUnsavedChanges.value = true
    hasTemplateClosingSlide.value = tpl?.docType === 'template' && numPages.value >= 3
    projectConfigs.value.template = 'custom'
    isCustomTemplateMode.value = true
    pageNum.value = 1
    resetHistory()
    nextTick(() => renderPage(1))
    showToast('✨ Plantilla aplicada', 'success')
  }

  const loadTemplateFromQuery = async (templateId: string, preserveTemplateId = false) => {
    try {
      const template = await templateService.getTemplateById(templateId)
      applyExternalTemplate(template)
      if (preserveTemplateId) {
        presentationId.value = template?._id || null
        docType.value = 'template'
        hasUnsavedChanges.value = false
      }
      setTimeout(() => fitToScreen(), 100)
    } catch {
      showToast('No se pudo cargar la plantilla seleccionada.', 'error')
    }
  }

  const initEditorFromRoute = async (force = false) => {
    const routeKey = `${String(route.params.id || '')}|${String(route.query.templateId || '')}|${String(route.query.mode || '')}`
    if (!force && lastRouteLoadKey.value === routeKey) return
    lastRouteLoadKey.value = routeKey

    const routeId = route.params.id as string | undefined
    const templateId = route.query.templateId as string | undefined

    if (templateId) {
      await loadTemplateFromQuery(templateId)
      return
    }

    if (routeId && routeId !== 'new') {
      if (!isTemplateCreatorMode.value && presentationId.value === routeId && hasDoc.value) {
        return
      }
      if (isTemplateCreatorMode.value) {
        await loadTemplateFromQuery(routeId, true)
      } else {
        await loadProjectFromDB(routeId)
      }
      return
    }

    const restored = await restoreDraftState()
    if (restored) return

    if (isTemplateCreatorMode.value && !hasDoc.value) {
      projectConfigs.value.template = 'custom'
      showNewProjectModal.value = true
    }
  }

  const publishAsTemplate = async () => {
    const isPublic = confirm('¿Quieres que esta plantilla sea pública en la tienda? (Aceptar = Pública, Cancelar = Privada)')
    const userId = authStore.user?._id
    if (!userId) return

    const payload = {
      userId,
      authorName: authStore.user?.username || 'Anónimo',
      title: presentationTitle.value || 'Mi Nueva Plantilla',
      documentState: documentState.value,
      slideConfigs: slideConfigs.value,
      baseWidth: baseWidth.value,
      baseHeight: baseHeight.value,
      coverImage: generatedThumbnails.value[1] || null,
      isPrivate: !isPublic,
    }

    try {
      showToast('Publicando plantilla...', 'info')
      await templateService.createTemplate(payload)
      showToast('¡Plantilla guardada con éxito!', 'success')
      loadGalleryTemplates()
    } catch {
      showToast('Error al guardar la plantilla', 'error')
    }
  }

  const applyTemplate = (templateId: string) => {
    const w = baseWidth.value
    const h = baseHeight.value

    if (templateId === 'blank') {
      documentState.value[1] = []
      slideConfigs.value[1] = { bgColor: '#ffffff', bgImage: null, transition: 'none' }
    } else if (templateId === 'modern') {
      documentState.value[1] = [
        createTemplateElement('shape', {
          width: w,
          height: 180,
          bgColor: '#2563eb',
          x: 0,
          y: 0,
          borderRadius: 0,
          borderStyle: 'none',
        }),
        createTemplateElement('text', {
          content: 'Título de la Presentación',
          color: '#ffffff',
          fontSize: 48,
          fontWeight: '800',
          x: 50,
          y: 55,
          width: w - 100,
        }),
        createTemplateElement('text', {
          content: 'Añade tu subtítulo aquí',
          color: '#333333',
          fontSize: 24,
          x: 50,
          y: 220,
        }),
        createTemplateElement('shape', {
          width: 100,
          height: 6,
          bgColor: '#10b981',
          x: 50,
          y: 280,
          borderRadius: 4,
          borderStyle: 'none',
        }),
      ]
      slideConfigs.value[1] = { bgColor: '#f8fafc', bgImage: null, transition: 'fade' }
    } else if (templateId === 'dark') {
      documentState.value[1] = [
        createTemplateElement('text', {
          content: 'DISEÑO ELEGANTE',
          color: '#ffffff',
          fontSize: 64,
          fontWeight: '400',
          letterSpacing: 10,
          textAlign: 'center',
          width: w,
          x: 0,
          y: h / 2 - 80,
        }),
        createTemplateElement('text', {
          content: 'Minimalismo en su máxima expresión',
          color: '#8b949e',
          fontSize: 20,
          textAlign: 'center',
          width: w,
          x: 0,
          y: h / 2 + 20,
        }),
      ]
      slideConfigs.value[1] = { bgColor: '#0d1117', bgImage: null, transition: 'slide' }
    } else if (templateId === 'custom') {
      documentState.value[1] = []
      slideConfigs.value[1] = { bgColor: '#ffffff', bgImage: null, transition: 'none' }
    }
  }

  // --- GESTIÓN DE PÁGINAS ---
  const deleteSlide = (page: number) => {
  if (isTemplateCreatorMode.value) return
  if (numPages.value <= 1) {
      showToast('No puedes eliminar la única diapositiva del proyecto.', 'warning');
      return;
  }
      if (!confirm(`¿Estás seguro de eliminar la Diapositiva ${page}?`)) return

    for (let i = page; i < numPages.value; i++) {
      documentState.value[i] = documentState.value[i + 1] || []
      slideConfigs.value[i] = slideConfigs.value[i + 1] || {
        bgColor: '#ffffff',
        bgImage: null,
        transition: 'none',
      }
      pdfPageMap.value[i] = pdfPageMap.value[i + 1] || 0
    }
    delete documentState.value[numPages.value]
    delete slideConfigs.value[numPages.value]
    delete pdfPageMap.value[numPages.value]
    numPages.value -= 1
    changePageTo(Math.min(pageNum.value, numPages.value))
  }

  const duplicateSlide = (page: number) => {
    if (isTemplateCreatorMode.value) return
    for (let i = numPages.value; i > page; i--) {
      documentState.value[i + 1] = documentState.value[i]
      slideConfigs.value[i + 1] = slideConfigs.value[i]
      pdfPageMap.value[i + 1] = pdfPageMap.value[i]
    }
    documentState.value[page + 1] = (documentState.value[page] || []).map((el) => ({
      ...el,
      id: `el_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    }))
    slideConfigs.value[page + 1] = { ...slideConfigs.value[page] }
    pdfPageMap.value[page + 1] = pdfPageMap.value[page]
    numPages.value += 1
    changePageTo(page + 1)
  }

  const swapSlides = (p1: number, p2: number) => {
    ;[documentState.value[p1], documentState.value[p2]] = [
      documentState.value[p2],
      documentState.value[p1],
    ]
    ;[slideConfigs.value[p1], slideConfigs.value[p2]] = [
      slideConfigs.value[p2],
      slideConfigs.value[p1],
    ]
    ;[pdfPageMap.value[p1], pdfPageMap.value[p2]] = [pdfPageMap.value[p2], pdfPageMap.value[p1]]
  }

  const moveSlide = (page: number, direction: 'up' | 'down') => {
    const targetPage = direction === 'up' ? page - 1 : page + 1
    if (targetPage >= 1 && targetPage <= numPages.value) {
      swapSlides(page, targetPage)
      if (pageNum.value === page || pageNum.value === targetPage) changePageTo(targetPage)
      else renderPage(pageNum.value)
    }
  }

  const addNewSlide = () => {
    if (isTemplateCreatorMode.value) return
    let newPage = numPages.value + 1

    // Tamaño base siempre heredado de las diapositivas existentes
    const template = projectConfigs.value.template || 'blank'

    if (template === 'custom') {
      // Si la plantilla vino de biblioteca, clonamos siempre la diapositiva base (2)
      const masterElements = documentState.value[2] || []
      const masterConfig = slideConfigs.value[2] || { bgColor: '#ffffff', bgImage: null, transition: 'none' }

      if (hasTemplateClosingSlide.value && numPages.value >= 3) {
        const insertAt = numPages.value
        for (let i = numPages.value; i >= insertAt; i--) {
          documentState.value[i + 1] = documentState.value[i]
          slideConfigs.value[i + 1] = slideConfigs.value[i]
          pdfPageMap.value[i + 1] = pdfPageMap.value[i]
        }
        newPage = insertAt
      }

      documentState.value[newPage] = JSON.parse(JSON.stringify(masterElements)).map((el: any) => ({
        ...el,
        id: `el_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      }))
      slideConfigs.value[newPage] = JSON.parse(JSON.stringify(masterConfig))
      pdfPageMap.value[newPage] = 0
      numPages.value += 1
    } else if (template === 'blank') {
      numPages.value += 1
      slideConfigs.value[newPage] = {
        bgColor: '#ffffff',
        bgImage: null,
        transition: 'none',
      }
      pdfPageMap.value[newPage] = 0
      documentState.value[newPage] = []

    } else if (template === 'modern') {
      numPages.value += 1
      slideConfigs.value[newPage] = {
        bgColor: '#ffffff',
        bgImage: null,
        transition: 'none',
      }
      pdfPageMap.value[newPage] = 0
      const w = baseWidth.value
      const h = baseHeight.value
      documentState.value[newPage] = [
        createTemplateElement('shape', {
          width: w, height: 180, bgColor: '#2563eb',
          x: 0, y: 0, borderRadius: 0, borderStyle: 'none', borderWidth: 0,
        }),
        createTemplateElement('text', {
          content: 'Título de la diapositiva',
          color: '#ffffff', fontSize: 48, fontWeight: '800',
          x: 50, y: 55, width: w - 100,
        }),
        createTemplateElement('text', {
          content: 'Añade tu contenido aquí',
          color: '#334155', fontSize: 24,
          x: 50, y: 220, width: w - 100,
        }),
        createTemplateElement('shape', {
          width: 100, height: 6, bgColor: '#10b981',
          x: 50, y: 280, borderRadius: 4, borderStyle: 'none', borderWidth: 0,
        }),
      ]
      slideConfigs.value[newPage].bgColor = '#f8fafc'

    } else if (template === 'dark') {
      numPages.value += 1
      slideConfigs.value[newPage] = {
        bgColor: '#ffffff',
        bgImage: null,
        transition: 'none',
      }
      pdfPageMap.value[newPage] = 0
      const w = baseWidth.value
      const h = baseHeight.value
      documentState.value[newPage] = [
        createTemplateElement('text', {
          content: 'TÍTULO PRINCIPAL',
          color: '#ffffff', fontSize: 64, fontWeight: '400',
          letterSpacing: 10, textAlign: 'center',
          width: w, x: 0, y: h / 2 - 80,
        }),
        createTemplateElement('text', {
          content: 'Subtítulo de la diapositiva',
          color: '#8b949e', fontSize: 20, textAlign: 'center',
          width: w, x: 0, y: h / 2 + 20,
        }),
      ]
      slideConfigs.value[newPage].bgColor = '#0d1117'

    } else {
      documentState.value[newPage] = []
      numPages.value += 1
      slideConfigs.value[newPage] = {
        bgColor: '#ffffff',
        bgImage: null,
        transition: 'none',
      }
      pdfPageMap.value[newPage] = 0
    }

    changePageTo(newPage)
  }

  const changePageTo = async (num: number) => {
    if (num >= 1 && num <= numPages.value) {
      if (!playMode.value && hasDoc.value) {
      await captureThumbnail();
    }
      pageNum.value = num
      currentAnimationStep.value = 0
      selectedElementIds.value = []
      renderTrigger.value++
      activeTransition.value = 'none'
      await nextTick()
      if (workspaceRef.value) void workspaceRef.value.offsetWidth
      activeTransition.value = slideConfigs.value[num]?.transition || 'none'
      renderPage(num)
    }
  }

  const executeEvents = (element: any, triggerType: 'click' | 'hover', subIndex: number | null = null) => {
    if (!playMode.value || !element.events) return;
    element.events.filter((ev: any) => ev.trigger === triggerType && (ev.sourceSubId === undefined || ev.sourceSubId === null || ev.sourceSubId === subIndex)).forEach((ev: any) => {
      if (ev.action === 'goToPage') {
        changePageTo(Number(ev.targetId));
        return;
      }
      const targetElement = currentPageElements.value.find((el: any) => el.id === ev.targetId);
      if (targetElement) {
        if (ev.action === 'show') {
          targetElement.isHidden = false;
        } else if (ev.action === 'hide') {
          targetElement.isHidden = true;
        } else if (ev.action === 'toggle') {
          targetElement.isHidden = !targetElement.isHidden;
        }
      }
    });
  };

  const changeZoom = (delta: number) => (zoom.value = Math.max(0.2, Math.min(zoom.value + delta, 4)))

  const fitToScreen = () => {
    if (workspaceRef.value) {
      const scaleX = (workspaceRef.value.clientWidth - 60) / baseWidth.value
      const scaleY = (workspaceRef.value.clientHeight - 60) / baseHeight.value
      if (playMode.value) {
        zoom.value = Math.max(0.1, Math.min(scaleX, scaleY, 1.0))
      } else {
        zoom.value = Math.max(0.1, Math.min(scaleX, scaleY))
      }

      // NUEVO: Centrar el lienzo nuevamente
      panX.value = 0;
      panY.value = 0;
    }
  }

  // --- LÓGICA DE NAVEGACIÓN DEL LIENZO ---
  const handleCanvasWheel = (e: WheelEvent) => {
    if (playMode.value) return;

    if (e.ctrlKey || e.metaKey) {
      // Zoom con Ctrl + Rueda
      e.preventDefault();
      const zoomDelta = e.deltaY * -0.002; // Ajusta la sensibilidad aquí
      zoom.value = Math.max(0.1, Math.min(zoom.value + zoomDelta, 4));
    } else {
      // Desplazamiento libre (Pan) con trackpad o rueda normal
      panX.value -= e.deltaX;
      panY.value -= e.deltaY;
    }
  };

  let wasDraggingOrPanning = false;

  const handleCanvasPanStart = (e: MouseEvent) => {
    if (playMode.value) return;

    wasDraggingOrPanning = false;

    // 🎯 PRIORIDAD 1: Botón central O (Espacio + Botón izquierdo) = PANNING
    if (e.button === 1 || (e.button === 0 && isSpacePressed.value)) {
      e.preventDefault();
      e.stopPropagation();
      isPanning.value = true;

      const panStartX = e.clientX;
      const panStartY = e.clientY;
      const initialPanX = panX.value;
      const initialPanY = panY.value;

      const onMouseMove = (moveEvent: MouseEvent) => {
        wasDraggingOrPanning = true;
        panX.value = initialPanX + (moveEvent.clientX - panStartX);
        panY.value = initialPanY + (moveEvent.clientY - panStartY);
      };

      const onMouseUp = () => {
        isPanning.value = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        setTimeout(() => { wasDraggingOrPanning = false; }, 0);
      };

      document.addEventListener('mousemove', onMouseMove, { passive: false });
      document.addEventListener('mouseup', onMouseUp, { once: true });
      return;
    }

    // 🎯 PRIORIDAD 2: Botón izquierdo = MARQUEE SELECTION (como Figma)
    if (e.button === 0) {
      if (activeTool.value !== 'select') return;

      e.preventDefault();
      isMarqueeSelecting.value = false;
      const marqueeStartX = e.clientX;
      const marqueeStartY = e.clientY;

      // Limpiar selección anterior si no es Shift/Ctrl
      if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
        selectedElementIds.value = [];
        activeMapNodeId.value = null;
      }

      const onMouseMove = (moveEvent: MouseEvent) => {
        const currentX = moveEvent.clientX;
        const currentY = moveEvent.clientY;

        // Detectar arrastre real (umbral 3px)
        if (!wasDraggingOrPanning && (Math.abs(currentX - marqueeStartX) > 3 || Math.abs(currentY - marqueeStartY) > 3)) {
          wasDraggingOrPanning = true;
          isMarqueeSelecting.value = true;
        }

        if (wasDraggingOrPanning) {
          const startCanvas = screenToCanvas(marqueeStartX, marqueeStartY);
          const currentCanvas = screenToCanvas(currentX, currentY);

          marqueeRect.value.x = Math.min(startCanvas.x, currentCanvas.x);
          marqueeRect.value.y = Math.min(startCanvas.y, currentCanvas.y);
          marqueeRect.value.width = Math.abs(currentCanvas.x - startCanvas.x);
          marqueeRect.value.height = Math.abs(currentCanvas.y - startCanvas.y);
        }
      };

      const onMouseUp = () => {
        // Procesar selección solo si realmente arrastramos
        if (wasDraggingOrPanning && isMarqueeSelecting.value) {
          currentPageElements.value.forEach(el => {
            if (el.isHidden || el.isLocked) return;

            const elWidth = typeof el.width === 'number' ? el.width : 150;
            const elHeight = typeof el.height === 'number' ? el.height : 50;

            // Verificar intersección
            if (!(el.x + elWidth < marqueeRect.value.x ||
                  el.x > marqueeRect.value.x + marqueeRect.value.width ||
                  el.y + elHeight < marqueeRect.value.y ||
                  el.y > marqueeRect.value.y + marqueeRect.value.height)) {
              if (!selectedElementIds.value.includes(el.id)) {
                selectedElementIds.value.push(el.id);
              }
            }
          });
        }

        isMarqueeSelecting.value = false;
        marqueeRect.value = { x: 0, y: 0, width: 0, height: 0 };

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        setTimeout(() => { wasDraggingOrPanning = false; }, 0);
      };

      document.addEventListener('mousemove', onMouseMove, { passive: false });
      document.addEventListener('mouseup', onMouseUp, { once: true });
    }
  };
  // --- CREACIÓN Y SELECCIÓN DE ELEMENTOS ---
  // Convierte coordenadas del ratón (pantalla) a coordenadas del lienzo
  const screenToCanvas = (clientX: number, clientY: number) => {
    const workspace = workspaceRef.value
    if (!workspace) return { x: 0, y: 0 }

    // Busca el canvas-shadow-box para obtener su posición real en pantalla
    const canvasEl = workspace.querySelector('.canvas-shadow-box') as HTMLElement
    if (!canvasEl) return { x: 0, y: 0 }

    const rect = canvasEl.getBoundingClientRect()
    const x = (clientX - rect.left) / zoom.value
    const y = (clientY - rect.top) / zoom.value
    return { x, y }
  }

  const handleCanvasClick = (e: MouseEvent) => {
    if (playMode.value) return;
    if (wasDraggingOrPanning) return;

    // Ignorar clics sobre elementos interactivos o controladores ya existentes
    const target = e.target as HTMLElement;
    if (target.closest('.interactive-element') || target.closest('.figma-bounding-box')) {
      return;
    }

    if (activeTool.value === 'select') {
      if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
        selectedElementIds.value = [];
        activeMapNodeId.value = null;
      }
    } else {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      placeNewElement(x, y);
    }
  }

const handleCanvasClickOutside = (e: MouseEvent) => {
  if (playMode.value) return
  if (wasDraggingOrPanning) return;

  if (activeTool.value === 'select') {
    if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
      selectedElementIds.value = [];
      activeMapNodeId.value = null;
    }
  } else {
    // Si hacemos click en el área gris para poner un nuevo elemento
    if (e.target === workspaceRef.value) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      placeNewElement(x, y);
    }
  }
}

  // Lógica compartida de creación de elemento
  const placeNewElement = (x: number, y: number) => {
    const defaults = JSON.parse(JSON.stringify(ELEMENT_DEFAULTS[activeTool.value] || {}));
    const elWidth = typeof defaults.width === 'number' ? defaults.width : 200;
    // Si el height es 'auto' (como en los textos), estimamos unos 50px de altura para centrarlo visualmente
    const elHeight = typeof defaults.height === 'number' ? defaults.height : 50;

    const newElement = {
      id: `el_${Date.now()}`,
      type: activeTool.value,
      opacity: 1,
      rotation: 0,
      mixBlendMode: 'normal',
      isHidden: false,
      isLocked: false,
      groupId: null,
      animationType: 'none',
      animationTrigger: 'onClick',
      animationOrder: 0,
      ...defaults,
      x: x - (elWidth / 2),
      y: y - (elHeight / 2),
    }

    if (!documentState.value[pageNum.value]) documentState.value[pageNum.value] = []
    documentState.value[pageNum.value].push(newElement)
    selectedElementIds.value = [newElement.id]
    if (activeTool.value === 'mindmap') activeMapNodeId.value = newElement.nodes[0].id
    activeTool.value = 'select'
  }

  const selectElement = (id: string, e?: MouseEvent) => {
    const el = currentPageElements.value.find((e) => e.id === id)
    if (!el || el.isLocked) return

    if (el.type !== 'mindmap') activeMapNodeId.value = null

    if (e && e.shiftKey) {
      if (selectedElementIds.value.includes(id)) {
        selectedElementIds.value = selectedElementIds.value.filter((i) => i !== id)
      } else {
        selectedElementIds.value.push(id)
      }
    } else {
      if (el.groupId) {
        selectedElementIds.value = currentPageElements.value
          .filter((e) => e.groupId === el.groupId)
          .map((e) => e.id)
      } else {
        selectedElementIds.value = [id]
      }
    }
    activeTool.value = 'select'
  }

  const deleteSelected = () => {
    if (selectedElementIds.value.length === 0) return
    documentState.value[pageNum.value] = documentState.value[pageNum.value].filter(
      (el) => !selectedElementIds.value.includes(el.id),
    )
    selectedElementIds.value = []
    activeMapNodeId.value = null
  }

  // --- ALINEACIÓN Y GRUPOS ---
  const groupElements = () => {
    const groupId = 'group_' + Date.now()
    currentPageElements.value.forEach((e) => {
      if (selectedElementIds.value.includes(e.id)) e.groupId = groupId
    })
  }

  const ungroupElements = () => {
    currentPageElements.value.forEach((e) => {
      if (selectedElementIds.value.includes(e.id)) e.groupId = null
    })
  }

  const alignElements = (type: string) => {
    const els = currentPageElements.value.filter((e) => selectedElementIds.value.includes(e.id))
    if (els.length < 2) return

    if (type === 'left') {
      const minX = Math.min(...els.map((e) => e.x))
      els.forEach((e) => (e.x = minX))
    } else if (type === 'center') {
      const minX = Math.min(...els.map((e) => e.x))
      const maxX = Math.max(...els.map((e) => e.x + (typeof e.width === 'number' ? e.width : 100)))
      const midX = minX + (maxX - minX) / 2
      els.forEach((e) => (e.x = midX - (typeof e.width === 'number' ? e.width : 100) / 2))
    } else if (type === 'right') {
      const maxX = Math.max(...els.map((e) => e.x + (typeof e.width === 'number' ? e.width : 100)))
      els.forEach((e) => (e.x = maxX - (typeof e.width === 'number' ? e.width : 100)))
    } else if (type === 'top') {
      const minY = Math.min(...els.map((e) => e.y))
      els.forEach((e) => (e.y = minY))
    } else if (type === 'middle') {
      const minY = Math.min(...els.map((e) => e.y))
      const maxY = Math.max(...els.map((e) => e.y + (typeof e.height === 'number' ? e.height : 100)))
      const midY = minY + (maxY - minY) / 2
      els.forEach((e) => (e.y = midY - (typeof e.height === 'number' ? e.height : 100) / 2))
    } else if (type === 'bottom') {
      const maxY = Math.max(...els.map((e) => e.y + (typeof e.height === 'number' ? e.height : 100)))
      els.forEach((e) => (e.y = maxY - (typeof e.height === 'number' ? e.height : 100)))
    }
  }

  const addAccordionSection = () =>
    selectedElement.value?.items.push({ title: 'Nueva', content: '...', isOpen: false })
  const removeBackgroundImage = () => {
    if (slideConfigs.value[pageNum.value]) {
      slideConfigs.value[pageNum.value].bgImage = null
      renderPage(pageNum.value)
    }
  }
  const clearDrawCanvas = (el: any) => (el.lines = [])

  // BASE64 AL SUBIR ARCHIVOS LOCALES
  // --- OPTIMIZADOR DE IMÁGENES AL VUELO ---
  const optimizeImage = (file: File, maxWidth = 3840, maxHeight = 2160, quality = 0.9): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Si la imagen es más grande que nuestro límite, la reducimos manteniendo proporciones
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // Dibujamos la imagen reducida en un canvas invisible
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Exportamos como WebP (Súper ligero y soporta fondos transparentes)
            resolve(canvas.toDataURL('image/webp', quality));
          } else {
            resolve(img.src); // Fallback por seguridad
          }
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };
  // --- OPTIMIZAR IMÁGENES BASE64 HEREDADAS ---
  const optimizeBase64Image = (base64Str: string, maxWidth = 3840, maxHeight = 2160, quality = 0.9): Promise<string> => {
    return new Promise((resolve) => {
      // Si no es un base64 de imagen o pesa menos de ~400KB, no gastamos recursos en tocarla
      if (!base64Str.startsWith('data:image/') || base64Str.length < 500000) {
        return resolve(base64Str);
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', quality));
        } else {
          resolve(base64Str); // Fallback si falla el canvas
        }
      };
      img.onerror = () => resolve(base64Str); // Fallback si la imagen está corrupta
      img.src = base64Str;
    });
  };

  // Función que barre todo el proyecto buscando imágenes pesadas
  const autoOptimizeProjectImages = async () => {
    let optimizedCount = 0;

    // 1. Revisar fondos de diapositivas
    for (const page in slideConfigs.value) {
      const config = slideConfigs.value[page];
      if (config.bgImage && config.bgImage.startsWith('data:image/') && config.bgImage.length > 500000) {
        config.bgImage = await optimizeBase64Image(config.bgImage, 3840, 2160, 0.9);
        optimizedCount++;
      }
    }

    // 2. Revisar elementos tipo 'image' en todas las diapositivas
    for (const page in documentState.value) {
      const elements = documentState.value[page];
      for (const el of elements) {
        if (el.type === 'image' && el.src && el.src.startsWith('data:image/') && el.src.length > 500000) {
          el.src = await optimizeBase64Image(el.src, 3840, 2160, 0.9);
          optimizedCount++;
        }
      }
    }

    // Si encontramos y arreglamos imágenes pesadas, guardamos el proyecto limpio
    if (optimizedCount > 0) {
      console.log(`Se han optimizado y aligerado ${optimizedCount} imágenes de este proyecto antiguo.`);
      savePresentation(true); // Autoguardado silencioso
    }
  };

  // BASE64 AL SUBIR ARCHIVOS LOCALES CON OPTIMIZACIÓN
  const handleLocalMediaUpload = async (event: Event, el: any) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Si es una imagen, la pasamos por la trituradora para optimizarla
    if (file.type.startsWith('image/')) {
      try {
        const optimizedSrc = await optimizeImage(file, 3840, 3840, 0.9);
        el.src = optimizedSrc;
        if (el.type === '3d') el.name = file.name;
        saveHistory();
      } catch (error) {
        console.error("Error optimizando imagen:", error);
        showToast('Error al procesar la imagen', 'error');
      }
    } else {
      // Archivos no-imagen (audio, video, modelos 3D) van directos
      const reader = new FileReader();
      reader.onload = (e) => {
        el.src = e.target?.result as string;
        if (el.type === '3d') el.name = file.name;
        saveHistory();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComparatorUpload = async (
    event: Event,
    el: any,
    field: 'imageBefore' | 'imageAfter'
  ) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file || !el) return;

    try {
      const optimizedSrc = await optimizeImage(file, 3840, 3840, 0.9);
      el[field] = optimizedSrc;
      saveHistory();
      target.value = '';
    } catch (error) {
      console.error('Error optimizando imagen del comparador:', error);
      showToast('Error al procesar la imagen', 'error');
    }
  };

  const comparatorDragState = ref<{
    el: any;
    container: HTMLElement;
    initialSlider: number;
  } | null>(null);

  const getComparatorSliderPosition = (clientX: number, container: HTMLElement) => {
    const rect = container.getBoundingClientRect();
    if (!rect.width) return 50;
    const raw = ((clientX - rect.left) / rect.width) * 100;
    return Math.max(0, Math.min(100, Math.round(raw)));
  };

  const onComparatorDragMove = (event: MouseEvent) => {
    const state = comparatorDragState.value;
    if (!state) return;
    state.el.sliderPosition = getComparatorSliderPosition(event.clientX, state.container);
  };

  const clearComparatorDragListeners = () => {
    document.removeEventListener('mousemove', onComparatorDragMove);
    document.removeEventListener('mouseup', onComparatorDragEnd);
  };

  const onComparatorDragEnd = () => {
    const state = comparatorDragState.value;
    if (!state) return;
    const didChange = Number(state.el.sliderPosition ?? 50) !== state.initialSlider;
    comparatorDragState.value = null;
    clearComparatorDragListeners();
    if (didChange) saveHistory();
  };

  const startComparatorDrag = (event: MouseEvent, el: any) => {
    const container = event.currentTarget as HTMLElement | null;
    if (!el || !container) return;

    clearComparatorDragListeners();
    comparatorDragState.value = {
      el,
      container,
      initialSlider: Number(el.sliderPosition ?? 50),
    };

    el.sliderPosition = getComparatorSliderPosition(event.clientX, container);
    document.addEventListener('mousemove', onComparatorDragMove);
    document.addEventListener('mouseup', onComparatorDragEnd);
  };

  onUnmounted(() => {
    comparatorDragState.value = null;
    clearComparatorDragListeners();
  });

  const setSlideBackgroundImage = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      try {
        // Los fondos suelen necesitar abarcar toda la pantalla, usamos formato panorámico de límite
        const optimizedSrc = await optimizeImage(file, 3840, 2160, 0.9);
        slideConfigs.value[pageNum.value].bgImage = optimizedSrc;
        renderPage(pageNum.value);
        saveHistory();
      } catch (error) {
        console.error("Error optimizando fondo:", error);
        showToast('Error al subir el fondo', 'error');
      }
    }
  };

  // --- DIBUJO SVG ---
  let isDrawingSVG = false,
    currentLine: any = null
  const startSvgDraw = (e: MouseEvent, el: any) => {
    if (playMode.value) return
    e.preventDefault()
    isDrawingSVG = true
    const rect = (e.target as SVGSVGElement).getBoundingClientRect()
    currentLine = {
      color: el.brushColor || '#ff0000',
      size: el.brushSize || 4,
      points: [{ x: (e.clientX - rect.left) / zoom.value, y: (e.clientY - rect.top) / zoom.value }],
    }
    if (!el.lines) el.lines = []
    el.lines.push(currentLine)
  }
  const doSvgDraw = (e: MouseEvent, el: any) => {
    if (!isDrawingSVG || !currentLine || playMode.value) return
    e.preventDefault()
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
    currentLine.points.push({
      x: (e.clientX - rect.left) / zoom.value,
      y: (e.clientY - rect.top) / zoom.value,
    })
  }
  const stopSvgDraw = () => {
    isDrawingSVG = false
    currentLine = null
  }

  // --- AUDIO ---
  const playAudio = (el: any) => {
    if (!playMode.value) return
    document.querySelectorAll('audio').forEach((a) => {
      if (a.src !== el.src) a.pause()
    })
    currentPageElements.value.forEach((item) => {
      if (item.type === 'audio' && item.id !== el.id) item.isPlaying = false
    })
    const audioEl = document.querySelector(`audio[src="${el.src}"]`) as HTMLAudioElement
    if (audioEl) {
      el.isPlaying ? audioEl.pause() : audioEl.play()
      el.isPlaying = !el.isPlaying
    }
  }
  // --- ARRASTRE Y REDIMENSIÓN CON SNAPPING (IMÁN) ---
  const isMarqueeSelecting = ref(false);
  const marqueeRect = ref({ x: 0, y: 0, width: 0, height: 0 });

  let isDragging = false,
    isResizing = false,
    startX = 0,
    startY = 0,
    initialPositions: any[] = [],
    initialWidth = 0,
    initialHeight = 0;

  const startDrag = (e: MouseEvent, el: any, isHandle: boolean = false) => {
    if (playMode.value) return;

    if (isSelectingTargetForEvent.value) {
      e.stopPropagation();
      e.preventDefault();
      const targetEv = selectedElement.value?.events?.find((ev: any) => ev.id === isSelectingTargetForEvent.value);
      if (targetEv) targetEv.targetId = el.id;
      isSelectingTargetForEvent.value = null;
      return;
    }

    if (isResizing || el.isLocked || (el.type === 'draw' && !isHandle)) return;
    if (editingElementId.value === el.id) return;

    // Si hay una herramienta activa distinta de select, crear elemento en esa posición
    // en lugar de arrastrar el existente
    if (activeTool.value !== 'select') {
      const { x, y } = screenToCanvas(e.clientX, e.clientY)
      placeNewElement(x, y)
      return
    }

    e.preventDefault();

    let hasMoved = false;

    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      if (selectedElementIds.value.includes(el.id)) {
        selectedElementIds.value = selectedElementIds.value.filter((i) => i !== el.id);
      } else {
        selectedElementIds.value.push(el.id);
      }
    } else {
      if (!selectedElementIds.value.includes(el.id)) {
        selectElement(el.id);
      }
    }

    if (!selectedElementIds.value.includes(el.id)) return;

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    const draggedEls = currentPageElements.value.filter(
      (elem) => selectedElementIds.value.includes(elem.id) && !elem.isLocked,
    );

    // Guardar posiciones y estimar dimensiones para el cálculo magnético
    initialPositions = draggedEls.map((elem) => ({
      id: elem.id,
      startX: elem.x,
      startY: elem.y,
      width: typeof elem.width === 'number' ? elem.width : 150, // Fallback si es 'auto'
      height: typeof elem.height === 'number' ? elem.height : 50,
    }));

    // 1. Calcular la caja delimitadora (Bounding Box) inicial de la selección
    const initMinX = Math.min(...initialPositions.map(p => p.startX));
    const initMinY = Math.min(...initialPositions.map(p => p.startY));
    const initMaxX = Math.max(...initialPositions.map(p => p.startX + p.width));
    const initMaxY = Math.max(...initialPositions.map(p => p.startY + p.height));
    const initWidth = initMaxX - initMinX;
    const initHeight = initMaxY - initMinY;

    // 2. Extraer puntos a los que nos queremos pegar (Lienzo + Otros Elementos)
    const targetElements = currentPageElements.value.filter(
      (elem) => !selectedElementIds.value.includes(elem.id) && !elem.isHidden
    );

    // Puntos del lienzo (Izquierda, Centro, Derecha / Arriba, Medio, Abajo)
    const snapXPoints = [0, baseWidth.value / 2, baseWidth.value];
    const snapYPoints = [0, baseHeight.value / 2, baseHeight.value];

    // Puntos de otros elementos
    targetElements.forEach(t => {
      const tw = typeof t.width === 'number' ? t.width : 150;
      const th = typeof t.height === 'number' ? t.height : 50;
      snapXPoints.push(t.x, t.x + tw / 2, t.x + tw);
      snapYPoints.push(t.y, t.y + th / 2, t.y + th);
    });

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging) return;

      // Movimiento raw del ratón ajustado al zoom
      const rawDx = (moveEvent.clientX - startX) / zoom.value;
      const rawDy = (moveEvent.clientY - startY) / zoom.value;

      if (!hasMoved && (Math.abs(moveEvent.clientX - startX) > 3 || Math.abs(moveEvent.clientY - startY) > 3)) {
        hasMoved = true;
      }

      let finalDx = rawDx;
      let finalDy = rawDy;

      activeGuides.value = [];

      if (hasMoved && !moveEvent.shiftKey) {
        const projX = initMinX + rawDx;
        const projY = initMinY + rawDy;
        const projMidX = projX + initWidth / 2;
        const projMaxX = projX + initWidth;
        const projMidY = projY + initHeight / 2;
        const projMaxY = projY + initHeight;

        const dynamicThreshold = SNAP_THRESHOLD / zoom.value;

        const findSnap = (projPoints: number[], snapPoints: number[], initPoints: number[]) => {
          let bestDelta = null;
          let minDistance = dynamicThreshold + 1;
          let snappedPos = null;

          for (let i = 0; i < projPoints.length; i++) {
            for (const snapP of snapPoints) {
              const dist = Math.abs(projPoints[i] - snapP);
              if (dist < minDistance) {
                minDistance = dist;
                bestDelta = snapP - initPoints[i];
                snappedPos = snapP;
              }
            }
          }
          return { bestDelta, snappedPos };
        };

        const resX = findSnap([projX, projMidX, projMaxX], snapXPoints, [initMinX, initMinX + initWidth / 2, initMaxX]);
        if (resX.bestDelta !== null) {
          finalDx = resX.bestDelta;
          activeGuides.value.push({ type: 'vertical', pos: resX.snappedPos as number });
        }

        const resY = findSnap([projY, projMidY, projMaxY], snapYPoints, [initMinY, initMinY + initHeight / 2, initMaxY]);
        if (resY.bestDelta !== null) {
          finalDy = resY.bestDelta;
          activeGuides.value.push({ type: 'horizontal', pos: resY.snappedPos as number });
        }
      }

      if (hasMoved) {
        draggedEls.forEach((elem) => {
          const initPos = initialPositions.find((p) => p.id === elem.id);
          if (initPos) {
            if (moveEvent.shiftKey) {
              elem.x = initPos.startX + finalDx;
              elem.y = initPos.startY + finalDy;
            } else {
              elem.x = Math.round((initPos.startX + finalDx) * 2) / 2;
              elem.y = Math.round((initPos.startY + finalDy) * 2) / 2;
            }
          }
        });
      }
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      isDragging = false;
      activeGuides.value = [];
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      if (!hasMoved && !upEvent.shiftKey && !upEvent.ctrlKey && !upEvent.metaKey) {
        selectElement(el.id);
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };


  // --- REDIMENSIÓN (CON SOPORTE PARA ROTACIÓN Y ASPECT RATIO) ---
  const startResize = (e: MouseEvent, el: any, corner: string) => {
    if (playMode.value || el.isLocked) return;
    e.preventDefault();
    isResizing = true;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialWidth = typeof el.width === 'number' ? el.width : 100;
    const initialHeight = el.height === 'auto' ? 50 : el.height;
    const initialX = el.x;
    const initialY = el.y;
    const rotation = (el.rotation || 0) * (Math.PI / 180); // Ángulo en radianes

    if (el.height === 'auto') el.height = initialHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing) return;

      // Diferencia del ratón en la pantalla real
      const dx = (moveEvent.clientX - startX) / zoom.value;
      const dy = (moveEvent.clientY - startY) / zoom.value;

      // Desrotar el movimiento del ratón para saber cuánto se movió relativo al propio elemento
      const localDx = dx * Math.cos(-rotation) - dy * Math.sin(-rotation);
      const localDy = dx * Math.sin(-rotation) + dy * Math.cos(-rotation);

      let newW = initialWidth;
      let newH = initialHeight;
      let deltaX = 0;
      let deltaY = 0;

      // Ajustar ancho/alto y posición relativa según la esquina arrastrada
      if (corner.includes('e')) {
        newW = initialWidth + localDx;
      } else if (corner.includes('w')) {
        newW = initialWidth - localDx;
        deltaX = localDx;
      }

      if (corner.includes('s')) {
        newH = initialHeight + localDy;
      } else if (corner.includes('n')) {
        newH = initialHeight - localDy;
        deltaY = localDy;
      }

      // Mantener proporciones si se pulsa Shift
      if (moveEvent.shiftKey) {
        const ratio = initialWidth / initialHeight;
        if (Math.abs(localDx) > Math.abs(localDy)) {
          newH = newW / ratio;
          if (corner.includes('n')) deltaY = initialHeight - newH;
        } else {
          newW = newH * ratio;
          if (corner.includes('w')) deltaX = initialWidth - newW;
        }
      }

      // Límite mínimo de tamaño
      if (newW < 20) { newW = 20; deltaX = initialWidth - 20; }
      if (newH < 20) { newH = 20; deltaY = initialHeight - 20; }

      // Re-rotar el desplazamiento (deltaX, deltaY) para actualizar la posición (x, y) en el lienzo
      const globalDx = deltaX * Math.cos(rotation) - deltaY * Math.sin(rotation);
      const globalDy = deltaX * Math.sin(rotation) + deltaY * Math.cos(rotation);

      el.width = newW;
      el.height = newH;
      el.x = initialX + globalDx;
      el.y = initialY + globalDy;
    };

    const onMouseUp = () => {
      isResizing = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // --- ROTACIÓN (CENTRO EXACTO) ---

  // --- ROTACIÓN (CENTRO EXACTO, ESTILO FIGMA) ---
  let isRotating = false;

  const startRotate = (e: MouseEvent, el: any) => {
    if (playMode.value || el.isLocked) return;
    e.preventDefault();
    isRotating = true;

    // 1. Obtenemos el elemento exacto del DOM
    const domElement = (e.target as HTMLElement).closest('.interactive-element') as HTMLElement;
    if (!domElement) return;

      // 2. El centro de una caja rotada (BoundingClientRect) es siempre constante y exacto.
      // Nos da el pivote matemáticamente perfecto en coordenadas reales de la pantalla
      // evitando latencias de cálculo anidado.
      const rect = domElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

    // 3. Ángulo en el instante exacto en que hacemos clic
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const initialRotation = el.rotation || 0;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isRotating) return;

      // 4. Ángulo actual del ratón respecto al centro
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);

      // 5. Sumamos la diferencia angular a la rotación que ya tenía el elemento
      let finalRotation = initialRotation + (currentAngle - startAngle);

      // 6. Si mantiene pulsado Shift, forzamos saltos magnéticos de 15 grados
      if (moveEvent.shiftKey) {
        finalRotation = Math.round(finalRotation / 15) * 15;
      }

      // 7. Normalizamos el resultado para que SIEMPRE esté entre 0 y 360.
      // Esto evita que de tirones cuando la fórmula matemática cruza de 180° a -180°.
      finalRotation = (finalRotation % 360 + 360) % 360;

      el.rotation = Math.round(finalRotation);
    };

    const onMouseUp = () => {
      isRotating = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const triggerInteraction = (el: any) => {
    if (!playMode.value) return
    currentPageElements.value.forEach((item) => {
      if (item.id !== el.id && item.type === 'interactive') item.isOpen = false
    })
    el.isOpen = !el.isOpen
  }

  // --- PLAY MODE & TIMERS ---
  // --- PLAY MODE & TIMERS (CON FULLSCREEN API) ---

  // 1. Lógica de estado puro (lo que antes hacía togglePlayMode)
  const setPlayModeState = async (isActive: boolean) => {
    playMode.value = isActive
    currentAnimationStep.value = 0
    selectedElementIds.value = []
    renderTrigger.value++

    if (timerInterval) clearInterval(timerInterval)

    Object.values(documentState.value).forEach((pageItems) => {
      pageItems.forEach((el) => {
        if (el.type === 'interactive') el.isOpen = false
        if (el.type === 'accordion') el.items.forEach((item: any) => (item.isOpen = false))
        if (el.type === 'typewriter') {
          el.displayedText = ''
          el.isTyping = isActive
        }
        if (el.type === 'timer') {
          el.timeLeft = el.duration * 60
          el.isRunning = isActive
        }
        if (el.type === 'audio') {
          el.isPlaying = false
          const a = document.querySelector(`audio[src="${el.src}"]`) as HTMLAudioElement
          if (a) {
            a.pause()
            if (isActive && el.autoplay)
              a.play()
                .then(() => (el.isPlaying = true))
                .catch(() => {})
          }
        }
      })
    })

    if (isActive) {
      activeTransition.value = slideConfigs.value[pageNum.value]?.transition || 'none'
      timerInterval = setInterval(() => {
        Object.values(documentState.value).forEach((pageItems) => {
          pageItems.forEach((el) => {
            if (el.type === 'timer' && el.isRunning && el.timeLeft > 0) el.timeLeft--
            if (el.type === 'typewriter' && el.isTyping && el.displayedText.length < el.content.length) {
              const speed = el.typingSpeed || 100
              if (!el.lastTypewriterTime) el.lastTypewriterTime = Date.now()
              const elapsed = Date.now() - el.lastTypewriterTime
              if (elapsed >= speed) {
                el.displayedText += el.content[el.displayedText.length]
                el.lastTypewriterTime = Date.now()
              }
            }
          })
        })
      }, 50)
    } else {
      activeTransition.value = 'none'
    }

    await nextTick()
    fitToScreen()
  }

  // 2. Función que interactúa con la API del Navegador
  const togglePlayMode = async () => {
    const el = appContainerRef.value || document.documentElement

    if (!playMode.value) {
      // Entrar en pantalla completa
      try {
        if (el.requestFullscreen) await el.requestFullscreen()
        else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen() // Safari
        else if ((el as any).msRequestFullscreen) await (el as any).msRequestFullscreen() // Edge antiguo
      } catch (err) {
        console.warn("El navegador bloqueó el modo pantalla completa:", err)
        setPlayModeState(true) // Fallback: Activarlo de todas formas aunque no sea fullscreen real
      }
    } else {
      // Salir de pantalla completa
      try {
        if (document.exitFullscreen) await document.exitFullscreen()
        else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen()
        else if ((document as any).msExitFullscreen) await (document as any).msExitFullscreen()
      } catch (err) {
        console.warn("No se pudo salir del modo pantalla completa", err)
        setPlayModeState(false) // Fallback
      }
    }
  }

  // 3. Escuchar cambios nativos (ej: si el usuario presiona "ESC")
  const onFullscreenChange = () => {
    const isFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msFullscreenElement
    )

    // Sincronizar el estado de Vue con el estado real del navegador
    if (playMode.value !== isFullscreen) {
      setPlayModeState(isFullscreen)
    }
  }

  const formatIframeUrl = (url: string) => {
    if (!url) return url;
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (trimmed.startsWith('//')) return `https:${trimmed}`;
    return `https://${trimmed}`;
  };

  const getMapStaticImageUrl = (el: any, scaleFactor = 1) => {
    if (!el) return '';
    const zoomRaw = Number(el.zoomLevel ?? 14);
    const zoom = Number.isNaN(zoomRaw) ? 14 : Math.max(1, Math.min(19, zoomRaw));
    const centerLat = Number(el.centerLat ?? 40.4168);
    const centerLng = Number(el.centerLng ?? -3.7038);
    const mapWidth = Math.max(120, Math.min(2048, Math.round((Number(el.width) || 400) * scaleFactor)));
    const mapHeight = Math.max(120, Math.min(2048, Math.round((Number(el.height) || 300) * scaleFactor)));
    const markerList = Array.isArray(el.markers)
      ? el.markers.filter((m: any) => m && m.lat !== undefined && m.lng !== undefined)
      : [];
    const routePoints = Array.isArray(el.routePoints)
      ? el.routePoints.filter((p: any) => p && p.lat !== undefined && p.lng !== undefined)
      : [];

    const params = new URLSearchParams({
      center: `${centerLat},${centerLng}`,
      zoom: String(zoom),
      size: `${mapWidth}x${mapHeight}`,
      maptype: 'mapnik',
    });

    if (markerList.length > 0) {
      const markersParam = markerList
        .map((marker: any) => `${Number(marker.lat)},${Number(marker.lng)},red-pushpin`)
        .join('|');
      params.set('markers', markersParam);
    }

    if (routePoints.length >= 2) {
      const pathParam = routePoints
        .map((point: any) => `${Number(point.lat)},${Number(point.lng)}`)
        .join('|');
      params.set('path', pathParam);
    }

    return `https://staticmap.openstreetmap.de/staticmap.php?${params.toString()}`;
  };

  const getMapFallbackDataUrl = (el: any) => {
    const lat = Number(el?.centerLat ?? 40.4168).toFixed(5);
    const lng = Number(el?.centerLng ?? -3.7038).toFixed(5);
    const zoom = Number(el?.zoomLevel ?? 14);
    const width = Math.max(120, Math.min(1024, Math.round(Number(el?.width) || 400)));
    const height = Math.max(120, Math.min(1024, Math.round(Number(el?.height) || 300)));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e2e8f0"/><stop offset="100%" stop-color="#cbd5e1"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><g fill="none" stroke="#94a3b8" stroke-width="1" opacity="0.45"><path d="M0 0 L${width} ${height}"/><path d="M${width} 0 L0 ${height}"/></g><circle cx="${Math.round(width / 2)}" cy="${Math.round(height / 2)}" r="10" fill="#ef4444"/><text x="50%" y="56%" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#0f172a">Mapa estático no disponible</text><text x="50%" y="66%" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#334155">Centro ${lat}, ${lng} · Zoom ${zoom}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const isIframeBlocked = (url: string) => {
    if (!url) return false;
    try {
      const hostname = new URL(formatIframeUrl(url)).hostname.replace(/^www\./, '').toLowerCase();
      const blockedDomains = ['google.com', 'github.com', 'twitter.com', 'facebook.com', 'linkedin.com', 'gemini.google.com', 'youtube.com'];
      return blockedDomains.some((domain) => hostname === domain || hostname.endsWith('.' + domain));
    } catch (error) {
      return false;
    }
  };

  const absolutizeUrl = (url: string) => {
    if (!url) return url;
    if (url.startsWith('data:')) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    let base = API_BASE;
    if (base.startsWith('/')) {
      base = window.location.origin + base;
    }
    const backendOrigin = base.replace(/\/api\/?$/, '');
    if (url.startsWith('/')) {
      return `${backendOrigin}${url}`;
    }
    return `${backendOrigin}/${url}`;
  };

  // --- EXPORTACIÓN HTML ---
  const exportPresentation = async () => {
    if (Object.keys(documentState.value).length === 0 && !_RAW_PDF_DOC && docType.value === 'blank')
      return alert('El proyecto está vacío.')

    showToast('Preparando exportación y optimizando recursos...', 'info');

    // 🚀 FORZAMOS GUARDADO: Convierte PDFs gigantes y Base64 en URLs de Vercel/Mongo antes de exportar
    await savePresentation(true);

    const safeJson = (data: any) =>
      JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')

    // 🚀 NUEVO: Helper para convertir URLs de fondos/imágenes a Base64 y hacer el HTML 100% Offline
    const urlToBase64 = async (url: string) => {
      if (!url || url.startsWith('data:')) return url;
      try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error('Fetch fallido');
        const blob = await response.blob();
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.warn('CORS o Red: No se pudo descargar la imagen para incrustar. Dejando URL absoluta:', error);
        return url; // Fallback a la URL si el servidor bloquea la lectura
      }
    };

    // Filtrar elementos fuera del canvas y empaquetar imágenes/audios en Base64
    const filteredDocumentState: Record<number, any[]> = {};
    for (const [page, elements] of Object.entries(documentState.value)) {
      const processedElements = [];
      for (const el of (elements as any[])) {
        const elWidth = typeof el.width === 'number' ? el.width : 150;
        const elHeight = typeof el.height === 'number' ? el.height : 50;
        if (
          el.x < baseWidth.value &&
          el.y < baseHeight.value &&
          el.x + elWidth > 0 &&
          el.y + elHeight > 0
        ) {
          const newEl = { ...el };
          if (newEl.type === 'map') {
            const staticMapUrl = getMapStaticImageUrl(newEl, 2);
            const embeddedMapImage = await urlToBase64(staticMapUrl);
            newEl.type = 'image';
            newEl.fit = newEl.fit || 'cover';
            newEl.src = typeof embeddedMapImage === 'string' && embeddedMapImage.startsWith('data:')
              ? embeddedMapImage
              : getMapFallbackDataUrl(newEl);
            processedElements.push(newEl);
            continue;
          }
          if (newEl.src) {
            const absolute = absolutizeUrl(newEl.src);
            if (['image', 'audio', 'magnifier', '3d'].includes(newEl.type)) {
              newEl.src = await urlToBase64(absolute);
            } else {
              newEl.src = absolute;
            }
          }
          if (newEl.type === '3d' && newEl.envImage) {
            const absEnv = absolutizeUrl(newEl.envImage);
            newEl.envImage = await urlToBase64(absEnv);
          }
          processedElements.push(newEl);
        }
      }
      filteredDocumentState[Number(page)] = processedElements;
    }

    // Asegurar que los fondos se incrusten (Embed) en el archivo HTML para uso local
    const exportConfigs = JSON.parse(JSON.stringify(slideConfigs.value));
    for (const page in exportConfigs) {
      if (exportConfigs[page].bgImage) {
        const absolute = absolutizeUrl(exportConfigs[page].bgImage);
        exportConfigs[page].bgImage = await urlToBase64(absolute);
      }
    }

    const htmlContent = `<!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presentación Pro</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"><\/script>
    <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"><\/script>
    <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web/src/regular/style.css" />
    <style>
      body { margin: 0; background: #000; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; user-select: none; -webkit-user-select: none; --pres-bg: #fff; --pres-text: #1e293b; --pres-accent: #3b82f6; }
      #app { display: flex; justify-content: center; align-items: center; width: 100vw; height: 100vh; position: relative; }
      .canvas-wrapper { position: relative; box-shadow: 0 0 50px rgba(0,0,0,0.8); transform-origin: center center; transition: transform 0.2s; }
.layer-pdf {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
  /* 🚀 Mejora cómo el navegador interpola los píxeles */
  image-rendering: high-quality;
  -webkit-font-smoothing: antialiased;
}      .interactive-element { position: absolute; box-sizing: border-box; display: flex; }
      .el-text { width: 100%; height: 100%; white-space: pre-wrap; word-break: break-word; user-select: text; -webkit-user-select: text; }
      .el-shape { width: 100%; height: 100%; }
      .el-icon { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
      .el-content-fitted { width: 100%; height: 100%; display: block; border: none; }
      .el-link { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.1s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; padding: 0 10px; box-sizing: border-box; }
      .el-link:active { transform: scale(0.95); }
      .el-interactive { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
      .hotspot-pulse { width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; animation: pulse 2s infinite; }
      @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.8; } 70% { transform: scale(1.1); opacity: 0; } 100% { transform: scale(0.95); opacity: 0; } }
      .interactive-modal { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 15px; background: white; color: #333; padding: 20px; border-radius: 8px; width: 320px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); z-index: 9999; cursor: default; user-select: text; }
      .modal-title { margin: 0 0 10px 0; font-size: 1.1rem; border-bottom: 1px solid #eee; padding-bottom: 5px; }
      .el-accordion { width: 100%; height: 100%; overflow-y: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
      .accordion-item { border-bottom: 1px solid rgba(0,0,0,0.05); }
      .accordion-header { padding: 12px 16px; font-weight: bold; display: flex; justify-content: space-between; cursor: pointer; background: rgba(0,0,0,0.05); transition: 0.2s; }
      .accordion-content { padding: 16px; font-size: 0.9rem; line-height: 1.5; background: rgba(0,0,0,0.02); user-select: text; }

      .el-audio-wrapper { cursor: pointer; display: flex; align-items: center; justify-content: center; }
      .audio-pill { display: flex; align-items: center; gap: 10px; width: 100%; height: 100%; padding: 0 20px; box-sizing: border-box; font-family: sans-serif; font-size: 0.9rem; font-weight: 600; transition: 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .audio-pill i { font-size: 1.5rem; }
      .audio-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .audio-waves { display: flex; gap: 3px; height: 15px; align-items: center; }
      .audio-waves span { width: 3px; background: currentColor; height: 100%; border-radius: 2px; animation: wave 1s infinite ease-in-out; }
      .audio-waves span:nth-child(2) { animation-delay: 0.2s; }
      .audio-waves span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes wave { 0%, 100% { height: 20%; } 50% { height: 100%; } }
      .audio-minimal { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: 0.2s; }
      .audio-floating { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; transition: transform 0.2s, box-shadow 0.2s; }
      .audio-floating:hover { transform: translateY(-4px); }
      .audio-floating:active { transform: translateY(0); }
      .audio-minimal.is-playing, .audio-floating.is-playing { animation: pulse-audio 1.5s infinite alternate; }

      @keyframes pulse-audio { from { box-shadow: 0 0 0 0px rgba(255, 255, 255, 0.4); } to { box-shadow: 0 0 0 15px rgba(255, 255, 255, 0); } }
      .play-nav-overlay { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(30,30,30,0.8); backdrop-filter: blur(5px); padding: 10px 20px; border-radius: 30px; display: flex; gap: 15px; z-index: 10000; color: white; align-items: center; font-weight: bold; box-shadow: 0 10px 20px rgba(0,0,0,0.5); transition: opacity 0.4s ease, transform 0.4s ease;}
      .play-nav-overlay button { display: flex; justify-content: center; align-items: center; width: 32px; height: 32px; border-radius: 50%; background: #444; color: white; border: none; cursor: pointer; font-weight: bold; transition: 0.2s;}
      .play-nav-overlay button:hover:not(:disabled) { background: #58a6ff; }
      .play-nav-overlay button:disabled { opacity: 0.5; cursor: not-allowed; }
      .play-nav-overlay.is-idle { opacity: 0; pointer-events: none; transform: translate(-50%, 15px); }

      .chart-content { display: flex; width: 100%; height: calc(100% - 30px); }
      .chart-bar-container { display: flex; align-items: flex-end; justify-content: space-around; width: 100%; height: calc(100% - 30px); gap: 8px; }
      .bar-col { display: flex; flex-direction: column; justify-content: flex-end; align-items: center; width: 100%; height: 100%; }
      .bar-fill { width: 100%; border-radius: 4px 4px 0 0; transition: height 0.3s; }
      .chart-hbar-container { display: flex; flex-direction: column; justify-content: space-around; width: 100%; height: calc(100% - 30px); gap: 5px; }
      .hbar-row { display: flex; align-items: center; width: 100%; height: 100%; gap: 10px; }
      .hbar-track { flex: 1; height: 100%; min-height: 10px; background: rgba(0,0,0,0.05); border-radius: 0 4px 4px 0; display: flex; align-items: center;}
      .hbar-fill { height: 100%; border-radius: 0 4px 4px 0; transition: width 0.3s; }
      .chart-pie-container { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: calc(100% - 30px); position: relative; }
      .pie-circle { border-radius: 50%; width: 100%; height: 100%; max-width: 200px; max-height: 200px; display: flex; align-items: center; justify-content: center; }
      .donut-hole { width: 50%; height: 50%; border-radius: 50%; }
      .chart-label { font-size: 10px; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
      .chart-value { font-size: 10px; margin-bottom: 4px; font-weight: bold; }
      .pie-legend { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 10px; }
      .pie-legend-item { display: flex; align-items: center; gap: 5px; font-size: 10px; }
      .legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }

      .mm-wrapper { display: flex; align-items: center; justify-content: flex-start; width: 100%; height: 100%; padding: 20px; box-sizing: border-box; }
      .mm-level-0 { display: flex; align-items: center; }
      .mm-node-block { display: flex; flex-direction: column; align-items: center; padding: 10px 16px; border: 2px solid transparent; cursor: pointer; transition: 0.2s; position: relative; z-index: 2; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .mm-node-block:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.2); }
      .mm-node-img { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-bottom: 5px; }
      .mm-node-text { font-weight: bold; font-size: 1rem; text-align: center; }
      .mm-node-note { font-size: 0.7rem; opacity: 0.8; margin-top: 4px; text-align: center; max-width: 150px; line-height: 1.2; }
      .mm-children { display: flex; flex-direction: column; justify-content: center; position: relative; padding-left: 40px; gap: 15px; }
      .mm-child-wrapper { display: flex; align-items: center; position: relative; }
      .mm-child-wrapper::before { content: ''; position: absolute; left: -20px; top: 50%; width: 20px; height: 1px; border-top: var(--mm-line-width) solid var(--mm-line-color); }
      .mm-child-wrapper::after { content: ''; position: absolute; left: -20px; border-left: var(--mm-line-width) solid var(--mm-line-color); }
      .mm-child-wrapper:first-child::after { top: 50%; bottom: 0; }
      .mm-child-wrapper:last-child::after { top: 0; bottom: 50%; }
      .mm-child-wrapper:not(:first-child):not(:last-child)::after { top: 0; bottom: 0; }
      .mm-child-wrapper:first-child:last-child::after { display: none; }
      .mm-connector-right { position: absolute; right: -20px; top: 50%; width: 20px; border-top: var(--mm-line-width) solid var(--mm-line-color); }

      .slide-trans-dissolve-enter-active, .slide-trans-dissolve-leave-active { transition: opacity 0.6s ease; }
      .slide-trans-dissolve-enter-from, .slide-trans-dissolve-leave-to { opacity: 0; }

      .slide-trans-slide-up-enter-active, .slide-trans-slide-up-leave-active { transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1); }
      .slide-trans-slide-up-enter-from { opacity: 0; transform: translateY(50px); }
      .slide-trans-slide-up-leave-to { opacity: 0; transform: translateY(-50px); }

      .slide-trans-zoom-enter-active, .slide-trans-zoom-leave-active { transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1); }
      .slide-trans-zoom-enter-from { opacity: 0; transform: scale(0.95); }
      .slide-trans-zoom-leave-to { opacity: 0; transform: scale(1.05); }

      .slide-trans-push-left-enter-active, .slide-trans-push-left-leave-active { transition: transform 0.5s ease; }
      .slide-trans-push-left-enter-from { transform: translateX(100%); }
      .slide-trans-push-left-leave-to { transform: translateX(-100%); }

      .slide-trans-push-right-enter-active, .slide-trans-push-right-leave-active { transition: transform 0.5s ease; }
      .slide-trans-push-right-enter-from { transform: translateX(-100%); }
      .slide-trans-push-right-leave-to { transform: translateX(100%); }

      .slide-trans-wipe-enter-active, .slide-trans-wipe-leave-active { transition: clip-path 0.5s ease; }
      .slide-trans-wipe-enter-from { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); }
      .slide-trans-wipe-leave-to { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); }

      .anim-fade-in { animation: animFadeIn 0.8s ease-out both; }
      .anim-slide-up { animation: animSlideUp 0.8s cubic-bezier(0.25, 1, 0.5, 1) both; }
      .anim-zoom-in { animation: animZoomIn 0.8s cubic-bezier(0.25, 1, 0.5, 1) both; }
      .anim-bounce { animation: animBounce 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
      @keyframes animFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes animSlideUp { from { translate: 0 50px; opacity: 0; } to { translate: 0 0; opacity: 1; } }
      @keyframes animZoomIn { from { scale: 0.95; opacity: 0; } to { scale: 1; opacity: 1; } }
      @keyframes animBounce { 0% { scale: 0.5; opacity: 0; } 50% { scale: 1.05; opacity: 1; } 100% { scale: 1; opacity: 1; } }
      .marquee-track { display: flex; white-space: nowrap; position: absolute; animation-name: scroll-marquee; animation-timing-function: linear; animation-iteration-count: infinite; }
      .marquee-content { padding: 0 50px; display: inline-block; }
      @keyframes scroll-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

      .is-waiting-animation { opacity: 0 !important; visibility: hidden; pointer-events: none; }

/* PLANTILLAS FLOTANTES */
.templates-floating-menu {
  position: absolute;
  top: 110%;
  left: 0;
  width: 240px;
  background: #111113;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.6);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.tmpl-menu-header {
  padding: 12px 14px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-strong);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.03);
}
.tmpl-menu-body {
  padding: 16px;
}
</style>
  </head>
  <body>
    <script type="application/json" id="app-meta-data">{"baseWidth": ${baseWidth.value}, "baseHeight": ${baseHeight.value}, "docType": "${docType.value}"}<\/script>
    <script type="application/json" id="app-state-data">${safeJson(filteredDocumentState)}<\/script>
    <script type="application/json" id="app-configs-data">${safeJson(exportConfigs)}<\/script>

    <div id="app"></div>

    <script type="text/x-template" id="app-template">
      <div class="canvas-wrapper play-mode-active" :style="{ transform: 'scale(' + zoom + ')' }">
        <Transition :name="activeTransition !== 'none' ? 'slide-trans-' + activeTransition : ''" mode="out-in">
        <div class="canvas-shadow-box layer-engine" :key="pageNum" :style="{ width: baseWidth + 'px', height: baseHeight + 'px', backgroundColor: currentBgColor, backgroundImage: currentBgImage, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }">

            <div v-for="(el, index) in currentPageElements" :key="el.id + renderTrigger" class="interactive-element is-clickable"
                v-show="!el.isHidden"
                @click.stop="executeEvents(el, 'click')"
                @mouseenter="executeEvents(el, 'hover')"
                :class="[ (el.animationType || el.animation) && (el.animationType || el.animation) !== 'none' && (el.animationOrder || 0) <= currentAnimationStep ? 'anim-' + (el.animationType || el.animation) : '', (el.animationType || el.animation) && (el.animationType || el.animation) !== 'none' && (el.animationOrder || 0) > currentAnimationStep ? 'is-waiting-animation' : '' ]"
                :style="{ left: el.x + 'px', top: el.y + 'px', width: el.width + 'px', height: (el.height === 'auto' ? 'auto' : el.height + 'px'), zIndex: index + 10, opacity: el.opacity ?? 1, transform: 'rotate(' + (el.rotation || 0) + 'deg)', animationDelay: (el.animationTrigger === 'withPrevious' || el.animationTrigger === 'afterPrevious') ? (index * 0.05) + 's' : '0s', mixBlendMode: el.mixBlendMode || 'normal' }">              <div v-if="el.type === 'text' || el.type === 'sticky'" class="el-text" :style="{ color: el.color, fontSize: el.fontSize + 'px', fontWeight: el.fontWeight, fontFamily: el.fontFamily, fontStyle: el.fontStyle, textAlign: el.textAlign, textTransform: el.textTransform || 'none', textDecoration: el.textDecoration || 'none', lineHeight: el.lineHeight || 1.2, letterSpacing: (el.letterSpacing || 0) + 'px', textShadow: el.textShadow || 'none', backgroundColor: el.textBgColor || 'transparent', padding: el.textBgColor !== 'transparent' ? '15px' : '0', borderRadius: el.type === 'sticky' ? '0 0 16px 4px' : '4px', boxShadow: el.boxShadow || 'none' }">{{ el.content }}</div>

              <div v-else-if="el.type === 'mindmap'" class="el-mindmap-container" :style="{ fontFamily: el.fontFamily, '--mm-line-color': el.lineColor, '--mm-line-width': el.lineWidth + 'px' }">
                <div class="mm-wrapper">
                  <div class="mm-level-0" v-for="n0 in getNodesByParent(el.nodes, null)" :key="n0.id">
                    <div class="mm-node-block" :style="getNodeStyle(n0, false)">
                      <img v-if="n0.image" :src="n0.image" class="mm-node-img" draggable="false" />
                      <div class="mm-node-text">{{ n0.text }}</div>
                      <div v-if="n0.note" class="mm-node-note">{{ n0.note }}</div>
                      <div v-if="getNodesByParent(el.nodes, n0.id).length > 0" class="mm-connector-right"></div>
                    </div>
                    <div class="mm-children" v-if="getNodesByParent(el.nodes, n0.id).length">
                      <div class="mm-child-wrapper" v-for="n1 in getNodesByParent(el.nodes, n0.id)" :key="n1.id">
                        <div class="mm-node-block" :style="getNodeStyle(n1, false)">
                          <img v-if="n1.image" :src="n1.image" class="mm-node-img" draggable="false" />
                          <div class="mm-node-text">{{ n1.text }}</div>
                          <div v-if="n1.note" class="mm-node-note">{{ n1.note }}</div>
                          <div v-if="getNodesByParent(el.nodes, n1.id).length > 0" class="mm-connector-right"></div>
                        </div>
                        <div class="mm-children" v-if="getNodesByParent(el.nodes, n1.id).length">
                          <div class="mm-child-wrapper" v-for="n2 in getNodesByParent(el.nodes, n1.id)" :key="n2.id">
                            <div class="mm-node-block" :style="getNodeStyle(n2, false)">
                              <img v-if="n2.image" :src="n2.image" class="mm-node-img" draggable="false" />
                              <div class="mm-node-text">{{ n2.text }}</div>
                              <div v-if="n2.note" class="mm-node-note">{{ n2.note }}</div>
                              <div v-if="getNodesByParent(el.nodes, n2.id).length > 0" class="mm-connector-right"></div>
                            </div>
                            <div class="mm-children" v-if="getNodesByParent(el.nodes, n2.id).length">
                              <div class="mm-child-wrapper" v-for="n3 in getNodesByParent(el.nodes, n2.id)" :key="n3.id">
                                <div class="mm-node-block" :style="getNodeStyle(n3, false)">
                                  <img v-if="n3.image" :src="n3.image" class="mm-node-img" draggable="false" />
                                  <div class="mm-node-text">{{ n3.text }}</div>
                                  <div v-if="n3.note" class="mm-node-note">{{ n3.note }}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="el.type === 'list'" class="el-list" :style="{ color: el.color, fontSize: el.fontSize + 'px', fontWeight: el.fontWeight, fontFamily: el.fontFamily, lineHeight: el.lineHeight || 1.4 }">
                <component :is="el.listType" :style="{ listStyleType: el.bulletStyle, margin: 0, paddingLeft: '24px' }">
                  <li v-for="(item, idx) in el.items" :key="idx" :style="{ marginBottom: el.itemSpacing + 'px' }">{{ item }}</li>
                </component>
              </div>

              <div v-else-if="el.type === 'checkbox'" class="el-checkbox-list" :style="{ color: el.color, fontSize: el.fontSize + 'px', fontWeight: el.fontWeight, fontFamily: el.fontFamily, lineHeight: el.lineHeight || 1.4, display: 'flex', flexDirection: 'column', gap: el.itemSpacing + 'px' }">
                <div v-for="(item, idx) in el.items" :key="idx" style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; transition: opacity 0.2s;" :style="{ opacity: item.checked ? 0.6 : 1 }" @click.stop="executeEvents(el, 'click', idx); item.checked = !item.checked">
                  <i class="ph" :class="item.checked ? 'ph-check-square' : 'ph-square'" :style="{ color: item.checked ? el.checkedColor : el.color, fontSize: (el.fontSize * 1.2) + 'px', marginTop: '2px' }"></i>
                  <span :style="{ textDecoration: item.checked && el.strikeThrough ? 'line-through' : 'none' }">{{ item.text }}</span>
                </div>
              </div>

              <div v-else-if="el.type === 'table'" class="el-table-wrapper" :style="{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: el.borderRadius + 'px', backgroundColor: el.rowBgColor1 }">
                <table :style="{ width: '100%', height: '100%', borderCollapse: 'collapse', color: el.color, fontSize: el.fontSize + 'px', fontFamily: el.fontFamily }">
                  <thead>
                    <tr>
                      <th v-for="(col, cIdx) in el.headers" :key="'th'+cIdx" :style="{ border: el.borderWidth + 'px solid ' + el.borderColor, backgroundColor: el.headerBgColor, padding: '10px', textAlign: el.textAlign }">{{ col }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, rIdx) in el.rows" :key="'tr'+rIdx" :style="{ backgroundColor: rIdx % 2 === 0 ? el.rowBgColor1 : el.rowBgColor2 }">
                      <td v-for="(cell, cIdx) in row" :key="'td'+cIdx" :style="{ border: el.borderWidth + 'px solid ' + el.borderColor, padding: '10px', textAlign: el.textAlign }">{{ cell }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-else-if="el.type === 'shape'" class="el-shape" :style="{ background: el.isGlass ? 'rgba(255,255,255,0.1)' : (el.gradientType && el.gradientType !== 'none' ? (el.gradientType === 'linear' ? 'linear-gradient(135deg, ' + el.bgColor + ', ' + el.gradientColor + ')' : 'radial-gradient(circle, ' + el.bgColor + ', ' + el.gradientColor + ')') : el.bgColor), borderRadius: el.borderRadius + 'px', border: el.borderWidth + 'px ' + (el.borderStyle || 'solid') + ' ' + el.borderColor, boxShadow: el.boxShadow || 'none', backdropFilter: el.isGlass ? 'blur(10px)' : 'none', WebkitBackdropFilter: el.isGlass ? 'blur(10px)' : 'none' }"></div>

              <div v-else-if="el.type === 'arrow'" style="width: 100%; height: 100%; display: flex; align-items: center; position: relative;">
                <div v-if="['start', 'both'].includes(el.arrowHead)" :style="{ width: 0, height: 0, borderTop: (el.strokeWidth * 1.5) + 'px solid transparent', borderBottom: (el.strokeWidth * 1.5) + 'px solid transparent', borderRight: (el.strokeWidth * 2) + 'px solid ' + el.color }"></div>
                <div :style="{ flex: 1, height: el.strokeWidth + 'px', backgroundColor: el.color }"></div>
                <div v-if="['end', 'both'].includes(el.arrowHead)" :style="{ width: 0, height: 0, borderTop: (el.strokeWidth * 1.5) + 'px solid transparent', borderBottom: (el.strokeWidth * 1.5) + 'px solid transparent', borderLeft: (el.strokeWidth * 2) + 'px solid ' + el.color }"></div>
              </div>

              <div v-else-if="el.type === 'icon'" class="el-icon" :style="{ color: el.color, fontSize: el.fontSize + 'px', backgroundColor: el.bgColor || 'transparent', borderRadius: (el.borderRadius || 0) + 'px' }"><i :class="'ph ph-' + el.iconName" :style="{ filter: el.textShadow ? 'drop-shadow(' + el.textShadow + ')' : 'none' }"></i></div>

              <div v-else-if="el.type === 'draw'" class="el-draw-board" style="width: 100%; height: 100%;">
                <svg style="width: 100%; height: 100%; display: block; overflow: visible;">
                    <polyline v-for="(line, idx) in el.lines" :key="idx" :points="line.points.map(p => p.x+','+p.y).join(' ')" :stroke="line.color" :stroke-width="line.size" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>

              <div v-else-if="el.type === 'codeblock'" class="el-codeblock" :style="{ backgroundColor: el.theme === 'dark' ? '#1e293b' : '#f8fafc', color: el.theme === 'dark' ? '#e2e8f0' : '#334155', borderRadius: el.borderRadius + 'px', padding: '15px', width: '100%', height: '100%', overflow: 'auto', border: '1px solid ' + (el.theme === 'dark' ? '#334155' : '#e2e8f0'), boxSizing: 'border-box', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }">
                <div style="position: absolute; top: 0; right: 0; padding: 4px 10px; font-size: 0.7rem; font-weight: bold; font-family: sans-serif; background-color: el.theme === 'dark' ? '#334155' : '#e2e8f0'; color: el.theme === 'dark' ? '#94a3b8' : '#64748b'; border-bottom-left-radius: 8px;">{{ el.language }}</div>
                <pre style="margin: 0; white-space: pre-wrap; font-family: monospace;" :style="{ fontSize: el.fontSize + 'px' }">{{ el.content }}</pre>
              </div>

              <div v-else-if="el.type === 'chart'" class="el-chart" :style="{ backgroundColor: el.bgColor, borderRadius: (el.borderRadius || 8) + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), padding: '15px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }">
                <div style="text-align: center; font-weight: bold; margin-bottom: 10px;" :style="{ color: el.color }">{{ el.chartTitle }}</div>
                <div v-if="el.chartType === 'bar'" class="chart-bar-container">
                  <div v-for="(item, i) in el.chartData" :key="i" class="bar-col">
                    <span v-if="el.showValues" class="chart-value" :style="{ color: el.color }">{{ item.value }}</span>
                    <div class="bar-fill" :style="{ height: Math.min(100, (item.value / getChartMax(el.chartData)) * 100) + '%', backgroundColor: item.color }" :title="item.value"></div>
                    <span v-if="el.showLegend" class="chart-label" :style="{ color: el.color }">{{ item.label }}</span>
                  </div>
                </div>
                <div v-if="el.chartType === 'hbar'" class="chart-hbar-container">
                  <div v-for="(item, i) in el.chartData" :key="'h'+i" class="hbar-row">
                    <span v-if="el.showLegend" class="chart-label hbar-lbl" :style="{ color: el.color }">{{ item.label }}</span>
                    <div class="hbar-track"><div class="hbar-fill" :style="{ width: Math.min(100, (item.value / getChartMax(el.chartData)) * 100) + '%', backgroundColor: item.color }"></div></div>
                    <span v-if="el.showValues" class="chart-value hbar-val" :style="{ color: el.color }">{{ item.value }}</span>
                  </div>
                </div>
                <div v-if="el.chartType === 'pie' || el.chartType === 'donut'" class="chart-pie-container">
                  <div class="pie-circle" :style="{ width: Math.min(el.width, el.height)*0.5 + 'px', height: Math.min(el.width, el.height)*0.5 + 'px', background: getPieGradient(el.chartData) }">
                    <div v-if="el.chartType === 'donut'" class="donut-hole" :style="{ backgroundColor: el.bgColor }"></div>
                  </div>
                  <div v-if="el.showLegend" class="pie-legend">
                    <div v-for="(item, i) in el.chartData" :key="'l'+i" class="pie-legend-item">
                      <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
                      <span :style="{ color: el.color }">{{ item.label }} <span v-if="el.showValues">({{ item.value }})</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="el.type === 'poll'" class="el-poll-wrapper" :style="{ backgroundColor: el.bgColor, color: el.color, borderRadius: el.borderRadius + 'px', padding: '15px', width: '100%', height: '100%', boxSizing: 'border-box', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }">
                <h4 style="margin: 0 0 15px 0; text-align: center;">{{ el.chartTitle }}</h4>
                <div v-for="(item, i) in el.chartData" :key="i" style="margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 6px;">
                    <span>{{ item.label }}</span>
                    <span>{{ Math.round((item.value / getChartMax(el.chartData)) * 100) }}%</span>
                  </div>
                  <div style="width: 100%; height: 10px; background: rgba(0,0,0,0.08); border-radius: 5px; overflow: hidden;">
                    <div :style="{ width: Math.min(100, (item.value / getChartMax(el.chartData)) * 100) + '%', backgroundColor: item.color, height: '100%', transition: 'width 1.5s cubic-bezier(0.25, 1, 0.5, 1)' }"></div>
                  </div>
                </div>
              </div>

              <div v-else-if="el.type === 'image'" class="el-image-container" :style="{ borderRadius: (el.borderRadius || 0) + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), filter: 'grayscale('+(el.grayscale||0)+'%) blur('+(el.blur||0)+'px) sepia('+(el.sepia||0)+'%)', overflow: 'hidden', width: '100%', height: '100%' }">
                <img v-if="el.src && el.src.trim() !== ''" :src="el.src" class="el-content-fitted" :style="{ objectFit: el.fit }" />
              </div>

              <div v-else-if="el.type === 'qrcode'" style="width: 100%; height: 100%; padding: 10px; box-sizing: border-box; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" :style="{ backgroundColor: el.bgColor, borderRadius: (el.borderRadius || 0) + 'px' }">
                <img :src="'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=' + encodeURIComponent(el.qrUrl || 'https://google.com') + '&color=' + el.color.replace('#','') + '&bgcolor=' + el.bgColor.replace('#','')" style="width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply;" draggable="false" />
              </div>

              <div v-else-if="el.type === 'progress'" style="width: 100%; height: 100%; overflow: hidden;" :style="{ backgroundColor: el.bgColor, borderRadius: (el.borderRadius || 0) + 'px' }">
                <div :style="{ width: (el.progress || 0) + '%', backgroundColor: el.color, height: '100%', transition: 'width 0.5s ease' }"></div>
              </div>

              <div v-else-if="el.type === 'rating'" class="el-rating" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;" :style="{ color: el.color, fontSize: el.fontSize + 'px' }">
                <span v-for="s in el.maxStars" :key="s" @click.stop="el.isInteractive ? (executeEvents(el, 'click'), el.rating = s) : null" :style="{ cursor: el.isInteractive ? 'pointer' : 'default', opacity: s <= el.rating ? 1 : 0.25, transition: '0.2s' }">★</span>
              </div>

              <div v-else-if="el.type === 'timer'" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-variant-numeric: tabular-nums;"
                  :style="{ backgroundColor: el.bgColor, color: el.color, borderRadius: (el.borderRadius || 0) + 'px', fontSize: (el.fontSize || 48) + 'px' }">
                {{ formatTime(el.timeLeft !== undefined ? el.timeLeft : el.duration * 60) }}
              </div>

              <div v-else-if="el.type === 'magnifier'" class="el-magnifier" :style="{ borderRadius: '50%', border: (el.borderWidth || 4) + 'px solid ' + (el.borderColor || '#fff'), overflow: 'hidden', width: '100%', height: '100%', boxShadow: el.boxShadow || '0 10px 25px rgba(0,0,0,0.5)' }">
                <div v-if="el.src && el.src.trim() !== ''" :style="{ width: '100%', height: '100%', backgroundImage: 'url(' + el.src + ')', backgroundSize: (el.zoomLevel * 100) + '%', backgroundPosition: el.focusX + '% ' + el.focusY + '%', backgroundRepeat: 'no-repeat' }"></div>
                <div v-else class="placeholder-box" style="border-radius: 50%"><i class="ph ph-magnifying-glass"></i></div>
              </div>

              <div v-else-if="el.type === 'video'" class="el-video-container" :style="{ width: '100%', height: '100%', borderRadius: (el.borderRadius || 0) + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), overflow: 'hidden' }">
                <template v-if="el.src && el.src.trim() !== ''">
                  <iframe v-if="isYouTube(el.src)" src="about:blank" :src="getYouTubeEmbedUrl(el.src)" class="el-content-fitted" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                  <video v-else :src="el.src" :controls="true" :autoplay="el.autoplay" :loop="el.loop" :muted="el.muted" class="el-content-fitted" :style="{ objectFit: el.fit }"></video>
                </template>
              </div>

              <div v-else-if="el.type === 'iframe'" class="el-iframe-container" :style="{ width: '100%', height: '100%', borderRadius: (el.borderRadius || 0) + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), overflow: 'hidden' }">
                <template v-if="el.src && el.src.trim() !== ''">
                  <div v-if="isIframeBlocked(el.src)" class="placeholder-box" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; text-align:center; padding:16px;">
                    <i class="ph ph-shield-warning" style="font-size: 2rem"></i>
                    <div>Esta web no permite ser incrustada por seguridad</div>
                    <button type="button" class="btn-primary" @click.stop="window.open(formatIframeUrl(el.src), '_blank')">
                      Abrir enlace original
                    </button>
                  </div>
                  <iframe
                    v-else
                    :src="formatIframeUrl(el.src)"
                    width="100%"
                    height="100%"
                    frameborder="0"
                    allowfullscreen
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  ></iframe>
                </template>
              </div>

              <div v-else-if="el.type === 'map'" class="el-iframe-container" :style="{ width: '100%', height: '100%', borderRadius: (el.borderRadius || 0) + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), overflow: 'hidden' }">
                <template v-if="el.src && el.src.trim() !== ''">
                  <img :src="el.src" class="el-content-fitted" :style="{ objectFit: el.fit || 'cover' }" draggable="false" />
                </template>
                <div v-else class="placeholder-box">
                  <i class="ph ph-map-trifold" style="font-size: 2rem"></i>
                </div>
              </div>

              <div v-else-if="el.type === 'finance'" class="el-iframe-container" :style="{ width: '100%', height: '100%', borderRadius: (el.borderRadius || 0) + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), overflow: 'hidden', boxShadow: el.boxShadow || 'none' }">
                <iframe
                  :src="'https://s.tradingview.com/widgetembed/?symbol=' + encodeURIComponent(el.symbol) + '&interval=D&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=' + el.theme + '&style=' + el.chartType + '&timezone=Etc%2FUTC&withdateranges=1&showpopupbutton=0'"
                  width="100%"
                  height="100%"
                  frameborder="0"
                  allowfullscreen
                  :style="{ pointerEvents: playMode ? 'auto' : 'none' }"
                ></iframe>
                <div class="drag-protector"></div>
              </div>

              <div v-else-if="el.type === 'calendar'" :style="{ width: '100%', height: el.height === 'auto' ? 'auto' : '100%', backgroundColor: el.bgColor, color: el.color, fontFamily: el.fontFamily, borderRadius: (el.borderRadius || 0) + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), boxShadow: el.boxShadow || 'none', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }">
                <div :style="{ backgroundColor: el.accentColor, color: '#ffffff', padding: '14px 16px', textAlign: 'center', fontWeight: '700' }">Mes: {{ el.month }} / Año: {{ el.year }}</div>
                <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '0.9rem', padding: '12px', gap: '4px' }">
                  <div v-for="day in ['L', 'M', 'X', 'J', 'V', 'S', 'D']" :key="day" :style="{ fontWeight: '700' }">{{ day }}</div>
                </div>
                <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', padding: '12px', alignContent: 'start', flex: '1 1 auto' }">
                  <div
                    v-for="(d, index) in getCalendarDays(el.month, el.year)"
                    :key="'cal-' + index + '-' + (d.day || 0)"
                    @click="!d.empty && getDayEvents(el, d.day).length ? (el.activeAgendaDay = d.day) : null"
                    :style="{ aspectRatio: '1 / 1', minHeight: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: d.empty ? 'center' : 'space-between', borderRadius: '8px', padding: d.empty ? '0' : '6px 4px', backgroundColor: d.empty ? 'transparent' : 'rgba(255,255,255,0.08)', cursor: !d.empty && getDayEvents(el, d.day).length ? 'pointer' : 'default' }"
                  >
                    <template v-if="!d.empty">
                      <span>{{ d.day }}</span>
                      <div :style="{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center', minHeight: '8px' }">
                        <span
                          v-for="(ev, evIndex) in getDayEvents(el, d.day)"
                          :key="ev.id || evIndex"
                          :style="{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ev.color || '#3b82f6' }"
                        ></span>
                      </div>
                    </template>
                  </div>
                </div>

                <div
                  v-if="el.activeAgendaDay"
                  :style="{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px', boxSizing: 'border-box', zIndex: 2 }"
                >
                  <div :style="{ width: '100%', height: '100%', maxHeight: '100%', backgroundColor: '#ffffff', borderRadius: '10px', color: '#1e293b', display: 'flex', flexDirection: 'column', overflow: 'hidden' }">
                    <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: el.accentColor, color: '#ffffff', fontWeight: '700' }">
                      <span>Agenda del día {{ el.activeAgendaDay }}</span>
                      <button type="button" @click.stop="el.activeAgendaDay = null" :style="{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '1rem' }">
                        <i class="ph ph-x"></i>
                      </button>
                    </div>
                    <div :style="{ flex: '1 1 auto', overflowY: 'auto', padding: '12px' }">
                      <div
                        v-for="(ev, evIndex) in getDayEvents(el, el.activeAgendaDay)"
                        :key="ev.id || evIndex"
                        :style="{ borderLeft: '4px solid ' + (ev.color || '#3b82f6'), backgroundColor: '#f8fafc', borderRadius: '6px', padding: '10px', marginBottom: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }"
                      >
                        {{ ev.content || 'Sin detalle' }}
                      </div>
                      <div v-if="getDayEvents(el, el.activeAgendaDay).length === 0" :style="{ color: '#64748b', fontStyle: 'italic' }">
                        No hay notas para este día.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="el.type === '3d'" class="el-3d" style="width: 100%; height: 100%;">
                <model-viewer v-if="el.src && el.src.trim() !== ''" :src="el.src" :auto-rotate="el.autoRotate" :camera-controls="el.cameraControls" :environment-image="el.envImage" style="width: 100%; height: 100%;"></model-viewer>
              </div>

              <div v-else-if="el.type === 'interactive'" class="el-interactive" @click.stop="executeEvents(el, 'click'); triggerInteraction(el)">
                <div class="hotspot-pulse" :style="{ backgroundColor: el.color, boxShadow: '0 0 15px ' + el.color }"></div>
                <div v-if="el.isOpen" class="interactive-modal" :style="{ backgroundColor: el.modalBgColor || '#ffffff', color: el.modalTextColor || '#333333' }" @click.stop>
                  <h4 class="modal-title" :style="{ borderBottomColor: el.modalTextColor || '#333333' }">{{ el.modalTitle }}</h4>
                  <p v-html="el.contentHtml"></p>
                </div>
              </div>

              <div v-else-if="el.type === 'audio'" class="el-audio-wrapper" @click.stop="executeEvents(el, 'click'); playAudio(el)" :style="{ width: '100%', height: '100%' }">
                <div v-if="el.variant === 'pill'" class="audio-pill" :style="{ backgroundColor: el.bgColor, color: el.color, borderRadius: el.borderRadius + 'px' }">
                  <i class="ph" :class="el.isPlaying ? 'ph-pause-circle' : 'ph-play-circle'"></i>
                  <span class="audio-label">{{ el.isPlaying ? 'Reproduciendo...' : 'Audio' }}</span>
                  <div class="audio-waves" v-if="el.isPlaying"><span></span><span></span><span></span></div>
                </div>
                <div v-else-if="el.variant === 'minimal'" class="audio-minimal" :class="{ 'is-playing': el.isPlaying }" :style="{ backgroundColor: el.bgColor, color: el.color, borderRadius: el.borderRadius + 'px' }">
                  <i class="ph" :class="el.isPlaying ? 'ph-pause' : 'ph-speaker-high'"></i>
                </div>
                <div v-else-if="el.variant === 'floating'" class="audio-floating" :class="{ 'is-playing': el.isPlaying }" :style="{ backgroundColor: el.bgColor, color: el.color, borderRadius: '50%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }">
                  <i class="ph" :class="el.isPlaying ? 'ph-stop' : 'ph-play'"></i>
                </div>
                <audio v-if="el.src && el.src.trim() !== ''" :ref="'audio_'+el.id" :src="el.src" :loop="el.loop" :autoplay="el.autoplay"></audio>
              </div>

              <div v-else-if="el.type === 'link'" class="el-link"
                  :style="{ backgroundColor: el.bgColor, color: el.color, borderRadius: el.borderRadius + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), fontSize: (el.fontSize || 16) + 'px', fontWeight: el.fontWeight || 'bold', fontFamily: el.fontFamily || 'Arial', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }"
                  @click.stop="executeEvents(el, 'click'); changePageTo(el.targetPage)">
                {{ el.text }}
              </div>

              <div v-else-if="el.type === 'accordion'" class="el-accordion" :style="{ backgroundColor: el.bgColor, color: el.color, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }">
                <div v-for="(item, idx) in el.items" :key="idx" class="accordion-item" :style="{ borderBottomColor: el.color }">
                  <div class="accordion-header" @click.stop="executeEvents(el, 'click', idx); item.isOpen = !item.isOpen">
                    <span>{{ item.title }}</span>
                    <i class="ph" :class="item.isOpen ? 'ph-caret-up' : 'ph-caret-down'"></i>
                  </div>
                  <div v-show="item.isOpen" class="accordion-content">
                    {{ item.content }}
                  </div>
                </div>
              </div>

              <div v-else-if="el.type === 'imagecomparator'" style="width: 100%; height: 100%; position: relative; overflow: hidden;" :style="{ borderRadius: (el.borderRadius || 0) + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), boxShadow: el.boxShadow || 'none' }">
                <img v-if="el.imageAfter && el.imageAfter.trim() !== ''" :src="el.imageAfter" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                <div v-else style="width: 100%; height: 100%; background: rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: #999;"><i class="ph ph-image" style="font-size: 2rem;"></i></div>
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden;">
                  <img v-if="el.imageBefore && el.imageBefore.trim() !== ''" :src="el.imageBefore" style="width: 100%; height: 100%; object-fit: cover; display: block;" :style="{ clipPath: 'inset(0 ' + (100 - (el.sliderPosition ?? 50)) + '% 0 0)' }" />
                </div>
                <input type="range" min="0" max="100" :value="el.sliderPosition" @input="el.sliderPosition = $event.target.value" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100%; height: 100%; cursor: ew-resize; opacity: 0; z-index: 10;" />
              </div>

              <div v-else-if="el.type === 'marquee'" style="width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; position: relative;" :style="{ backgroundColor: el.bgColor, borderRadius: (el.borderRadius || 0) + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), boxShadow: el.boxShadow || 'none' }">
                <div
                  class="marquee-track"
                  :style="{ color: el.color, fontSize: el.fontSize + 'px', fontWeight: el.fontWeight, fontFamily: el.fontFamily, animationDuration: (Math.max(5, 30 - (el.speed / 3))) + 's' }"
                >
                  <span class="marquee-content">{{ el.content }}</span>
                  <span class="marquee-content">{{ el.content }}</span>
                  <span class="marquee-content">{{ el.content }}</span>
                  <span class="marquee-content">{{ el.content }}</span>
                </div>
              </div>

              <div v-else-if="el.type === 'typewriter'" style="width: 100%; height: 100%; display: flex; align-items: center; padding: 0 10px; box-sizing: border-box;" :style="{ backgroundColor: el.bgColor, color: el.color, fontSize: el.fontSize + 'px', fontWeight: el.fontWeight, fontFamily: el.fontFamily, borderRadius: (el.borderRadius || 0) + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), boxShadow: el.boxShadow || 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }">
                {{ el.displayedText }}
              </div>
            </div>
        </div>
        </Transition>
      </div>

      <div class="play-nav-overlay" :class="{ 'is-idle': !showPlayNav }" @mouseenter="wakeUpPlayNav">
        <button @click="changePageTo(pageNum - 1)" :disabled="pageNum <= 1"><i class="ph ph-caret-left"></i></button>
        <span>{{ pageNum }} / {{ numPages }}</span>
        <button @click="advancePresentation"><i class="ph ph-caret-right"></i></button>
        <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.2); margin: 0 5px;"></div>
        <button @click="toggleFullscreen" title="Pantalla Completa">
          <i class="ph" :class="isFullscreen ? 'ph-corners-in' : 'ph-corners-out'"></i>
        </button>
      </div>
    <\/script>

    <script>
      const { createApp, ref, computed, onMounted, nextTick } = Vue;

      createApp({
        template: '#app-template',
        setup() {
          const documentState = ref(JSON.parse(document.getElementById('app-state-data').textContent));
          const slideConfigs = ref(JSON.parse(document.getElementById('app-configs-data').textContent));

          const metaData = JSON.parse(document.getElementById('app-meta-data').textContent);
          const baseWidth = ref(metaData.baseWidth);
          const baseHeight = ref(metaData.baseHeight);
          const docType = ref(metaData.docType);

          const pageNum = ref(1);
          const numPages = ref(Math.max(...Object.keys(documentState.value).map(Number), 1));
          const zoom = ref(1.0);
          const renderTrigger = ref(0);
          const activeTransition = ref('none');
          const isFullscreen = ref(false);
          const currentAnimationStep = ref(0);

          const maxAnimationStep = computed(() => {
            if (!currentPageElements.value) return 0;
            return Math.max(0, ...currentPageElements.value.map(el => el.animationOrder || 0));
          });
          const advancePresentation = () => {
            if (currentAnimationStep.value < maxAnimationStep.value) { currentAnimationStep.value++; }
            else if (pageNum.value < numPages.value) { changePageTo(pageNum.value + 1); }
          };

          const showPlayNav = ref(true);
          let playNavTimeout = null;
          const wakeUpPlayNav = () => {
            showPlayNav.value = true;
            if (playNavTimeout) clearTimeout(playNavTimeout);
            playNavTimeout = setTimeout(() => { showPlayNav.value = false; }, 2000);
          };

          const currentPageElements = computed(() => documentState.value[pageNum.value] || []);
          const currentBgColor = computed(() => slideConfigs.value[pageNum.value]?.bgColor || '#ffffff');
          const currentBgImage = computed(() => {
            const bg = slideConfigs.value[pageNum.value]?.bgImage;
            if (!bg || bg.trim() === '' || bg === 'none') return 'none';
            return 'url("' + bg + '")';
          });

          const isYouTube = (url) => url && url.match(/(?:youtu\\.be\\/|youtube\\.com\\/(?:embed\\/|v\\/|watch\\?v=|watch\\?.+&v=))([\\w-]{11})/);
          const getYouTubeEmbedUrl = (url) => {
            const match = url.match(/(?:youtu\\.be\\/|youtube\\.com\\/(?:embed\\/|v\\/|watch\\?v=|watch\\?.+&v=))([\\w-]{11})/);
            return match && match[1] ? 'https://www.youtube-nocookie.com/embed/' + match[1] + '?rel=0&origin=https://google.com' : '';
          };

          const formatIframeUrl = (url) => {
            if (!url) return url;
            const trimmed = url.trim();
            if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
            if (trimmed.startsWith('//')) return 'https:' + trimmed;
            return 'https://' + trimmed;
          };

          const isIframeBlocked = (url) => {
            if (!url) return false;
            try {
              const hostname = new URL(formatIframeUrl(url)).hostname.replace(/^www\./, '').toLowerCase();
              const blockedDomains = ['google.com', 'github.com', 'twitter.com', 'facebook.com', 'linkedin.com', 'gemini.google.com', 'youtube.com'];
              return blockedDomains.some((domain) => hostname === domain || hostname.endsWith('.' + domain));
            } catch (error) {
              return false;
            }
          };

          const formatTime = (seconds) => {
            const m = Math.floor(seconds / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            return m + ':' + s;
          };

          const getCalendarDays = (month, year) => {
            const safeMonth = Math.min(12, Math.max(1, Number(month) || 1));
            const safeYear = Math.max(1, Number(year) || new Date().getFullYear());
            const firstWeekday = (new Date(safeYear, safeMonth - 1, 1).getDay() + 6) % 7;
            const daysInMonth = new Date(safeYear, safeMonth, 0).getDate();
            const days = [];

            for (let i = 0; i < firstWeekday; i++) {
              days.push({ day: null, empty: true });
            }
            for (let d = 1; d <= daysInMonth; d++) {
              days.push({ day: d, empty: false });
            }

            return days;
          };

          const getDayEvents = (el, day) => {
            const events = Array.isArray(el?.events) ? el.events : [];
            const dayNum = Number(day);

            return events.filter((ev) => {
              if (!ev || ev.trigger || ev.action) return false;

              const type = ev.type || 'single';
              const startDay = Number(ev.startDay);
              const endDay = Number(ev.endDay);

              if (type === 'range') {
                const start = Number.isFinite(startDay) ? startDay : dayNum;
                const end = Number.isFinite(endDay) ? endDay : start;
                return dayNum >= Math.min(start, end) && dayNum <= Math.max(start, end);
              }

              return dayNum === (Number.isFinite(startDay) ? startDay : 1);
            });
          };

          const getChartValues = (data) => { if(!data || !data.length) return [10, 50, 30]; return data.map(d => parseFloat(d.value) || 0); };
          const getChartMax = (data) => Math.max(...getChartValues(data), 1);
          const getPieGradient = (data) => {
            if(!data || !data.length) return 'transparent';
            const total = data.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0) || 1;
            let currentAngle = 0;
            return 'conic-gradient(' + data.map(d => {
              const pct = ((parseFloat(d.value) || 0) / total) * 100;
              const stop = d.color + ' ' + currentAngle + '% ' + (currentAngle + pct) + '%';
              currentAngle += pct; return stop;
            }).join(', ') + ')';
          }

          const getNodesByParent = (nodes, parentId) => { return (nodes || []).filter(n => n.parentId === parentId); }
          const getNodeStyle = (node, isActive) => {
            return { backgroundColor: node.bgColor, color: node.color, borderRadius: node.shape === 'round' ? '20px' : (node.shape === 'circle' ? '50%' : '6px'), border: isActive ? '2px solid #58a6ff' : '2px solid transparent', minWidth: node.shape === 'circle' ? '80px' : 'auto', aspectRatio: node.shape === 'circle' ? '1/1' : 'auto', justifyContent: 'center' };
          }

          const fitToScreen = () => { zoom.value = Math.min(Math.min(window.innerWidth / baseWidth.value, window.innerHeight / baseHeight.value) * 0.95, 1.0); };

          const closeAllInteractives = () => {
            Object.values(documentState.value).forEach(pageItems => {
              pageItems.forEach(el => {
                if(el.type === 'interactive') el.isOpen = false;
                if(el.type === 'accordion') el.items.forEach(item => item.isOpen = false);
                if(el.type === 'audio') { el.isPlaying = false; const a = document.querySelector('audio[src="'+el.src+'"]'); if(a) a.pause(); }
                if(el.type === 'calendar') el.activeAgendaDay = null;
              });
            });
          };

          const changePageTo = async (num) => {
            if (num >= 1 && num <= numPages.value) {
              pageNum.value = num;
              currentAnimationStep.value = 0;
              closeAllInteractives();
              renderTrigger.value++;
              activeTransition.value = 'none';
              await nextTick();
              void document.body.offsetWidth;
              activeTransition.value = slideConfigs.value[num]?.transition || 'none';

              Object.values(documentState.value).forEach(pageItems => {
                pageItems.forEach(el => { if (el.type === 'timer') { el.timeLeft = el.duration * 60; el.isRunning = true; } });
              });

            }
          };

          const executeEvents = (element, triggerType, subIndex = null) => {
            if (!element.events) return;
            element.events.filter(ev => ev.trigger === triggerType && (ev.sourceSubId === undefined || ev.sourceSubId === null || ev.sourceSubId === subIndex)).forEach(ev => {
              if (ev.action === 'goToPage') {
                changePageTo(Number(ev.targetId));
                return;
              }
              const targetElement = currentPageElements.value.find(el => el.id === ev.targetId);
              if (targetElement) {
                if (ev.action === 'show') {
                  targetElement.isHidden = false;
                } else if (ev.action === 'hide') {
                  targetElement.isHidden = true;
                } else if (ev.action === 'toggle') {
                  targetElement.isHidden = !targetElement.isHidden;
                }
              }
            });
          };

          const triggerInteraction = (el) => {
            currentPageElements.value.forEach(item => { if(item.id !== el.id && item.type === 'interactive') item.isOpen = false });
            el.isOpen = !el.isOpen;
          };

          const playAudio = (el) => {
            document.querySelectorAll('audio').forEach(a => { if(a.src !== el.src) a.pause() });
            currentPageElements.value.forEach(item => { if(item.type === 'audio' && item.id !== el.id) item.isPlaying = false; });
            const audioEl = document.querySelector('audio[src="'+el.src+'"]');
            if(audioEl) { if(el.isPlaying) { audioEl.pause(); el.isPlaying = false; } else { audioEl.play(); el.isPlaying = true; } }
          };

          const toggleFullscreen = async () => {
            const el = document.documentElement;
            if (!isFullscreen.value) {
              try {
                if (el.requestFullscreen) await el.requestFullscreen();
                else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
                else if (el.msRequestFullscreen) await el.msRequestFullscreen();
              } catch (err) { console.warn("No se pudo iniciar pantalla completa", err); }
            } else {
              try {
                if (document.exitFullscreen) await document.exitFullscreen();
                else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
                else if (document.msExitFullscreen) await document.msExitFullscreen();
              } catch (err) { console.warn("No se pudo salir de pantalla completa", err); }
            }
          };

          const onFullscreenChange = () => {
            isFullscreen.value = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
            setTimeout(fitToScreen, 100);
          };

          onMounted(() => {
            activeTransition.value = slideConfigs.value[1]?.transition || 'none';

            Object.values(documentState.value).forEach(pageItems => {
              pageItems.forEach(el => { if (el.type === 'timer') { el.timeLeft = el.duration * 60; el.isRunning = true; } });
            });

            setInterval(() => {
              Object.values(documentState.value).forEach(pageItems => {
                pageItems.forEach(el => { if (el.type === 'timer' && el.isRunning && el.timeLeft > 0) el.timeLeft--; });
              });
            }, 1000);

            fitToScreen();
            window.addEventListener('resize', fitToScreen);

            document.addEventListener('keydown', (e) => {
              if(['ArrowRight', ' '].includes(e.key)) { e.preventDefault(); advancePresentation(); }
              if(e.key === 'ArrowLeft') { e.preventDefault(); changePageTo(pageNum.value - 1); }
            });

            // 👉 1. Escuchar el ratón y teclado para despertar el menú
            document.addEventListener('mousemove', wakeUpPlayNav);
            document.addEventListener('keydown', wakeUpPlayNav);
            wakeUpPlayNav(); // Lo activamos por primera vez al abrir el archivo

            // 👉 2. Pasar de diapositiva al hacer clic en cualquier lugar (estilo PowerPoint real)
            document.addEventListener('click', (e) => {
              // Comprobamos que no se esté haciendo clic en un botón o en un elemento interactivo
              if (!e.target.closest('button') && !e.target.closest('.is-clickable')) {
                advancePresentation();
              }
            });

            document.addEventListener('fullscreenchange', onFullscreenChange);
            document.addEventListener('webkitfullscreenchange', onFullscreenChange);
          });

          // 👉 3. AQUÍ ESTABA EL PROBLEMA: Ahora sí retornamos showPlayNav y wakeUpPlayNav
          return {
            baseWidth, baseHeight, docType, zoom, pageNum, numPages, currentPageElements, currentBgColor, currentBgImage, changePageTo, executeEvents, triggerInteraction, isYouTube, getYouTubeEmbedUrl, formatIframeUrl, isIframeBlocked, getChartValues, getChartMax, getPieGradient, playAudio, renderTrigger, activeTransition, formatTime, getCalendarDays, getDayEvents, getNodesByParent, getNodeStyle, isFullscreen, toggleFullscreen, showPlayNav, wakeUpPlayNav, currentAnimationStep, maxAnimationStep, advancePresentation
          };
        }
      }).mount('#app');
    <\/script>
  </body>
  </html>`

    const url = URL.createObjectURL(new Blob([htmlContent], { type: 'text/html' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'presentacion_interactiva.html'
    a.click()
    URL.revokeObjectURL(url)
  }

</script>

  <style scoped>
  @import url('https://unpkg.com/cropperjs@1.6.2/dist/cropper.css');
  /* O mejor aún, usa el local: @import 'cropperjs/dist/cropper.css'; */
  .pro-editor-app {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    background-color: var(--surface-base);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    overflow: hidden;
  }
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--overlay-backdrop);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
  .modal-overlay {
    z-index: 10001;
  }
  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid var(--surface-soft);
    border-top-color: var(--accent-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  /* pro-header existe por el componente hijo pero lo dejamos listo por si acaso */
  .pro-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 48px;
    background-color: var(--surface-panel);
    border-bottom: 1px solid var(--border-subtle);
    padding: 0 16px;
    flex-shrink: 0;
    box-shadow: var(--shadow-sm);
    z-index: 10;
  }
  .header-left,
  .header-center,
  .header-right {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  .pro-logo {
    font-size: 1.1rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 8px;
    letter-spacing: -0.5px;
  }
  .text-accent {
    color: var(--accent-primary);
  }
  .file-menu {
    display: flex;
    gap: 8px;
  }
  .menu-item {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid var(--border-strong);
    color: var(--text-primary);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .menu-item:hover:not(:disabled) {
    background: var(--border-strong);
  }
  .menu-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .menu-item.is-loading {
    background: var(--accent-primary);
    color: var(--text-primary);
    font-weight: bold;
    border-color: var(--accent-primary);
  }
  .btn-export {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
    color: var(--text-primary);
  }
  .btn-export:hover:not(:disabled) {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
  }
  .zoom-controls {
    display: flex;
    align-items: center;
    gap: 5px;
    background: var(--bg-base);
    padding: 4px;
    border-radius: 8px;
    border: 1px solid var(--border-strong);
  }
  .zoom-level {
    font-size: 0.8rem;
    font-weight: 600;
    min-width: 45px;
    text-align: center;
  }
  .divider-vertical {
    width: 1px;
    height: 20px;
    background: var(--border-strong);
    margin: 0 5px;
  }
  .btn-play {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--accent-primary);
    color: var(--text-primary);
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
  }
  .btn-play:hover {
    background: var(--accent-primary);
    transform: translateY(-1px);
    box-shadow: var(--ring-accent);
  }
  .btn-play.is-active {
    background: var(--surface-elevated);
    border: 1px solid var(--border-strong);
  }
  .btn-play.is-active:hover {
    background: var(--danger-hover);
    box-shadow: var(--ring-accent);
  }
  .play-nav-overlay {
    position: fixed;
    bottom: 25px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface-elevated);
    backdrop-filter: blur(10px);
    padding: 8px 16px;
    border-radius: 30px;
    border: 1px solid var(--border-subtle);
    display: flex;
    gap: 15px;
    z-index: 10000;
    color: var(--text-primary);
    align-items: center;
    font-weight: 600;
    box-shadow: var(--shadow-md);
    transition: opacity 0.4s ease, transform 0.4s ease;
  }
  .play-nav-overlay button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: var(--surface-soft);
    color: var(--text-primary);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-weight: bold;
    transition: 0.2s;
  }
  .play-nav-overlay button:hover:not(:disabled) {
    background: var(--accent-primary);
    transform: scale(1.1);
  }
  .play-nav-overlay button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  .play-nav-overlay.is-idle {
  opacity: 0;
  pointer-events: none; /* Evita que bloquee clics cuando es invisible */
  transform: translate(-50%, 15px); /* Pequeño efecto de caída al ocultarse */
  }
  .text-muted {
    color: var(--text-secondary);
    font-weight: normal;
  }
  /* --- CAJA DELIMITADORA ESTILO FIGMA --- */
  .interactive-element.is-selected {
    outline: none !important; /* Quitamos el outline rígido antiguo */
  }

  /* La caja ahora es hija del elemento rotado, por lo que rotará con él automáticamente */
  .figma-bounding-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 1.5px solid var(--selection-blue);
    pointer-events: none; /* Deja pasar los clicks al drag central */
    z-index: 100;
    box-sizing: border-box;
  }

  /* CUADRADOS DE REDIMENSIÓN */
  .figma-bounding-box .resize-handle {
    position: absolute;
    width: 10px;
    height: 10px;
    background: var(--text-primary);
    border: 1.5px solid var(--selection-blue);
    pointer-events: auto;
    box-sizing: border-box;
    z-index: 102;
  }
  .resize-handle.nw { top: -5px; left: -5px; cursor: nwse-resize; }
  .resize-handle.ne { top: -5px; right: -5px; cursor: nesw-resize; }
  .resize-handle.sw { bottom: -5px; left: -5px; cursor: nesw-resize; }
  .resize-handle.se { bottom: -5px; right: -5px; cursor: nwse-resize; }

  /* ÁREAS INVISIBLES DE ROTACIÓN (Más grandes y ubicadas fuera de las esquinas) */
  /* --- ÁREAS INVISIBLES DE ROTACIÓN CON CURSORES DE FIGMA --- */
  /* --- ÁREAS INVISIBLES DE ROTACIÓN CON FLECHAS CURVAS DE DOBLE SENTIDO --- */
  .figma-bounding-box .rotate-handle {
    position: absolute;
    width: 28px;
    height: 28px;
    background: transparent;
    border-radius: 50%;
    pointer-events: auto;
    z-index: 101;
  }

  /* Esquina Superior Izquierda */
  .rotate-handle.nw {
    top: -20px;
    left: -20px;
    cursor: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='rotate(0 12 12)'%3E%3Cpath d='M 12 4 A 8 8 0 0 0 4 12 M 12 2 L 16 4 L 12 6 M 2 12 L 4 16 L 6 12' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M 12 4 A 8 8 0 0 0 4 12 M 12 2 L 16 4 L 12 6 M 2 12 L 4 16 L 6 12' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3C/svg%3E") 12 12, crosshair;
  }

  /* Esquina Superior Derecha */
  .rotate-handle.ne {
    top: -20px;
    right: -20px;
    cursor: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='rotate(90 12 12)'%3E%3Cpath d='M 12 4 A 8 8 0 0 0 4 12 M 12 2 L 16 4 L 12 6 M 2 12 L 4 16 L 6 12' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M 12 4 A 8 8 0 0 0 4 12 M 12 2 L 16 4 L 12 6 M 2 12 L 4 16 L 6 12' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3C/svg%3E") 12 12, crosshair;
  }

  /* Esquina Inferior Izquierda */
  .rotate-handle.sw {
    bottom: -20px;
    left: -20px;
    cursor: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='rotate(270 12 12)'%3E%3Cpath d='M 12 4 A 8 8 0 0 0 4 12 M 12 2 L 16 4 L 12 6 M 2 12 L 4 16 L 6 12' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M 12 4 A 8 8 0 0 0 4 12 M 12 2 L 16 4 L 12 6 M 2 12 L 4 16 L 6 12' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3C/svg%3E") 12 12, crosshair;
  }

  /* Esquina Inferior Derecha */
  .rotate-handle.se {
    bottom: -20px;
    right: -20px;
    cursor: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='rotate(180 12 12)'%3E%3Cpath d='M 12 4 A 8 8 0 0 0 4 12 M 12 2 L 16 4 L 12 6 M 2 12 L 4 16 L 6 12' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M 12 4 A 8 8 0 0 0 4 12 M 12 2 L 16 4 L 12 6 M 2 12 L 4 16 L 6 12' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3C/svg%3E") 12 12, crosshair;
  }
  /* Ubicación calculada para envolver la esquina por fuera */

  /* EVITA SCROLL GENERAL */
  .pro-workspace {
    display: flex;
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }
  .center-workspace {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    min-width: 0;
    background-color: var(--surface-base);
    position: relative;
    transition: all 0.3s ease;
  }
  .pro-top-toolbar {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    padding: 10px 20px;
    background: var(--surface-elevated) !important;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-subtle) !important;
    border-radius: 0 0 20px 20px;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    z-index: 30;
    flex-shrink: 0;
    align-items: center;
  }
  .toolbar-category {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    background: var(--surface-panel);
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    padding: 8px 14px;
    transition: background 0.2s;
  }
  .toolbar-category:hover {
    background: var(--surface-soft);
  }
  .category-label {
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    opacity: 0.8;
  }
  .category-tools {
    display: flex;
    gap: 2px;
  }
  .tool-btn {
  transition: all var(--transition-bounce);
  border-radius: var(--radius-sm);

    font-size: 1.1rem;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
  }
  .tool-btn:hover {
  transform: translateY(-2px);

    background: var(--bg-surface-active);
    color: var(--text-primary);
  }
  .tool-btn.active {
    background: var(--surface-soft-strong);
    color: var(--accent-primary);
  }

  /* ÁREA DEL LIENZO */
  .pro-canvas-area {
  background-color: var(--surface-base);

    flex: 1;
    position: relative;
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: grab !important;
    background-image: radial-gradient(var(--canvas-dot) 0.8px, transparent 0.8px);
    background-size: 24px 24px;
  }

  .pro-canvas-area.is-panning {
    cursor: grabbing !important;
  }
  /* Fuerza el cursor de agarre incluso si pasas por encima de otros elementos */
  .pro-canvas-area.space-pressed *,
  .pro-canvas-area.is-panning * {
    cursor: inherit !important;
    pointer-events: none; /* Evita interacciones accidentales al hacer pan */
  }

  /* PANELES LATERALES MÁS COMPACTOS */
  .pro-sidebar {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  background: var(--surface-panel) !important;
  box-shadow: var(--shadow-panel-left) !important;
  z-index: 40;
    width: 240px; /* Reducido de 280px para dar más espacio a la diapositiva */
    background-color: var(--surface-panel);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    overflow: hidden;
  }
  .right-sidebar {
    box-shadow: var(--shadow-panel-right) !important;
    width: 280px; /* Reducido de 320px para equilibrar paneles */
  }
  .panel-header {
    padding: 12px 15px; /* Padding reducido */
    font-weight: 600;
    font-size: 0.8rem;
    border-bottom: 1px solid var(--border-subtle);
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-secondary);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .badge {
    background: var(--border-strong);
    color: var(--text-primary);
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.7rem;
  }
  .sidebar-footer {
    padding: 12px 15px;
    border-top: 1px solid var(--border-subtle);
    background: var(--surface-panel);
  }
  .sidebar-cta {
    padding: 12px 15px;
    border-bottom: 1px solid var(--border-subtle);
  }

  /* THUMBNAILS Y DRAG & DROP DE CAPAS */
  .slides-preview-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 15px;
    overflow-y: auto;
    flex: 1;
  }
  .thumb-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    cursor: pointer;
    border-radius: 12px;
    padding: 8px;
    transition: background 0.2s, box-shadow 0.2s;
  }
  .thumb-item:hover {
    background: var(--surface-soft);
  }
  .thumb-item.is-active {
    background: var(--surface-soft-strong);
    box-shadow: inset 0 0 0 1px var(--border-strong);
  }
  .thumb-num {
    font-size: 0.8rem;
    font-weight: bold;
    color: var(--text-secondary);
    margin-top: 5px;
    min-width: 15px;
  }
  .thumb-item.is-active .thumb-num {
    color: var(--accent-primary);
  }
  .thumb-card-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .thumb-card {
  background-size: cover !important;
  background-position: center !important;
  transition: background-image 0.4s cubic-bezier(0.25, 1, 0.5, 1), transform 0.2s;
  will-change: background-image, transform;

    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 10px;
    border: 1px solid var(--border-subtle);
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;
  }
  .thumb-actions {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--overlay-backdrop);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 6px;
    opacity: 0;
    transition: opacity 0.2s;
    backdrop-filter: blur(4px);
  }
  .thumb-card:hover .thumb-actions {
    opacity: 1;
  }
  .thumb-action-btn {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: none;
    background: var(--surface-elevated);
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.2s;
    font-size: 0.8rem;
  }
  .thumb-action-btn:hover:not(:disabled) {
    background: var(--accent-primary);
    transform: scale(1.1);
  }
  .thumb-action-btn.btn-trash:hover:not(:disabled) {
    background: var(--danger);
  }
  .thumb-action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--border-strong) !important;
    color: var(--text-secondary) !important;
    transform: scale(1) !important;
  }

  .thumb-elements {
    padding: 4px 0 0 0;
    background: transparent;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .tree-child {
    padding: 4px 6px;
    font-size: 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-secondary);
    border-radius: 4px;
    transition: 0.2s;
    border: 1px solid transparent;
  }
  .tree-child .icon {
    font-size: 0.9rem;
  }
  .tree-child:hover {
    background: var(--border-strong);
    color: var(--text-primary);
  }
  .tree-child.is-selected {
    background: var(--accent-primary);
    color: var(--text-primary);
    font-weight: 500;
  }
  .drag-handle {
    cursor: grab;
    opacity: 0.5;
    font-size: 1rem;
  }
  .drag-handle:hover {
    opacity: 1;
    color: var(--text-primary);
  }
  .tree-child.drag-over {
    border-top: 2px solid var(--accent-primary);
  }
  .layer-actions {
    margin-left: auto;
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: 0.2s;
  }
  .tree-child:hover .layer-actions,
  .tree-child.is-selected .layer-actions {
    opacity: 1;
  }
  .layer-action-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 2px;
    border-radius: 4px;
    transition: 0.2s;
  }
  .layer-action-btn:hover {
    background: var(--surface-soft);
    color: var(--text-primary);
  }
  .layer-action-btn.is-active {
    color: var(--accent-primary);
  }

  .panel-content {
    padding: 15px; /* Reducido de 20px */
  }
  .empty-state {
    text-align: center;
    color: var(--text-secondary);
    padding-top: 30px;
    font-size: 0.85rem;
  }
  .empty-icon-wrapper {
    width: 50px;
    height: 50px;
    background: var(--bg-surface-active);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px auto;
  }
  .element-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  .badge-type {
    background: var(--surface-soft);
    color: var(--accent-primary);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 5px;
    letter-spacing: 0.5px;
  }
  .prop-section {
    background: var(--surface-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: 12px;
    padding: 12px; /* Reducido de 15px */
    margin-bottom: 12px; /* Reducido de 15px */
  }
  .section-title {
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .prop-group {
    margin-bottom: 10px;
  }
  .prop-group:last-child {
    margin-bottom: 0;
  }
  .prop-group label {
    display: block;
    font-size: 0.7rem;
    color: var(--text-secondary);
    margin-bottom: 4px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .prop-row {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
  }
  .prop-row:last-child {
    margin-bottom: 0;
  }
  .prop-row .half {
    width: 50%;
    margin-bottom: 0;
  }
  .pro-input {
    width: 100%;
    background: var(--surface-soft-contrast);
    border: 1px solid transparent;
    color: var(--text-primary);
    padding: 9px 10px;
    border-radius: 10px;
    box-sizing: border-box;
    font-family: inherit;
    font-size: 0.8rem;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .pro-input:hover {
    border-color: var(--border-subtle);
  }
  .pro-input:focus {
    outline: none;
    border-color: var(--border-strong);
    box-shadow: var(--ring-accent);
  }
  .pro-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .color-picker-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface-soft-contrast);
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 2px 8px;
  }
  /* Elemento fuera del lienzo — visible en editor, oculto en presentación */
  .interactive-element.is-outside-canvas {
    opacity: 0.6;
    outline: 1.5px dashed var(--accent-primary) !important;
    outline-offset: 2px;
  }
  .pro-color-picker {
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    background: transparent;
  }
  .color-picker-wrapper::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  .color-picker-wrapper::-webkit-color-swatch {
    border: none;
    border-radius: 3px;
  }
  .color-hex {
    font-size: 0.75rem;
    color: var(--text-primary);
    font-family: monospace;
  }
  .range-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .range-val {
    font-size: 0.75rem;
    color: var(--text-primary);
    min-width: 30px;
    text-align: right;
  }
  .info-box {
    background: var(--surface-soft);
    border-left: 3px solid var(--accent-primary);
    padding: 10px;
    border-radius: 4px;
    color: var(--text-primary);
    line-height: 1.4;
    font-size: 0.8rem;
  }
  .info-box-accent {
    font-size: 0.75rem;
    padding: 8px 10px;
  }
  /* MIS PLANTILLAS */
  .tsp-my-templates-wrapper {
    position: relative;
    margin-top: 8px;
  }

  .tsp-my-templates-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    background: rgba(167, 139, 250, 0.08);
    border: 1px dashed rgba(167, 139, 250, 0.35);
    border-radius: 6px;
    color: #a78bfa;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }
  .tsp-my-templates-btn:hover {
    background: rgba(167, 139, 250, 0.15);
    border-color: rgba(167, 139, 250, 0.6);
  }
  .tsp-my-templates-btn i:first-child {
    font-size: 1rem;
  }

  /* POPUP FLOTANTE */

  .tmpl-popup-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-strong);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .tmpl-popup-header i {
    color: #a78bfa;
    font-size: 1rem;
  }

  .tmpl-popup-body {
    padding: 10px;
  }

  .tmpl-coming-soon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 24px 16px;
    text-align: center;
  }
  .tmpl-coming-soon i {
    font-size: 2rem;
    color: #a78bfa;
    opacity: 0.6;
  }
  .tmpl-coming-soon p {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }
  .tmpl-coming-soon small {
    font-size: 0.75rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }
  .align-buttons {
    display: flex;
    gap: 4px;
    background: var(--surface-soft-contrast);
    border: 1px solid var(--border-subtle);
    padding: 3px;
    border-radius: 4px;
  }
  .align-buttons .tool-btn {
  transition: all var(--transition-bounce);
  border-radius: var(--radius-sm);

    flex: 1;
    font-size: 0.9rem;
    border-radius: 3px;
  }
  .align-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    background: var(--surface-soft-contrast);
    border: 1px solid var(--border-subtle);
    padding: 6px;
    border-radius: 4px;
  }

  .btn-primary,
  .btn-secondary,
  .btn-ghost,
  .btn-danger,
  .btn-icon-danger {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    padding: 6px 12px; /* Reducido */
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    box-sizing: border-box;
    transition: all 0.2s;
  }
  .btn-primary {
    background: var(--accent-primary);
    color: var(--text-primary);
    border-color: transparent;
  }
  .btn-primary:hover {
    background: var(--accent-primary);
    box-shadow: var(--ring-accent);
  }
  .btn-secondary {
    background: var(--surface-soft-contrast);
    color: var(--text-primary);
    border-color: var(--border-subtle);
  }
  .btn-secondary:hover {
    background: var(--surface-soft);
  }
  .btn-ghost {
    background: transparent;
    color: var(--text-primary);
    border-color: var(--border-subtle);
  }
  .btn-ghost:hover {
    background: var(--surface-soft);
    color: var(--text-primary);
  }
  .btn-danger {
    background: var(--surface-soft);
    color: var(--accent-primary);
    border-color: var(--border-strong);
  }
  .btn-danger:hover {
    background: var(--surface-soft-strong);
  }
  .btn-icon-danger {
    background: transparent;
    color: var(--text-secondary);
    padding: 4px;
    border-radius: 4px;
  }
  .btn-icon-danger:hover {
    background: var(--surface-soft);
    color: var(--accent-primary);
  }
  .btn-text-danger {
    background: transparent;
    color: var(--danger);
    border: none;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px;
  }
  .btn-text-danger:hover {
    text-decoration: underline;
  }
  .large-btn {
    padding: 10px 20px;
    font-size: 0.9rem;
    border-radius: 6px;
  }
  .w-100 {
    width: 100%;
    flex: 1;
  }
  .mt-1 { margin-top: 5px; }
  .mt-2 { margin-top: 10px; }
  .mt-4 { margin-top: 20px; }
  .pt-4 { padding-top: 20px; }
  .mb-1 { margin-bottom: 5px; }
  .mb-2 { margin-bottom: 10px; }
  .mb-0 { margin-bottom: 0px !important; }
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .block { display: block; }
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-primary);
    font-size: 0.8rem;
    cursor: pointer;
  }

  /* ÁREA DE LIENZO Y ELEMENTOS */
  .canvas-wrapper {
  transition: transform 0.15s cubic-bezier(0.2, 0, 0, 1);
  will-change: transform;

    position: relative;
    transform-origin: center center;
    transition: transform 0.1s ease-out;
    box-shadow: var(--shadow-lg);
    user-select: none;
    -webkit-user-select: none;
  }
  .canvas-wrapper.play-mode-active {
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: var(--shadow-lg);
  }
  .layer-engine {
  box-shadow: var(--shadow-lg) !important;
  border: 1px solid var(--glass-border);

    position: relative;
    overflow: visible;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
  .layer-pdf {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    pointer-events: none;
  }
  .pptx-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: var(--text-secondary);
    pointer-events: none;
    z-index: 0;
    background: var(--overlay-backdrop);
  }
  .interactive-element {
      transition: opacity 0.2s;
  will-change: transform, opacity;

    position: absolute;
    box-sizing: border-box;
    display: flex;
  }
  .interactive-element.is-selected {
    outline: 2px solid var(--accent-primary);
    outline-offset: 1px;
  }
  .interactive-element.is-clickable {
    cursor: pointer;
  }
  .interactive-element.no-pointer {
    pointer-events: none;
  }
  .interactive-element.is-hidden-editor {
    opacity: 0.3 !important;
    border: 1px dashed var(--accent-primary);
  }
  .resize-handle {
    position: absolute;
    bottom: -5px;
    right: -5px;
    width: 10px;
    height: 10px;
    background: var(--text-primary);
    border: 1.5px solid var(--selection-blue);
    border-radius: 50%;
    cursor: nwse-resize;
    z-index: 100;
  }


  /* ESTILOS ESPECÍFICOS COMPONENTES */
  .el-text { width: 100%; height: 100%; white-space: pre-wrap; line-height: 1.3; word-break: break-word; }
  .el-list { width: 100%; height: 100%; overflow: hidden; word-break: break-word; }
  .el-checkbox-list { width: 100%; height: 100%; overflow: hidden; word-break: break-word; }
  .el-shape { width: 100%; height: 100%; }
  .el-icon { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
  .el-image-container, .el-video-container, .el-iframe-container { width: 100%; height: 100%; position: relative; }
  .el-content-fitted { width: 100%; height: 100%; display: block; border: none; }
  .placeholder-box {
    width: 100%; height: 100%; background: var(--surface-elevated); border: 1px dashed var(--border-subtle);
    display: flex; flex-direction: column; gap: 10px; align-items: center; justify-content: center;
    font-size: 0.8rem; color: var(--text-secondary); text-align: center; padding: 10px; box-sizing: border-box;
  }
  .drag-protector { position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 10; cursor: move; }
  .el-3d { width: 100%; height: 100%; position: relative; }
  .el-draw-board { width: 100%; height: 100%; position: relative; display: flex; flex-direction: column; }
  .draw-drag-handle {
    position: absolute; top: -25px; left: 0; padding: 3px 10px; background: var(--accent-primary); color: var(--text-primary);
    display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: bold;
    cursor: move; border-radius: 3px; z-index: 10;
  }

  /* GRÁFICOS */
  .el-chart-wrapper { display: flex; flex-direction: column; box-sizing: border-box; width: 100%; height: 100%; }
  .chart-inner-area { flex: 1; position: relative; width: 100%; height: calc(100% - 25px); }
  .chart-bar-container { display: flex; align-items: flex-end; justify-content: space-around; width: 100%; height: 100%; gap: 6px; }
  .bar-col { display: flex; flex-direction: column; justify-content: flex-end; align-items: center; width: 100%; height: 100%; }
  .bar-fill { width: 100%; border-radius: 3px 3px 0 0; transition: height 0.4s ease-out; box-shadow: inset 0 -10px 20px rgba(0, 0, 0, 0.1); }
  .chart-hbar-container { display: flex; flex-direction: column; justify-content: space-around; width: 100%; height: 100%; gap: 4px; }
  .hbar-row { display: flex; align-items: center; width: 100%; height: 100%; gap: 8px; }
  .hbar-track { flex: 1; height: 100%; min-height: 8px; background: rgba(0, 0, 0, 0.05); border-radius: 0 3px 3px 0; display: flex; align-items: center; }
  .hbar-fill { height: 100%; border-radius: 0 3px 3px 0; transition: width 0.4s ease-out; box-shadow: inset -10px 0 20px rgba(0, 0, 0, 0.1); }
  .chart-pie-container { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; position: relative; }
  .pie-circle { border-radius: 50%; width: 100%; height: 100%; max-width: 250px; max-height: 250px; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); }
  .donut-hole { width: 55%; height: 55%; border-radius: 50%; box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1); }
  .chart-label { font-size: 10px; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; font-weight: 500; }
  .chart-value { font-size: 10px; margin-bottom: 2px; font-weight: 800; }
  .pie-legend { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 10px; }
  .pie-legend-item { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 500; }
  .legend-dot { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }

  .el-interactive { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
  .hotspot-pulse { width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; animation: pulse 2s infinite; }
  @keyframes pulse { 0% { transform: scale(0.9); opacity: 0.9; } 70% { transform: scale(1.3); opacity: 0; } 100% { transform: scale(0.9); opacity: 0; } }
  .interactive-modal { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 15px; background: var(--surface-elevated); color: var(--text-primary); padding: 20px; border-radius: 12px; width: 300px; box-shadow: var(--shadow-lg); z-index: 9999; cursor: default; user-select: text; -webkit-user-select: text; border: 1px solid var(--border-subtle); }
  .modal-title { margin: 0 0 10px 0; font-size: 1.1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px; font-weight: 800; }

  .el-link { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 0 15px; box-sizing: border-box; transition: 0.2s; }
  .el-link:hover { filter: brightness(1.1); }
  .el-link:active { transform: scale(0.97); }

  .el-accordion { width: 100%; height: 100%; overflow-y: auto; border-radius: 12px; box-shadow: var(--shadow-sm); }
  .accordion-item { border-bottom: 1px solid var(--border-subtle); }
  .accordion-item:last-child { border-bottom: none; }
  .accordion-header { padding: 10px 14px; font-weight: 600; font-size: 0.9rem; display: flex; justify-content: space-between; background: var(--surface-soft); transition: 0.2s; }
  .accordion-header:hover { background: var(--surface-soft-strong); }
  .accordion-content { padding: 12px 14px; font-size: 0.85rem; line-height: 1.5; background: var(--surface-soft-contrast); user-select: text; }
  .accordion-content.is-preview { opacity: 0.5; }

  .accordion-edit-item { background: rgba(255, 255, 255, 0.02); padding: 8px; border-radius: 6px; margin-bottom: 8px; border: 1px solid var(--border-strong); }

  /* AUDIO VARIANTES */
  .el-audio-wrapper { cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .audio-pill { display: flex; align-items: center; gap: 8px; width: 100%; height: 100%; padding: 0 15px; box-sizing: border-box; font-family: sans-serif; font-size: 0.85rem; font-weight: 600; transition: 0.2s; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
  .audio-pill i { font-size: 1.3rem; }
  .audio-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .audio-waves { display: flex; gap: 3px; height: 12px; align-items: center; }
  .audio-waves span { width: 3px; background: currentColor; height: 100%; border-radius: 2px; animation: wave 1s infinite ease-in-out; }
  .audio-waves span:nth-child(2) { animation-delay: 0.2s; }
  .audio-waves span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes wave { 0%, 100% { height: 20%; } 50% { height: 100%; } }
  .audio-minimal { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); transition: 0.2s; }
  .audio-floating { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; transition: transform 0.2s, box-shadow 0.2s; }
  .audio-floating:hover { transform: translateY(-4px); }
  .audio-floating:active { transform: translateY(0); }
  .audio-minimal.is-playing, .audio-floating.is-playing { animation: pulse-audio 1.5s infinite alternate; }
  @keyframes pulse-audio { from { box-shadow: 0 0 0 0px rgba(var(--accent-rgb), 0.35); } to { box-shadow: 0 0 0 15px rgba(var(--accent-rgb), 0); } }

  /* ESTADO VACÍO */
  .empty-workspace { display: flex; align-items: center; justify-content: center; background-color: var(--surface-base); }
  .empty-box { background: var(--surface-elevated); border: 1px solid var(--border-subtle); padding: 50px; border-radius: 16px; text-align: center; max-width: 450px; box-shadow: var(--shadow-lg); }
  .empty-box h3 { margin: 0 0 12px 0; font-size: 1.3rem; font-weight: 800; }
  .empty-box p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; line-height: 1.5; }

  /* MODAL DE NUEVO PROYECTO */
  .new-project-modal { background: var(--surface-elevated); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 25px; width: 400px; max-width: 90vw; box-shadow: var(--shadow-lg); }
  .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px; }
  .modal-header h3 { margin: 0; color: var(--text-primary); font-size: 1.1rem; }
  .modal-actions-split { justify-content: space-between; }
  .modal-inline-actions { display: flex; gap: 8px; }
  .template-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px; }
  .template-card { background: var(--surface-panel); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
  .template-card:hover { border-color: var(--border-strong); background: var(--surface-soft); }
  .template-card.is-active { border-color: var(--border-strong); background: var(--surface-soft-strong); box-shadow: inset 0 0 0 1px var(--accent-primary); }
  .template-card i { font-size: 1.8rem; color: var(--text-secondary); }
  .template-card.is-active i { color: var(--accent-primary); }
  .template-card span { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--border-strong); }

  /* MAPA MENTAL ESTILOS */
  .el-mindmap-container { width: 100%; height: 100%; position: relative; overflow: visible; display: flex; align-items: center; justify-content: flex-start; }
  .mm-wrapper { display: flex; align-items: center; justify-content: flex-start; width: 100%; height: 100%; box-sizing: border-box; padding: 10px; }
  .mm-level-0 { display: flex; align-items: center; position: relative; }
  .mm-node-block { display: flex; flex-direction: column; align-items: center; padding: 8px 12px; cursor: pointer; transition: 0.2s; position: relative; z-index: 2; box-shadow: var(--shadow-sm); }
  .mm-node-block:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .mm-node-img { width: 30px; height: 30px; object-fit: cover; border-radius: 4px; margin-bottom: 4px; }
  .mm-node-text { font-weight: bold; font-size: 0.9rem; text-align: center; }
  .mm-node-note { font-size: 0.65rem; opacity: 0.8; margin-top: 2px; text-align: center; max-width: 120px; line-height: 1.2; }
  .mm-children { display: flex; flex-direction: column; justify-content: center; position: relative; padding-left: 30px; gap: 10px; }
  .mm-child-wrapper { display: flex; align-items: center; position: relative; }
  .mm-child-wrapper::before { content: ''; position: absolute; left: -15px; top: 50%; width: 15px; height: 1px; border-top: var(--mm-line-width) solid var(--mm-line-color); }
  .mm-child-wrapper::after { content: ''; position: absolute; left: -15px; border-left: var(--mm-line-width) solid var(--mm-line-color); }
  .mm-child-wrapper:first-child::after { top: 50%; bottom: 0; }
  .mm-child-wrapper:last-child::after { top: 0; bottom: 50%; }
  .mm-child-wrapper:not(:first-child):not(:last-child)::after { top: 0; bottom: 0; }
  .mm-child-wrapper:first-child:last-child::after { display: none; }
  .mm-connector-right { position: absolute; right: -15px; top: 50%; width: 15px; border-top: var(--mm-line-width) solid var(--mm-line-color); }

  /* GUÍAS DE ALINEACIÓN (SNAPPING) */
  .snap-guide {
    position: absolute;
    background-color: var(--accent-primary);
    z-index: 9999;
    pointer-events: none;
    box-shadow: var(--shadow-sm);
  }
  .snap-guide.vertical {
    width: 1px;
    height: 100%;
    top: 0;
    transform: translateX(-50%);
  }
  .snap-guide.horizontal {
    height: 1px;
    width: 100%;
    left: 0;
    transform: translateY(-50%);
  }

  /* --- NOTIFICACIONES TOAST --- */
  .pro-toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%); /* Centrado arriba */
    z-index: 999999 !important;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: var(--shadow-md);
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.9rem;
    min-width: 300px;
    max-width: 450px;
    backdrop-filter: blur(10px);
  }

  .toast-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .toast-content i {
    font-size: 1.3rem;
  }

  .toast-close {
    background: transparent;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    opacity: 0.7;
    transition: 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
  }

  .toast-close:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  /* Colores según el tipo de mensaje */
  .toast-error { background: var(--surface-elevated); border-left: 4px solid var(--accent-primary); }
  .toast-success { background: var(--surface-elevated); border-left: 4px solid var(--accent-primary); }
  .toast-warning { background: var(--surface-elevated); border-left: 4px solid var(--accent-primary); }
  .toast-info { background: var(--surface-elevated); border-left: 4px solid var(--accent-primary); }

  /* Animación de entrada y salida */
  .toast-fade-enter-active,
  .toast-fade-leave-active {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
  .toast-fade-enter-from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  .toast-fade-leave-to {
    opacity: 0;
    transform: translate(-50%, -20px);
  }

  /* --- EDICIÓN DE TEXTO DIRECTA --- */
  .interactive-element.is-editing .figma-bounding-box {
    display: none !important; /* Ocultar los puntos y marcos al escribir */
  }

  .el-text[contenteditable="true"] {
    cursor: text !important;
    outline: 2px solid var(--accent-primary) !important;
    outline-offset: 4px;
    border-radius: 4px;
    /* Permitir la selección nativa del texto al estar enfocado */
    user-select: text !important;
    -webkit-user-select: text !important;
  }

  /* Ocultar el cursor normal del lienzo mientras se arrastra o edita */
  .pro-canvas-area:has(.el-text[contenteditable="true"]) {
    cursor: default !important;
  }

  .ipm-trigger-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 12px;
    background: var(--surface-soft-contrast);
    border: 1px solid var(--border-subtle);
    border-radius: 6px;
    color: var(--text-primary);
    cursor: pointer;
    font-size: 0.85rem;
    transition: border-color 0.2s, background 0.2s;
    box-sizing: border-box;
  }
  .ipm-trigger-btn:hover {
    border-color: var(--accent-primary);
    background: var(--bg-surface-active);
  }
  .ipm-trigger-btn i:first-child {
    font-size: 1.3rem;
    color: var(--accent-primary);
    flex-shrink: 0;
  }
  /* PANEL DE PLANTILLAS EN SIDEBAR */
  .template-sidebar-panel {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-strong);
    background: var(--bg-base);
    flex-shrink: 0;
  }
  /* PANEL PLANTILLAS DESPLEGABLE */
  .template-sidebar-panel {
    border-bottom: 1px solid var(--border-strong);
    flex-shrink: 0;
  }

  .tsp-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 12px;
  background: var(--bg-base);
  border: none;
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tsp-toggle:hover { background: var(--surface-panel); color: var(--text-primary); }

  .tsp-toggle-left {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .tsp-toggle-left i { font-size: 1rem; color: var(--accent-primary); }

  .tsp-active-badge {
    background: var(--surface-soft);
    color: var(--accent-primary);
    font-size: 0.6rem;
    padding: 2px 7px;
    border-radius: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .tsp-body {
    position: absolute;
    top: 0;
    left: 105%;
    width: 270px;
    padding: 15px;
    background: var(--surface-elevated);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    box-shadow: var(--shadow-lg);
    z-index: 10050;
  }

  .tsp-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .tsp-card {
    display: flex;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
    border-radius: 6px;
    padding: 4px;
    border: 1.5px solid transparent;
    transition: all 0.15s;
  }
  .tsp-card:hover { border-color: var(--border-strong); }
  .tsp-card.is-active { border-color: var(--accent-primary); background: var(--surface-soft); }

  /* PREVIEWS */
  .tsp-preview {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    border: 1px solid var(--border-subtle);
    gap: 0;
    transition: border-color 0.15s;
  }
  .tsp-card:hover .tsp-preview { border-color: var(--accent-primary); }
  .tsp-card.is-active .tsp-preview { border-color: var(--accent-primary); }

  .tsp-preview-blank { background: var(--surface-elevated); }
  .tsp-preview-modern { background: var(--surface-panel); flex-direction: column; align-items: flex-start; justify-content: flex-start; padding: 0; }
  .tsp-preview-dark { background: var(--surface-base); }
  .tsp-preview-custom { background: var(--surface-panel); }

  /* Moderna: barra superior */
  .tsp-preview-header-bar {
    width: 100%;
    height: 38%;
    background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.45), var(--accent-primary));
    display: flex;
    align-items: flex-end;
    padding: 0 8px 5px;
    flex-shrink: 0;
  }
  .tsp-preview-content {
    padding: 6px 8px;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  .tsp-preview-accent {
    width: 22px;
    height: 3px;
    background: var(--accent-primary);
    border-radius: 2px;
    margin-top: 6px;
  }

  /* Oscura: punto decorativo */
  .tsp-preview-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent-primary);
    margin-top: 8px;
    opacity: 0.7;
  }

  .tsp-preview-line { flex-shrink: 0; border-radius: 3px; }
  .tsp-preview-line-blank { width: 60%; height: 8px; background: var(--text-secondary); opacity: 0.35; }
  .tsp-preview-line-modern { width: 70%; height: 7px; background: var(--text-primary); opacity: 0.9; }
  .tsp-preview-line-dark { width: 75%; height: 8px; background: var(--text-primary); opacity: 0.9; }

  /* BOTÓN AÑADIR al hacer hover */
  .tsp-add-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.7);
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--accent-primary);
    border: none;
    color: var(--text-primary);
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: var(--shadow-sm);
    z-index: 2;
  }
  .tsp-preview:hover .tsp-add-btn {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  .tsp-add-btn:hover {
    background: var(--accent-primary);
    transform: translate(-50%, -50%) scale(1.15) !important;
  }

  .tsp-name {
    font-size: 0.68rem;
    color: var(--text-secondary);
    font-weight: 500;
    text-align: center;
  }

  .tsp-backdrop {
    position: fixed;
    inset: 0;
    background: var(--overlay-backdrop);
    backdrop-filter: blur(4px);
    z-index: 10499;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tmpl-close-btn {
    margin-left: auto;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border-radius: 4px;
    transition: 0.15s;
  }
  .tmpl-close-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
  }
  .tsp-card.is-active .tsp-name { color: var(--accent-primary); }

  /* REORDENACIÓN DE THUMBS */
.thumb-item {
  cursor: grab;
  transition: opacity 0.2s, transform 0.15s;
}
.thumb-item.thumb-dragging {
  opacity: 0.4;
  transform: scale(0.97);
}
.thumb-item.thumb-drag-over {
  border-top: 2px solid var(--accent-primary);
  margin-top: -2px;
}

.thumb-pos-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  user-select: none;
}
.thumb-pos-btn:hover {
  background: var(--border-strong);
  color: var(--accent-primary);
}
.thumb-item.is-active .thumb-pos-btn {
  color: var(--accent-primary);
}
.layer-pdf {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
  /* 🚀 Mejora cómo el navegador interpola los píxeles */
  image-rendering: high-quality;
  -webkit-font-smoothing: antialiased;
}

.thumb-pos-input {
  width: 28px;
  height: 22px;
  background: var(--surface-elevated);
  border: 1px solid var(--accent-primary);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
  padding: 0 2px;
  box-shadow: var(--ring-accent);
  outline: none;
  appearance: textfield;
  -moz-appearance: textfield;
}
.thumb-pos-input::-webkit-outer-spin-button,
.thumb-pos-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
  /* TRANSICIONES Y ANIMACIONES */
  .slide-trans-fade { animation: transFade 0.6s ease-out forwards; }
  .slide-trans-slide { animation: transSlide 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
  .slide-trans-zoom { animation: transZoom 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
  @keyframes transFade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes transSlide { from { translate: 100px 0; opacity: 0; } to { translate: 0 0; opacity: 1; } }
  @keyframes transZoom { from { scale: 0.95; opacity: 0; } to { scale: 1; opacity: 1; } }

  .anim-fade-in { animation: animFadeIn 0.8s ease-out both; }
  .anim-slide-in { animation: animSlideIn 0.8s cubic-bezier(0.25, 1, 0.5, 1) both; }
  .anim-bounce { animation: animBounce 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
  @keyframes animFadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes animSlideIn { from { translate: 0 50px; opacity: 0; } to { translate: 0 0; opacity: 1; } }
  @keyframes animBounce { 0% { scale: 0.5; opacity: 0; } 50% { scale: 1.05; opacity: 1; } 100% { scale: 1; opacity: 1; } }

  /* RECTÁNGULO DE SELECCIÓN MÚLTIPLE */
  .marquee-selection {
    position: absolute;
    border: 2px solid var(--accent-primary);
    background: var(--surface-soft);
    pointer-events: none;
    z-index: 1000;
  }

  /* REDIMENSIONADORES DE PANELES LATERALES */
  .sidebar-resizer {
  width: 8px; /* Un poco más ancho para que sea fácil de agarrar */
  margin: 0 -4px; /* Centrado en el borde */
  cursor: col-resize;
  background: transparent;
  z-index: 999; /* Asegura que esté por encima del resto */
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}
  .sidebar-resizer:hover,
  .sidebar-resizer:active {
    background: var(--accent-primary);
  }

  /* FIGMA TARGET SELECTION UX */
  .pro-canvas-area.is-picking-target .interactive-element:hover {
    outline: 3px dashed var(--accent-primary) !important;
    outline-offset: 4px;
    cursor: crosshair !important;
    z-index: 99999 !important;
  }
  .pro-canvas-area.is-picking-target .interactive-element {
    cursor: crosshair !important;
  }

  /* --- EFECTO MARQUESINA --- */
  .marquee-track {
    display: flex;
    white-space: nowrap;
    position: absolute;
    animation-name: scroll-marquee;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  .marquee-content {
    padding: 0 50px;
    display: inline-block;
  }
  @keyframes scroll-marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  /* BOTONES PARA PLEGAR MENÚS LATERALES */
  .sidebar-toggle-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 48px;
    background: var(--surface-elevated);
    border: 1px solid var(--border-subtle);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 50;
    transition: all 0.2s;
    box-shadow: var(--shadow-sm);
  }

  .sidebar-toggle-btn:hover {
    background: var(--accent-primary);
    color: var(--text-primary);
  }

  .toggle-left {
    left: 0;
    border-radius: 0 8px 8px 0;
    border-left: none;
  }

  .toggle-right {
    right: 0;
    border-radius: 8px 0 0 8px;
    border-right: none;
  }

  /* TABS DEL INSPECTOR (TIPO FIGMA) */
  .inspector-tabs {
    display: flex;
    border-bottom: 1px solid var(--border-strong);
    background: var(--bg-base);
  }

  .inspector-tab {
    flex: 1;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-secondary);
    padding: 10px 0;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1.1rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .inspector-tab:hover {
    background: var(--bg-surface-active);
    color: var(--text-primary);
  }

  .inspector-tab.active {
    color: var(--accent-primary);
    border-bottom-color: var(--accent-primary);
    background: var(--surface-soft);
  }

  .pro-sidebar .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
  }
  .divider-text {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 5px 0;
  }
  .interactivity-panel {
    border-color: var(--border-strong);
    background: var(--surface-soft);
  }
  .interactivity-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .interactivity-title {
    font-weight: 600;
    color: var(--accent-primary);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .event-add-btn {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: var(--accent-primary);
    color: var(--text-primary);
  }
  .event-empty-state {
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.85rem;
    padding: 10px;
  }
  .event-card {
    background: var(--surface-elevated);
    padding: 12px;
    border-radius: 12px;
    margin-bottom: 8px;
    border: 1px solid var(--border-subtle);
  }
  .event-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
  }
  .event-row-main {
    flex: 1;
  }
  .event-stack {
    margin-bottom: 8px;
  }
  .event-field-label {
    display: block;
    font-size: 0.7rem;
    color: var(--text-secondary);
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .event-delete-btn {
    margin-top: 18px;
  }
  .event-target-row {
    display: flex;
    gap: 6px;
  }
  .event-target-select {
    flex: 1;
  }
  .event-target-btn {
    min-width: 32px;
    padding: 0 8px;
    flex-shrink: 0;
    background: var(--surface-soft-contrast);
    border: 1px solid var(--border-subtle);
  }
  .template-gallery-overlay {
    z-index: 10005;
  }
  .template-gallery-modal {
    width: 600px;
    max-width: 90vw;
  }
  .template-gallery-header {
    margin-bottom: 20px;
  }
  .template-gallery-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }
  .cropper-modal-overlay {
    z-index: 10002;
  }
  .cropper-modal {
    width: 800px;
    max-width: 95vw;
    height: 80vh;
    display: flex;
    flex-direction: column;
  }
  .cropper-stage {
    flex: 1;
    min-height: 0;
    background: var(--surface-base);
    margin-top: 15px;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cropper-stage-image {
    max-width: 100%;
    max-height: 100%;
    display: block;
  }
  .button-stack {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
  .upload-label-btn {
    margin: 0;
    text-align: center;
    display: flex;
  }
  .map-node-panel {
    border-color: var(--border-strong);
  }
  .map-node-title {
    color: var(--accent-primary);
  }
  .map-empty-state {
    padding: 20px 10px;
  }
  .map-empty-icon {
    font-size: 2rem;
  }
  .map-empty-copy {
    margin-top: 10px;
    font-size: 0.8rem;
  }
  .marker-card {
    padding: 12px;
    border: 1px solid var(--border-subtle);
    margin-bottom: 10px;
    border-radius: 10px;
  }
  .resizable-input {
    resize: vertical;
  }
  .themed-checkbox {
    accent-color: var(--accent-primary);
  }
  .compact-input {
    padding: 4px 8px;
  }
  .metric-value {
    font-size: 0.85rem;
    margin-top: 5px;
    color: var(--text-secondary);
  }
  .empty-panel-icon {
    margin-bottom: 20px;
    font-size: 2rem;
    color: var(--text-secondary);
  }
  .section-subtitle-center {
    border-bottom: none;
    text-align: center;
  }
  .status-card {
    background: var(--surface-soft);
    border-left-color: var(--accent-primary);
  }
  .status-card-row {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }
  .status-card-icon {
    color: var(--accent-primary);
    font-size: 1.2rem;
  }
  .status-card-copy {
    color: var(--text-primary);
  }


  </style>

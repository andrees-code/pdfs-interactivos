<template>
  <div>
    <div class="pro-editor-app">
      <header class="pro-header">
        <div class="header-left">
          <div class="pro-logo">
            <span class="logo-icon">🚀</span>
            <span class="logo-text">Present<span class="text-accent">Pro</span></span>
          </div>
          <div class="file-menu">
            <label class="menu-item" :class="{ 'is-loading': isConverting }">
              <input
                type="file"
                @change="handleFileUpload"
                accept=".pdf, .pptx, .ppsx, .potx"
                hidden
                :disabled="isConverting"
              />
              <i class="ph ph-upload-simple"></i>
              {{ isConverting ? 'Convirtiendo...' : 'Importar Archivo' }}
            </label>
            <button
              class="menu-item btn-export"
              :disabled="!hasDoc || isConverting"
              @click="exportPresentation"
            >
              <i class="ph ph-export"></i> Exportar Web
            </button>
          </div>
        </div>

        <div class="header-center" v-if="hasDoc">
          <div class="zoom-controls">
            <button @click="changeZoom(-0.1)" class="tool-btn" title="Alejar">
              <i class="ph ph-minus"></i>
            </button>
            <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
            <button @click="changeZoom(0.1)" class="tool-btn" title="Acercar">
              <i class="ph ph-plus"></i>
            </button>
            <div class="divider-vertical"></div>
            <button @click="fitToScreen" class="tool-btn" title="Ajustar a pantalla">
              <i class="ph ph-corners-out"></i>
            </button>
          </div>
        </div>

        <div class="header-right" v-if="hasDoc">
          <button class="btn-play" :class="{ 'is-active': playMode }" @click="togglePlayMode">
            <i class="ph" :class="playMode ? 'ph-stop' : 'ph-play'"></i>
            {{ playMode ? 'Detener Presentación' : 'Iniciar Presentación' }}
          </button>
        </div>
      </header>

      <div v-if="isConverting" class="loading-overlay">
        <div class="spinner"></div>
        <h2>Procesando Documento</h2>
        <p>Por favor, espera mientras optimizamos los gráficos.</p>
      </div>

      <div v-if="playMode" class="play-nav-overlay">
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
        <aside class="pro-sidebar left-sidebar" v-if="hasDoc && !playMode">
          <div class="panel-header">
            <span>Diapositivas</span>
            <span class="badge">{{ numPages }}</span>
          </div>
          <div class="tree-view">
            <div v-for="page in numPages" :key="page" class="tree-node">
              <div
                class="tree-node-title"
                :class="{ 'is-active': pageNum === page }"
                @click="changePageTo(page)"
              >
                <div class="slide-name-wrapper">
                  <i class="ph ph-presentation-chart"></i> Diapositiva {{ page }}
                </div>
                <div class="slide-actions">
                  <button
                    class="slide-action-btn"
                    @click.stop="moveSlide(page, 'up')"
                    :disabled="page === 1"
                    title="Subir"
                  >
                    <i class="ph ph-arrow-up"></i>
                  </button>
                  <button
                    class="slide-action-btn"
                    @click.stop="moveSlide(page, 'down')"
                    :disabled="page === numPages"
                    title="Bajar"
                  >
                    <i class="ph ph-arrow-down"></i>
                  </button>
                  <button
                    class="slide-action-btn"
                    @click.stop="duplicateSlide(page)"
                    title="Duplicar"
                  >
                    <i class="ph ph-copy"></i>
                  </button>
                  <button
                    class="slide-action-btn btn-trash"
                    @click.stop="deleteSlide(page)"
                    :disabled="numPages <= 1"
                    title="Eliminar"
                  >
                    <i class="ph ph-trash"></i>
                  </button>
                </div>
              </div>
              <div class="tree-children" v-if="pageNum === page && currentPageElements.length > 0">
                <div
                  v-for="el in currentPageElements"
                  :key="el.id"
                  class="tree-child"
                  :class="{ 'is-selected': selectedElementId === el.id }"
                  @click="selectElement(el.id)"
                >
                  <span class="icon"><i :class="`ph ${getIconClassForType(el.type)}`"></i></span>
                  <span class="child-name">{{ el.name || el.type }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="sidebar-footer">
            <button class="btn-ghost w-100" @click="addNewSlide">
              <i class="ph ph-plus"></i> Nueva Diapositiva
            </button>
          </div>
        </aside>

        <aside class="pro-toolbar" v-if="hasDoc && !playMode">
          <div class="tool-group">
            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'select' }"
              @click="activeTool = 'select'"
              title="Seleccionar (V)"
            >
              <i class="ph ph-cursor"></i>
            </button>
            <div class="tool-divider"></div>

            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'text' }"
              @click="activeTool = 'text'"
              title="Texto"
            >
              <i class="ph ph-text-t"></i>
            </button>
            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'shape' }"
              @click="activeTool = 'shape'"
              title="Forma"
            >
              <i class="ph ph-square"></i>
            </button>
            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'icon' }"
              @click="activeTool = 'icon'"
              title="Icono Vectorial"
            >
              <i class="ph ph-star"></i>
            </button>
            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'draw' }"
              @click="activeTool = 'draw'"
              title="Dibujo Libre"
            >
              <i class="ph ph-pencil-simple"></i>
            </button>

            <div class="tool-divider"></div>

            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'image' }"
              @click="activeTool = 'image'"
              title="Imagen"
            >
              <i class="ph ph-image"></i>
            </button>
            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'video' }"
              @click="activeTool = 'video'"
              title="Vídeo"
            >
              <i class="ph ph-video-camera"></i>
            </button>
            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'audio' }"
              @click="activeTool = 'audio'"
              title="Audio"
            >
              <i class="ph ph-speaker-high"></i>
            </button>

            <div class="tool-divider"></div>

            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'chart' }"
              @click="activeTool = 'chart'"
              title="Gráfico"
            >
              <i class="ph ph-chart-bar"></i>
            </button>
            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'iframe' }"
              @click="activeTool = 'iframe'"
              title="Incrustar Web"
            >
              <i class="ph ph-globe"></i>
            </button>
            <button
              class="tool-btn large"
              :class="{ active: activeTool === '3d' }"
              @click="activeTool = '3d'"
              title="Modelo 3D"
            >
              <i class="ph ph-cube"></i>
            </button>

            <div class="tool-divider"></div>

            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'interactive' }"
              @click="activeTool = 'interactive'"
              title="Punto Interactivo"
            >
              <i class="ph ph-lightning"></i>
            </button>
            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'link' }"
              @click="activeTool = 'link'"
              title="Botón de Enlace"
            >
              <i class="ph ph-link"></i>
            </button>
            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'accordion' }"
              @click="activeTool = 'accordion'"
              title="Acordeón"
            >
              <i class="ph ph-list-dashes"></i>
            </button>
          </div>
        </aside>

        <main class="pro-canvas-area" ref="workspaceRef">
          <div v-if="!hasDoc && !isConverting" class="empty-workspace">
            <div class="empty-box">
              <div class="empty-icon-wrapper"><i class="ph ph-magic-wand"></i></div>
              <h3>Comienza a crear</h3>
              <p>
                Diseña desde cero o importa un documento existente para añadirle interactividad.
              </p>
              <div class="button-group mt-4">
                <button class="btn-primary large-btn" @click="createBlankProject">
                  <i class="ph ph-file-plus"></i> Proyecto en Blanco
                </button>
                <div class="divider-text">o</div>
                <label class="btn-secondary large-btn">
                  <input
                    type="file"
                    @change="handleFileUpload"
                    accept=".pdf, .pptx, .ppsx, .potx"
                    hidden
                  />
                  <i class="ph ph-upload-simple"></i> Subir PDF / PPTX
                </label>
              </div>
            </div>
          </div>

          <div v-show="hasDoc" class="canvas-wrapper" :class="{ 'play-mode-active': playMode }">
            <div
              class="canvas-shadow-box layer-engine"
              :style="{
                transform: `scale(${zoom})`,
                width: `${baseWidth}px`,
                height: `${baseHeight}px`,
                backgroundColor: currentBgColor,
                backgroundImage: currentBgImage,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }"
              @click.self="handleCanvasClick"
            >
              <canvas ref="pdfCanvas" class="layer-pdf" v-show="docType === 'pdf'"></canvas>

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
                  >No se detectó imagen de fondo en esta diapositiva. Usa el Inspector para asignar
                  una.</small
                >
              </div>

              <div
                v-for="el in currentPageElements"
                :key="el.id"
                class="interactive-element"
                :class="{
                  'is-selected': selectedElementId === el.id && !playMode,
                  'is-clickable': playMode && ['link', 'interactive', 'audio'].includes(el.type),
                  'no-pointer': playMode && el.type === 'draw',
                }"
                :style="{
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  height: el.height === 'auto' ? 'auto' : `${el.height}px`,
                  zIndex: el.zIndex,
                  opacity: el.opacity !== undefined ? el.opacity : 1,
                  transform: `rotate(${el.rotation || 0}deg)`,
                }"
                @mousedown.stop="startDrag($event, el)"
              >
                <div
                  v-if="el.type === 'text'"
                  class="el-text"
                  :style="{
                    color: el.color,
                    fontSize: `${el.fontSize}px`,
                    fontWeight: el.fontWeight,
                    fontFamily: el.fontFamily,
                    fontStyle: el.fontStyle,
                    textAlign: el.textAlign,
                    lineHeight: el.lineHeight || 1.2,
                    letterSpacing: `${el.letterSpacing || 0}px`,
                    textShadow: el.textShadow || 'none',
                    backgroundColor: el.textBgColor || 'transparent',
                    padding: el.textBgColor !== 'transparent' ? '10px' : '0',
                    borderRadius: '4px',
                  }"
                >
                  {{ el.content }}
                </div>

                <div
                  v-else-if="el.type === 'shape'"
                  class="el-shape"
                  :style="{
                    backgroundColor: el.bgColor,
                    borderRadius: `${el.borderRadius}px`,
                    border: `${el.borderWidth}px solid ${el.borderColor}`,
                    boxShadow: el.boxShadow || 'none',
                  }"
                ></div>

                <div
                  v-else-if="el.type === 'icon'"
                  class="el-icon"
                  :style="{
                    color: el.color,
                    fontSize: `${el.fontSize}px`,
                    backgroundColor: el.bgColor || 'transparent',
                    borderRadius: `${el.borderRadius || 0}px`,
                  }"
                >
                  <i :class="`ph ph-${el.iconName}`"></i>
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
                    <i class="ph ph-arrows-out-cardinal"></i> Mover
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
                  v-else-if="el.type === 'chart'"
                  class="el-chart-wrapper"
                  :style="{
                    backgroundColor: el.bgColor,
                    borderRadius: `${el.borderRadius || 8}px`,
                    border: `${el.borderWidth || 0}px solid ${el.borderColor || '#000'}`,
                    padding: '15px',
                  }"
                >
                  <div
                    class="chart-title"
                    :style="{
                      color: el.color,
                      fontSize: `${el.fontSize || 14}px`,
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
                            height: `${Math.min(100, (item.value / getChartMax(el.chartData)) * 100)}%`,
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
                              width: `${Math.min(100, (item.value / getChartMax(el.chartData)) * 100)}%`,
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
                      <div class="pie-circle" :style="{ background: getPieGradient(el.chartData) }">
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
                          <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
                          <span :style="{ color: el.color }"
                            >{{ item.label }}
                            <span v-if="el.showValues">({{ item.value }})</span></span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-else-if="el.type === 'image'"
                  class="el-image-container"
                  :style="{
                    borderRadius: `${el.borderRadius || 0}px`,
                    border: `${el.borderWidth || 0}px solid ${el.borderColor || '#000'}`,
                    filter: `grayscale(${el.grayscale || 0}%) blur(${el.blur || 0}px) sepia(${el.sepia || 0}%)`,
                    overflow: 'hidden',
                  }"
                >
                  <img
                    v-if="el.src"
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
                  v-else-if="el.type === 'video'"
                  class="el-video-container"
                  :style="{
                    borderRadius: `${el.borderRadius || 0}px`,
                    border: `${el.borderWidth || 0}px solid ${el.borderColor || '#000'}`,
                    overflow: 'hidden',
                  }"
                >
                  <template v-if="el.src">
                    <iframe
                      v-if="isYouTube(el.src)"
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
                    borderRadius: `${el.borderRadius || 0}px`,
                    border: `${el.borderWidth || 0}px solid ${el.borderColor || '#000'}`,
                    overflow: 'hidden',
                    width: '100%',
                    height: '100%',
                  }"
                >
                  <iframe
                    v-if="el.src"
                    :src="el.src"
                    width="100%"
                    height="100%"
                    frameborder="0"
                    :style="{ pointerEvents: playMode ? 'auto' : 'none' }"
                  ></iframe>
                  <div v-else class="placeholder-box">
                    <i class="ph ph-globe" style="font-size: 2rem"></i>
                  </div>
                  <div v-if="!playMode" class="drag-protector"></div>
                </div>

                <div
                  v-else-if="el.type === 'audio'"
                  class="el-audio-btn"
                  @click.stop="playAudio(el)"
                >
                  <div
                    class="audio-visual"
                    :class="{ 'is-playing': el.isPlaying }"
                    :style="{
                      backgroundColor: el.bgColor,
                      color: el.color,
                      borderRadius: `${el.borderRadius}px`,
                    }"
                  >
                    <i class="ph" :class="el.isPlaying ? 'ph-pause' : 'ph-speaker-high'"></i>
                  </div>
                  <audio
                    v-if="el.src"
                    :ref="'audio_' + el.id"
                    :src="el.src"
                    :loop="el.loop"
                    :autoplay="playMode && el.autoplay"
                  ></audio>
                </div>

                <div v-else-if="el.type === '3d'" class="el-3d">
                  <model-viewer
                    v-if="el.src"
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
                  @click.stop="triggerInteraction(el)"
                >
                  <div
                    class="hotspot-pulse"
                    :style="{ backgroundColor: el.color, boxShadow: `0 0 15px ${el.color}` }"
                  ></div>
                  <div
                    v-if="playMode && el.isOpen"
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
                    borderRadius: `${el.borderRadius}px`,
                    border: `${el.borderWidth || 0}px solid ${el.borderColor || '#000'}`,
                    fontSize: `${el.fontSize || 16}px`,
                    fontWeight: el.fontWeight || 'bold',
                    fontFamily: el.fontFamily || 'Arial',
                  }"
                  @click.stop="playMode ? changePageTo(el.targetPage) : null"
                >
                  {{ el.text }}
                </div>

                <div
                  v-else-if="el.type === 'accordion'"
                  class="el-accordion"
                  :style="{ backgroundColor: el.bgColor, color: el.color }"
                >
                  <div
                    v-for="(item, idx) in el.items"
                    :key="idx"
                    class="accordion-item"
                    :style="{ borderBottomColor: el.color }"
                  >
                    <div
                      class="accordion-header"
                      @click.stop="playMode ? (item.isOpen = !item.isOpen) : null"
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
                    selectedElementId === el.id &&
                    !playMode &&
                    !['interactive', 'audio'].includes(el.type)
                  "
                  class="resize-handle"
                  @mousedown.stop="startResize($event, el)"
                ></div>
              </div>
            </div>
          </div>
        </main>

        <aside class="pro-sidebar right-sidebar" v-if="hasDoc && !playMode">
          <div class="panel-header">Propiedades</div>

          <div class="panel-content" v-if="selectedElement">
            <div class="element-header">
              <div class="badge-type">
                <i :class="`ph ${getIconClassForType(selectedElement.type)}`"></i>
                {{ selectedElement.type.toUpperCase() }}
              </div>
              <button class="btn-icon-danger" @click="deleteSelected" title="Eliminar Elemento">
                <i class="ph ph-trash"></i>
              </button>
            </div>

            <div
              class="prop-section"
              v-if="!['audio', 'interactive'].includes(selectedElement.type)"
            >
              <div class="section-title">Geometría y Posición</div>
              <div class="prop-row">
                <div class="prop-group half">
                  <label>X (px)</label>
                  <input type="number" v-model="selectedElement.x" class="pro-input" />
                </div>
                <div class="prop-group half">
                  <label>Y (px)</label>
                  <input type="number" v-model="selectedElement.y" class="pro-input" />
                </div>
              </div>
              <div class="prop-row">
                <div class="prop-group half">
                  <label>Ancho (W)</label>
                  <input type="number" v-model="selectedElement.width" class="pro-input" />
                </div>
                <div class="prop-group half">
                  <label>Alto (H)</label>
                  <input
                    type="number"
                    v-model="selectedElement.height"
                    class="pro-input"
                    :disabled="['text', 'accordion'].includes(selectedElement.type)"
                  />
                </div>
              </div>
              <div class="prop-group">
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

            <div class="prop-section">
              <div class="section-title">Capa y Apariencia</div>
              <div class="prop-row">
                <div class="prop-group half">
                  <label>Z-Index</label>
                  <input type="number" v-model="selectedElement.zIndex" class="pro-input" />
                </div>
                <div
                  class="prop-group half"
                  v-if="!['interactive', '3d', 'audio'].includes(selectedElement.type)"
                >
                  <label>Opacidad</label>
                  <input
                    type="number"
                    v-model="selectedElement.opacity"
                    min="0"
                    max="1"
                    step="0.1"
                    class="pro-input"
                  />
                </div>
              </div>
            </div>

            <template v-if="selectedElement.type === 'text'">
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
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="'Courier New', monospace">Courier New</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="'Verdana', sans-serif">Verdana</option>
                    <option value="'Trebuchet MS', sans-serif">Trebuchet</option>
                    <option value="'Comic Sans MS', sans-serif">Comic Sans</option>
                  </select>
                </div>
                <div class="prop-row">
                  <div class="prop-group half">
                    <label>Tamaño</label>
                    <input type="number" v-model="selectedElement.fontSize" class="pro-input" />
                  </div>
                  <div class="prop-group half">
                    <label>Color Text</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.color"
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
                    <label>Interlineado</label>
                    <input
                      type="number"
                      v-model="selectedElement.lineHeight"
                      step="0.1"
                      class="pro-input"
                    />
                  </div>
                  <div class="prop-group half">
                    <label>Espaciado (px)</label>
                    <input
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
                <div class="prop-group">
                  <label>Fondo de Caja (Opcional)</label>
                  <div class="color-picker-wrapper">
                    <input
                      type="color"
                      v-model="selectedElement.textBgColor"
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
                <div class="prop-group">
                  <label>Sombra CSS (ej: 2px 2px 4px #000)</label>
                  <input
                    type="text"
                    v-model="selectedElement.textShadow"
                    class="pro-input"
                    placeholder="none"
                  />
                </div>
              </div>
            </template>

            <template v-if="selectedElement.type === 'shape'">
              <div class="prop-section">
                <div class="section-title">Estilo de Forma</div>
                <div class="prop-group">
                  <label>Color de Fondo</label>
                  <div class="color-picker-wrapper">
                    <input
                      type="color"
                      v-model="selectedElement.bgColor"
                      class="pro-color-picker"
                    />
                  </div>
                </div>
                <div class="prop-row">
                  <div class="prop-group half">
                    <label>Radio Esquinas</label>
                    <input type="number" v-model="selectedElement.borderRadius" class="pro-input" />
                  </div>
                  <div class="prop-group half">
                    <label>Grosor Borde</label>
                    <input type="number" v-model="selectedElement.borderWidth" class="pro-input" />
                  </div>
                </div>
                <div class="prop-group" v-if="selectedElement.borderWidth > 0">
                  <label>Color del Borde</label>
                  <div class="color-picker-wrapper">
                    <input
                      type="color"
                      v-model="selectedElement.borderColor"
                      class="pro-color-picker"
                    />
                  </div>
                </div>
                <div class="prop-group mt-2">
                  <label>Sombra CSS (Box Shadow)</label>
                  <input
                    type="text"
                    v-model="selectedElement.boxShadow"
                    class="pro-input"
                    placeholder="ej: 0 4px 10px rgba(0,0,0,0.5)"
                  />
                </div>
              </div>
            </template>

            <template v-if="selectedElement.type === 'icon'">
              <div class="prop-section">
                <div class="section-title">Icono Vectorial</div>
                <div class="prop-group">
                  <label>Nombre (Phosphor Icons)</label>
                  <input
                    type="text"
                    v-model="selectedElement.iconName"
                    class="pro-input"
                    placeholder="ej: heart, star, user"
                  />
                  <a
                    href="https://phosphoricons.com/"
                    target="_blank"
                    class="help-link mt-1"
                    style="display: block; font-size: 10px; color: #58a6ff"
                    >Ver catálogo de iconos ↗</a
                  >
                </div>
                <div class="prop-row mt-2">
                  <div class="prop-group half">
                    <label>Tamaño</label>
                    <input type="number" v-model="selectedElement.fontSize" class="pro-input" />
                  </div>
                  <div class="prop-group half">
                    <label>Color</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.color"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                </div>
                <div class="prop-row">
                  <div class="prop-group half">
                    <label>Fondo Caja</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.bgColor"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                  <div class="prop-group half">
                    <label>Redondeo Caja</label>
                    <input type="number" v-model="selectedElement.borderRadius" class="pro-input" />
                  </div>
                </div>
              </div>
            </template>

            <template v-if="selectedElement.type === 'image'">
              <div class="prop-section">
                <div class="section-title">Fuente de Imagen</div>
                <div class="prop-group">
                  <label class="btn-ghost w-100 text-center block">
                    <input
                      type="file"
                      @change="handleLocalMediaUpload($event, selectedElement)"
                      accept="image/*"
                      hidden
                    />
                    <i class="ph ph-upload-simple"></i> Subir Archivo Local
                  </label>
                </div>
                <div class="prop-group">
                  <label>O Enlace Externo (URL)</label>
                  <input
                    type="text"
                    v-model="selectedElement.src"
                    class="pro-input"
                    placeholder="https://..."
                  />
                </div>
                <div class="prop-group">
                  <label>Ajuste de Recorte</label>
                  <select v-model="selectedElement.fit" class="pro-input">
                    <option value="contain">Contener (Ver entero)</option>
                    <option value="cover">Cubrir (Recortar)</option>
                    <option value="fill">Rellenar (Deformar)</option>
                  </select>
                </div>
              </div>
              <div class="prop-section">
                <div class="section-title">Bordes y Filtros</div>
                <div class="prop-row">
                  <div class="prop-group half">
                    <label>Radio</label>
                    <input type="number" v-model="selectedElement.borderRadius" class="pro-input" />
                  </div>
                  <div class="prop-group half">
                    <label>Borde Px</label>
                    <input type="number" v-model="selectedElement.borderWidth" class="pro-input" />
                  </div>
                </div>
                <div class="prop-group" v-if="selectedElement.borderWidth > 0">
                  <label>Color Borde</label>
                  <div class="color-picker-wrapper">
                    <input
                      type="color"
                      v-model="selectedElement.borderColor"
                      class="pro-color-picker"
                    />
                  </div>
                </div>
                <div class="prop-group">
                  <label>Blanco y Negro (%)</label>
                  <input
                    type="range"
                    v-model="selectedElement.grayscale"
                    min="0"
                    max="100"
                    class="w-100"
                  />
                </div>
                <div class="prop-group">
                  <label>Desenfoque (px)</label>
                  <input
                    type="range"
                    v-model="selectedElement.blur"
                    min="0"
                    max="20"
                    class="w-100"
                  />
                </div>
                <div class="prop-group">
                  <label>Sepia (%)</label>
                  <input
                    type="range"
                    v-model="selectedElement.sepia"
                    min="0"
                    max="100"
                    class="w-100"
                  />
                </div>
              </div>
            </template>

            <template v-if="selectedElement.type === 'video'">
              <div class="prop-section">
                <div class="section-title">Fuente de Video</div>
                <div class="prop-group">
                  <label class="btn-ghost w-100 text-center block">
                    <input
                      type="file"
                      @change="handleLocalMediaUpload($event, selectedElement)"
                      accept="video/mp4,video/webm"
                      hidden
                    />
                    <i class="ph ph-upload-simple"></i> Subir Video Local
                  </label>
                </div>
                <div class="prop-group">
                  <label>O Enlace Externo (Soporta YouTube)</label>
                  <input
                    type="text"
                    v-model="selectedElement.src"
                    class="pro-input"
                    placeholder="https://..."
                  />
                </div>
                <div class="prop-group">
                  <label>Ajuste</label>
                  <select v-model="selectedElement.fit" class="pro-input">
                    <option value="contain">Contener</option>
                    <option value="cover">Cubrir</option>
                    <option value="fill">Rellenar</option>
                  </select>
                </div>
              </div>
              <div class="prop-section">
                <div class="section-title">Bordes</div>
                <div class="prop-row">
                  <div class="prop-group half">
                    <label>Radio</label>
                    <input type="number" v-model="selectedElement.borderRadius" class="pro-input" />
                  </div>
                  <div class="prop-group half">
                    <label>Borde Px</label>
                    <input type="number" v-model="selectedElement.borderWidth" class="pro-input" />
                  </div>
                </div>
                <div class="prop-group" v-if="selectedElement.borderWidth > 0">
                  <label>Color Borde</label>
                  <div class="color-picker-wrapper">
                    <input
                      type="color"
                      v-model="selectedElement.borderColor"
                      class="pro-color-picker"
                    />
                  </div>
                </div>
              </div>
              <div class="prop-section" v-if="!isYouTube(selectedElement.src)">
                <div class="section-title">Reproducción</div>
                <label class="checkbox-label"
                  ><input type="checkbox" v-model="selectedElement.autoplay" />
                  Auto-reproducir</label
                >
                <label class="checkbox-label mt-2"
                  ><input type="checkbox" v-model="selectedElement.loop" /> Bucle</label
                >
                <label class="checkbox-label mt-2"
                  ><input type="checkbox" v-model="selectedElement.muted" /> Silenciado
                  (Muted)</label
                >
              </div>
            </template>

            <template v-if="selectedElement.type === 'draw'">
              <div class="prop-section">
                <div class="section-title">Rotulador</div>
                <div class="prop-row">
                  <div class="prop-group half">
                    <label>Grosor (px)</label>
                    <input
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
                        v-model="selectedElement.brushColor"
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

            <template v-if="selectedElement.type === 'chart'">
              <div class="prop-section">
                <div class="section-title">Estilo del Gráfico</div>
                <div class="prop-group">
                  <label>Título Superior</label>
                  <input type="text" v-model="selectedElement.chartTitle" class="pro-input" />
                </div>
                <div class="prop-row">
                  <div class="prop-group half">
                    <label>Fondo Contenedor</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.bgColor"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                  <div class="prop-group half">
                    <label>Color Textos</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.color"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                </div>
                <div class="prop-row">
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
                    <label>Radio Cajas</label>
                    <input type="number" v-model="selectedElement.borderRadius" class="pro-input" />
                  </div>
                </div>
                <div class="prop-row mt-2">
                  <label class="checkbox-label half"
                    ><input type="checkbox" v-model="selectedElement.showValues" /> Valores</label
                  >
                  <label class="checkbox-label half"
                    ><input type="checkbox" v-model="selectedElement.showLegend" /> Leyenda</label
                  >
                </div>
              </div>
              <div class="prop-section">
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
                        v-model="item.color"
                        class="pro-color-picker half"
                        style="height: 28px"
                      />
                    </div>
                  </div>
                </div>
                <button
                  class="btn-ghost w-100 mt-2"
                  @click="
                    selectedElement.chartData.push({ label: 'Nuevo', value: 50, color: '#58a6ff' })
                  "
                >
                  <i class="ph ph-plus"></i> Añadir Fila
                </button>
              </div>
            </template>

            <template v-if="selectedElement.type === 'audio'">
              <div class="prop-section">
                <div class="section-title">Botón de Audio</div>
                <div class="prop-group file-upload-group">
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
                  <label>O URL Externa</label>
                  <input
                    type="text"
                    v-model="selectedElement.src"
                    class="pro-input"
                    placeholder="https://..."
                  />
                </div>
                <div class="prop-row mt-4">
                  <div class="prop-group half">
                    <label>Color Botón</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.bgColor"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                  <div class="prop-group half">
                    <label>Color Icono</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.color"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                </div>
                <div class="prop-group">
                  <label>Redondeo (0 = Cuadrado, 50 = Círculo)</label>
                  <input type="number" v-model="selectedElement.borderRadius" class="pro-input" />
                </div>
                <label class="checkbox-label mt-2"
                  ><input type="checkbox" v-model="selectedElement.loop" /> Bucle (Loop)</label
                >
                <label class="checkbox-label mt-2"
                  ><input type="checkbox" v-model="selectedElement.autoplay" /> Autoplay en
                  Presentación</label
                >
              </div>
            </template>

            <template v-if="selectedElement.type === 'iframe'">
              <div class="prop-section">
                <div class="section-title">Incrustación Web</div>
                <div class="prop-group">
                  <label>URL / Enlace (src)</label>
                  <input
                    type="text"
                    v-model="selectedElement.src"
                    class="pro-input"
                    placeholder="https://..."
                  />
                </div>
                <div class="prop-row mt-4">
                  <div class="prop-group half">
                    <label>Redondeo</label>
                    <input type="number" v-model="selectedElement.borderRadius" class="pro-input" />
                  </div>
                  <div class="prop-group half">
                    <label>Borde Px</label>
                    <input type="number" v-model="selectedElement.borderWidth" class="pro-input" />
                  </div>
                </div>
                <div class="prop-group" v-if="selectedElement.borderWidth > 0">
                  <label>Color Borde</label>
                  <div class="color-picker-wrapper">
                    <input
                      type="color"
                      v-model="selectedElement.borderColor"
                      class="pro-color-picker"
                    />
                  </div>
                </div>
              </div>
            </template>

            <template v-if="selectedElement.type === '3d'">
              <div class="prop-section">
                <div class="section-title">Modelo 3D (.glb, .gltf)</div>
                <div class="prop-group file-upload-group">
                  <label class="btn-ghost w-100 text-center block">
                    <input
                      type="file"
                      @change="handleLocalMediaUpload($event, selectedElement)"
                      accept=".glb,.gltf"
                      hidden
                    />
                    <i class="ph ph-upload-simple"></i> Subir Archivo Local
                  </label>
                </div>
                <div class="prop-group mt-2">
                  <label>O Enlace Externo (URL)</label>
                  <input
                    type="text"
                    v-model="selectedElement.src"
                    class="pro-input"
                    placeholder="https://..."
                  />
                </div>
                <div class="prop-group mt-2">
                  <label>Imagen Entorno (HDR/URL)</label>
                  <input
                    type="text"
                    v-model="selectedElement.envImage"
                    class="pro-input"
                    placeholder="Para reflejos reales"
                  />
                </div>
                <label class="checkbox-label mt-2"
                  ><input type="checkbox" v-model="selectedElement.autoRotate" /> Auto-rotar</label
                >
                <label class="checkbox-label mt-2"
                  ><input type="checkbox" v-model="selectedElement.cameraControls" /> Controles de
                  cámara</label
                >
              </div>
            </template>

            <template v-if="selectedElement.type === 'interactive'">
              <div class="prop-section">
                <div class="section-title">Hotspot (Punto Interactivo)</div>
                <div class="prop-group">
                  <label>Color del Pulso</label>
                  <div class="color-picker-wrapper">
                    <input type="color" v-model="selectedElement.color" class="pro-color-picker" />
                  </div>
                </div>
                <div class="prop-group section-divider">Ventana Desplegable</div>
                <div class="prop-row">
                  <div class="prop-group half">
                    <label>Fondo Ventana</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.modalBgColor"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                  <div class="prop-group half">
                    <label>Texto Ventana</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.modalTextColor"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                </div>
                <div class="prop-group">
                  <label>Título Principal</label>
                  <input type="text" v-model="selectedElement.modalTitle" class="pro-input" />
                </div>
                <div class="prop-group">
                  <label>Contenido (Acepta HTML)</label>
                  <textarea
                    v-model="selectedElement.contentHtml"
                    class="pro-input"
                    rows="5"
                  ></textarea>
                </div>
              </div>
            </template>

            <template v-if="selectedElement.type === 'link'">
              <div class="prop-section">
                <div class="section-title">Botón de Navegación</div>
                <div class="prop-group">
                  <label>Texto del Botón</label>
                  <input type="text" v-model="selectedElement.text" class="pro-input" />
                </div>
                <div class="prop-group">
                  <label>Saltar a Diapositiva (1 - {{ numPages }})</label>
                  <input
                    type="number"
                    v-model="selectedElement.targetPage"
                    min="1"
                    :max="numPages"
                    class="pro-input"
                  />
                </div>

                <div class="prop-row mt-4">
                  <div class="prop-group half">
                    <label>Color Fondo</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.bgColor"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                  <div class="prop-group half">
                    <label>Color Texto</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.color"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                </div>
                <div class="prop-row">
                  <div class="prop-group half">
                    <label>Redondeo</label>
                    <input type="number" v-model="selectedElement.borderRadius" class="pro-input" />
                  </div>
                  <div class="prop-group half">
                    <label>Borde Px</label>
                    <input type="number" v-model="selectedElement.borderWidth" class="pro-input" />
                  </div>
                </div>
                <div class="prop-group" v-if="selectedElement.borderWidth > 0">
                  <label>Color Borde</label>
                  <div class="color-picker-wrapper">
                    <input
                      type="color"
                      v-model="selectedElement.borderColor"
                      class="pro-color-picker"
                    />
                  </div>
                </div>

                <div class="prop-row mt-2">
                  <div class="prop-group half">
                    <label>Fuente Text</label>
                    <select
                      v-model="selectedElement.fontFamily"
                      class="pro-input"
                      style="padding: 4px"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                  </div>
                  <div class="prop-group half">
                    <label>Tamaño</label>
                    <input type="number" v-model="selectedElement.fontSize" class="pro-input" />
                  </div>
                </div>
              </div>
            </template>

            <template v-if="selectedElement.type === 'accordion'">
              <div class="prop-section">
                <div class="section-title">Acordeón Desplegable</div>
                <div class="prop-row">
                  <div class="prop-group half">
                    <label>Color Base</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.bgColor"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                  <div class="prop-group half">
                    <label>Color Textos</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.color"
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
                  style="
                    background: rgba(255, 255, 255, 0.05);
                    padding: 10px;
                    border-radius: 6px;
                    margin-bottom: 10px;
                    border: 1px solid #30363d;
                  "
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
                    placeholder="Contenido profundo..."
                  ></textarea>
                  <button
                    class="btn-text-danger mt-1"
                    @click="selectedElement.items.splice(index, 1)"
                  >
                    <i class="ph ph-x"></i> Eliminar Sección
                  </button>
                </div>
                <button class="btn-ghost w-100 mt-2" @click="addAccordionSection">
                  <i class="ph ph-plus"></i> Añadir Sección
                </button>
              </div>
            </template>
          </div>

          <div class="panel-content empty-state" v-else>
            <div
              class="empty-icon-wrapper"
              style="margin-bottom: 20px; font-size: 2rem; color: #8b949e"
            >
              <i class="ph ph-monitor"></i>
            </div>
            <p class="section-subtitle" style="border-bottom: none; text-align: center">
              Diapositiva {{ pageNum }}
            </p>

            <div class="prop-section text-left mt-4">
              <div class="section-title">Fondo Base</div>
              <div class="prop-group mt-2">
                <label>Color Sólido</label>
                <div class="color-picker-wrapper">
                  <input
                    type="color"
                    v-model="slideConfigs[pageNum].bgColor"
                    @input="renderPage(pageNum)"
                    class="pro-color-picker"
                  />
                  <span class="color-hex">{{ slideConfigs[pageNum].bgColor.toUpperCase() }}</span>
                </div>
              </div>
              <div class="prop-group mt-4">
                <label>Imagen de Fondo</label>
                <label class="btn-ghost w-100 text-center block">
                  <input type="file" @change="setSlideBackgroundImage" accept="image/*" hidden />
                  <i class="ph ph-image"></i>
                  {{ slideConfigs[pageNum].bgImage ? 'Cambiar Imagen' : 'Subir Imagen' }}
                </label>
                <button
                  v-if="slideConfigs[pageNum].bgImage"
                  class="btn-text-danger w-100 mt-2"
                  @click="removeBackgroundImage"
                >
                  Eliminar imagen actual
                </button>
              </div>
            </div>

            <div
              class="info-box mt-4 text-left"
              style="background: rgba(46, 160, 67, 0.1); border-left-color: #2ea043"
              v-if="docType === 'pptx'"
            >
              <span style="display: flex; gap: 8px; align-items: flex-start">
                <i class="ph ph-check-circle" style="color: #2ea043; font-size: 1.2rem"></i>
                <small style="color: #c9d1d9"
                  >PPTX convertido a alta calidad mediante API externa. Todo el contenido es
                  nativo.</small
                >
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw, onMounted, onUnmounted, nextTick } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString()

// --- ESTADO GENERAL ---
const pdfCanvas = ref<HTMLCanvasElement | null>(null)
const workspaceRef = ref<HTMLElement | null>(null)

let _RAW_PDF_DOC: any = null
let _PDF_BASE64_STORE: string = ''

const docType = ref<'pdf' | 'blank'>('blank')
const hasDoc = ref(false)
const playMode = ref(false)
const pageNum = ref(1)
const numPages = ref(0)
const zoom = ref(1.0)
const isConverting = ref(false)

type ToolType =
  | 'select'
  | 'text'
  | '3d'
  | 'interactive'
  | 'image'
  | 'video'
  | 'shape'
  | 'link'
  | 'accordion'
  | 'icon'
  | 'draw'
  | 'chart'
  | 'iframe'
  | 'audio'
const activeTool = ref<ToolType>('select')
const baseWidth = ref(1280)
const baseHeight = ref(720)

// ESTADOS DE DIAPOSITIVAS Y NUEVO MAPA DE PÁGINAS PDF
const documentState = ref<Record<number, any[]>>({})
const slideConfigs = ref<Record<number, { bgColor: string; bgImage: string | null }>>({})
const pdfPageMap = ref<Record<number, number>>({}) // MAPEA diapositiva_virtual -> página_pdf_real
const selectedElementId = ref<string | null>(null)

const currentPageElements = computed(() => documentState.value[pageNum.value] || [])
const selectedElement = computed(() =>
  selectedElementId.value
    ? currentPageElements.value.find((el) => el.id === selectedElementId.value)
    : null,
)
const currentBgColor = computed(() => slideConfigs.value[pageNum.value]?.bgColor || '#ffffff')
const currentBgImage = computed(() =>
  slideConfigs.value[pageNum.value]?.bgImage
    ? `url(${slideConfigs.value[pageNum.value].bgImage})`
    : 'none',
)

// --- LIFECYCLE E INTERACCIÓN ---
onMounted(() => {
  if (!customElements.get('model-viewer')) {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js'
    document.head.appendChild(script)
  }
  if (!document.getElementById('phosphor-icons')) {
    const link = document.createElement('link')
    link.id = 'phosphor-icons'
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/@phosphor-icons/web/src/regular/style.css'
    document.head.appendChild(link)
  }
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => document.removeEventListener('keydown', handleGlobalKeydown))

const handleGlobalKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && playMode.value) togglePlayMode()
  if (playMode.value) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault()
      changePageTo(pageNum.value + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      changePageTo(pageNum.value - 1)
    }
  }
}

// --- UTILS ---
const isYouTube = (url: string) =>
  url &&
  url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
  )
  return match && match[1] ? `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0` : ''
}

const getIconForType = (type: string) => {
  const icons: any = {
    text: 'T',
    shape: '🟥',
    image: '🖼️',
    video: '🎥',
    '3d': '🧊',
    interactive: '⚡',
    link: '🔗',
    accordion: '📑',
    icon: '🎨',
    draw: '✏️',
    chart: '📊',
    iframe: '🌐',
    audio: '🎵',
  }
  return icons[type] || '📄'
}
const getIconClassForType = (type: string) => {
  const icons: any = {
    text: 'ph-text-t',
    shape: 'ph-square',
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
    audio: 'ph-speaker-high',
  }
  return icons[type] || 'ph-file'
}

const initializeConfigs = () => {
  for (let i = 1; i <= numPages.value; i++) {
    if (!documentState.value[i]) documentState.value[i] = []
    if (!slideConfigs.value[i]) slideConfigs.value[i] = { bgColor: '#ffffff', bgImage: null }
    if (pdfPageMap.value[i] === undefined) pdfPageMap.value[i] = i // Guardamos que la diapositiva 1 tiene el pdf de la página 1.
  }
}

const getChartValues = (data: any[]) => {
  if (!data || !data.length) return [10, 50, 30]
  return data.map((d) => parseFloat(d.value) || 0)
}
const getChartMax = (data: any[]) => {
  const vals = getChartValues(data)
  const max = Math.max(...vals)
  return max > 0 ? max : 1
}
const getPieGradient = (data: any[]) => {
  if (!data || !data.length) return 'transparent'
  const total = data.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0) || 1
  let currentAngle = 0
  const stops = data.map((d) => {
    const pct = ((parseFloat(d.value) || 0) / total) * 100
    const stop = `${d.color} ${currentAngle}% ${currentAngle + pct}%`
    currentAngle += pct
    return stop
  })
  return `conic-gradient(${stops.join(', ')})`
}

// --- ARCHIVOS Y API CONVERT ---
const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  if (fileExtension === 'pdf') await processPdfFile(file)
  else if (['pptx', 'ppsx', 'potx'].includes(fileExtension || ''))
    await convertPptxToPdfViaAPI(file)
}

const processPdfFile = async (file: File | Blob) => {
  docType.value = 'pdf'
  const reader = new FileReader()
  reader.onload = async (e) => {
    const dataUrl = e.target?.result as string
    _PDF_BASE64_STORE = dataUrl.split(',')[1]
    const bytes = new Uint8Array(await file.arrayBuffer())
    const loadingTask = pdfjsLib.getDocument({ data: bytes })
    _RAW_PDF_DOC = markRaw(await loadingTask.promise)
    numPages.value = _RAW_PDF_DOC.numPages
    hasDoc.value = true
    documentState.value = {}
    slideConfigs.value = {}
    pdfPageMap.value = {}
    initializeConfigs()
    await renderPage(1)
    setTimeout(fitToScreen, 100)
  }
  reader.readAsDataURL(file)
}

const convertPptxToPdfViaAPI = async (file: File) => {
  isConverting.value = true
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = async () => {
    try {
      const base64Data = (reader.result as string).split(',')[1]
      const CONVERT_API_SECRET = 'DxcAISlmv67N1pyEtVKUVPh1Y56Y20FQ'
      const response = await fetch(
        `https://v2.convertapi.com/convert/pptx/to/pdf?Secret=${CONVERT_API_SECRET}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Parameters: [{ Name: 'File', FileValue: { Name: file.name, Data: base64Data } }],
          }),
        },
      )
      if (!response.ok) throw new Error('Fallo API')
      const result = await response.json()
      const pdfBase64 = result.Files[0].FileData
      const byteCharacters = atob(pdfBase64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i)
      await processPdfFile(new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' }))
    } catch (error) {
      alert('Error al convertir el PowerPoint. Verifica tu API Key.')
    } finally {
      isConverting.value = false
    }
  }
}

const renderPage = async (num: number) => {
  await nextTick()
  if (!pdfCanvas.value) return
  const canvas = pdfCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 2

  const actualPdfPage = pdfPageMap.value[num]

  if (
    docType.value === 'pdf' &&
    _RAW_PDF_DOC &&
    actualPdfPage &&
    actualPdfPage > 0 &&
    actualPdfPage <= _RAW_PDF_DOC.numPages
  ) {
    const page = await _RAW_PDF_DOC.getPage(actualPdfPage)
    const viewport = page.getViewport({ scale: 1.0 })
    baseWidth.value = viewport.width
    baseHeight.value = viewport.height
    canvas.width = viewport.width * dpr
    canvas.height = viewport.height * dpr
    canvas.style.width = `${viewport.width}px`
    canvas.style.height = `${viewport.height}px`
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvasContext: ctx, viewport }).promise
  } else {
    // Para proyectos en blanco o diapositivas agregadas manualmente, simplemente limpiamos
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

const createBlankProject = () => {
  _RAW_PDF_DOC = null
  _PDF_BASE64_STORE = ''
  docType.value = 'blank'
  numPages.value = 1
  pageNum.value = 1
  baseWidth.value = 1280
  baseHeight.value = 720
  documentState.value = {}
  slideConfigs.value = {}
  pdfPageMap.value = {}
  initializeConfigs()
  hasDoc.value = true
  renderPage(1)
  setTimeout(fitToScreen, 100)
}

// --- GESTIÓN DE PÁGINAS ---
const deleteSlide = (page: number) => {
  if (numPages.value <= 1) {
    alert('No puedes eliminar la única diapositiva del proyecto.')
    return
  }
  if (confirm(`¿Estás seguro de eliminar la Diapositiva ${page}?`)) {
    for (let i = page; i < numPages.value; i++) {
      documentState.value[i] = documentState.value[i + 1] || []
      slideConfigs.value[i] = slideConfigs.value[i + 1] || { bgColor: '#ffffff', bgImage: null }
      pdfPageMap.value[i] = pdfPageMap.value[i + 1] || 0
    }
    delete documentState.value[numPages.value]
    delete slideConfigs.value[numPages.value]
    delete pdfPageMap.value[numPages.value]
    numPages.value -= 1

    if (pageNum.value > numPages.value) changePageTo(numPages.value)
    else renderPage(pageNum.value)
  }
}

const duplicateSlide = (page: number) => {
  for (let i = numPages.value; i >= page + 1; i--) {
    documentState.value[i + 1] = documentState.value[i]
    slideConfigs.value[i + 1] = slideConfigs.value[i]
    pdfPageMap.value[i + 1] = pdfPageMap.value[i]
  }

  const clonedElements = (documentState.value[page] || []).map((el) => ({
    ...el,
    id: `el_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  }))
  const clonedConfig = { ...slideConfigs.value[page] }

  documentState.value[page + 1] = clonedElements
  slideConfigs.value[page + 1] = clonedConfig
  pdfPageMap.value[page + 1] = pdfPageMap.value[page]

  numPages.value += 1
  changePageTo(page + 1)
}

const swapSlides = (p1: number, p2: number) => {
  const tempState = documentState.value[p1]
  const tempConfig = slideConfigs.value[p1]
  const tempMap = pdfPageMap.value[p1]

  documentState.value[p1] = documentState.value[p2]
  slideConfigs.value[p1] = slideConfigs.value[p2]
  pdfPageMap.value[p1] = pdfPageMap.value[p2]

  documentState.value[p2] = tempState
  slideConfigs.value[p2] = tempConfig
  pdfPageMap.value[p2] = tempMap
}

const moveSlide = (page: number, direction: 'up' | 'down') => {
  if (direction === 'up' && page > 1) {
    swapSlides(page, page - 1)
    if (pageNum.value === page) changePageTo(page - 1)
    else if (pageNum.value === page - 1) changePageTo(page)
    else renderPage(pageNum.value)
  } else if (direction === 'down' && page < numPages.value) {
    swapSlides(page, page + 1)
    if (pageNum.value === page) changePageTo(page + 1)
    else if (pageNum.value === page + 1) changePageTo(page)
    else renderPage(pageNum.value)
  }
}

const addNewSlide = () => {
  numPages.value += 1
  if (!documentState.value[numPages.value]) {
    documentState.value[numPages.value] = []
  }
  if (!slideConfigs.value[numPages.value]) {
    slideConfigs.value[numPages.value] = { bgColor: '#ffffff', bgImage: null }
  }
  // Mapeamos a "0" para que renderice un canvas en blanco y no intente buscarlo en el PDF original
  pdfPageMap.value[numPages.value] = 0
  changePageTo(numPages.value)
}

const changePageTo = (num: number) => {
  if (num < 1 || num > numPages.value) return
  pageNum.value = num
  selectedElementId.value = null
  renderPage(num)
}
const changeZoom = (delta: number) => {
  zoom.value = Math.max(0.2, Math.min(zoom.value + delta, 4))
}
const fitToScreen = () => {
  if (workspaceRef.value)
    zoom.value = Math.max(0.2, (workspaceRef.value.clientHeight - 80) / baseHeight.value)
}

// --- CREACIÓN DE ELEMENTOS ---
const handleCanvasClick = (e: MouseEvent) => {
  if (playMode.value || activeTool.value === 'select') {
    selectedElementId.value = null
    return
  }
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  const rawX = (e.clientX - rect.left) / zoom.value
  const rawY = (e.clientY - rect.top) / zoom.value

  const newElement: any = {
    id: `el_${Date.now()}`,
    x: rawX,
    y: rawY,
    zIndex: currentPageElements.value.length + 10,
    type: activeTool.value,
    opacity: 1,
    rotation: 0,
  }

  if (activeTool.value === 'link') {
    newElement.name = 'Botón'
    newElement.width = 180
    newElement.height = 45
    newElement.text = 'Ir a página...'
    newElement.targetPage = 1
    newElement.bgColor = '#2ea043'
    newElement.color = '#ffffff'
    newElement.borderRadius = 8
    newElement.borderWidth = 0
    newElement.borderColor = '#ffffff'
    newElement.fontFamily = 'Arial'
    newElement.fontSize = 14
    newElement.fontWeight = 'bold'
  } else if (activeTool.value === 'accordion') {
    newElement.name = 'Acordeón'
    newElement.width = 300
    newElement.height = 'auto'
    newElement.bgColor = '#21262d'
    newElement.color = '#c9d1d9'
    newElement.items = [{ title: 'Sección 1', content: 'Detalle...', isOpen: false }]
  } else if (activeTool.value === 'text') {
    newElement.name = 'Texto'
    newElement.width = 300
    newElement.height = 'auto'
    newElement.content = 'Escribe aquí...'
    newElement.color = '#c9d1d9'
    newElement.fontSize = 32
    newElement.fontWeight = '400'
    newElement.fontFamily = 'Arial, sans-serif'
    newElement.fontStyle = 'normal'
    newElement.textAlign = 'left'
    newElement.lineHeight = 1.2
    newElement.letterSpacing = 0
    newElement.textShadow = 'none'
    newElement.textBgColor = 'transparent'
  } else if (activeTool.value === 'shape') {
    newElement.name = 'Forma'
    newElement.width = 150
    newElement.height = 150
    newElement.bgColor = '#2f81f7'
    newElement.borderRadius = 8
    newElement.borderWidth = 0
    newElement.borderColor = '#ffffff'
    newElement.boxShadow = 'none'
  } else if (activeTool.value === 'image') {
    newElement.name = 'Imagen'
    newElement.width = 250
    newElement.height = 250
    newElement.src = ''
    newElement.fit = 'contain'
    newElement.borderRadius = 0
    newElement.borderWidth = 0
    newElement.borderColor = '#000000'
    newElement.grayscale = 0
    newElement.blur = 0
    newElement.sepia = 0
  } else if (activeTool.value === 'video') {
    newElement.name = 'Vídeo'
    newElement.width = 400
    newElement.height = 225
    newElement.src = ''
    newElement.fit = 'cover'
    newElement.autoplay = false
    newElement.loop = false
    newElement.muted = false
    newElement.borderRadius = 0
    newElement.borderWidth = 0
    newElement.borderColor = '#000000'
  } else if (activeTool.value === '3d') {
    newElement.name = 'Modelo 3D'
    newElement.width = 300
    newElement.height = 300
    newElement.src = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
    newElement.autoRotate = true
    newElement.cameraControls = true
    newElement.envImage = ''
  } else if (activeTool.value === 'interactive') {
    newElement.name = 'Hotspot'
    newElement.width = 40
    newElement.height = 40
    newElement.color = '#2f81f7'
    newElement.modalTitle = 'Info'
    newElement.contentHtml = '<p>Edita el HTML.</p>'
    newElement.isOpen = false
    newElement.modalBgColor = '#ffffff'
    newElement.modalTextColor = '#333333'
  } else if (activeTool.value === 'icon') {
    newElement.name = 'Icono'
    newElement.width = 60
    newElement.height = 60
    newElement.color = '#c9d1d9'
    newElement.bgColor = 'transparent'
    newElement.borderRadius = 0
    newElement.iconName = 'star'
    newElement.fontSize = 60
  } else if (activeTool.value === 'chart') {
    newElement.name = 'Gráfico'
    newElement.width = 350
    newElement.height = 250
    newElement.color = '#c9d1d9'
    newElement.bgColor = '#FFFFFF'
    newElement.chartType = 'bar'
    newElement.chartTitle = 'Datos'
    newElement.showValues = true
    newElement.showLegend = true
    newElement.borderRadius = 8
    newElement.chartData = [
      { label: 'Ene', value: 30, color: '#58a6ff' },
      { label: 'Feb', value: 60, color: '#2ea043' },
      { label: 'Mar', value: 40, color: '#da3633' },
    ]
  } else if (activeTool.value === 'iframe') {
    newElement.name = 'Iframe'
    newElement.width = 400
    newElement.height = 300
    newElement.src = ''
    newElement.borderRadius = 8
    newElement.borderWidth = 1
    newElement.borderColor = '#30363d'
  } else if (activeTool.value === 'audio') {
    newElement.name = 'Audio'
    newElement.width = 60
    newElement.height = 60
    newElement.src = ''
    newElement.bgColor = '#da3633'
    newElement.color = '#ffffff'
    newElement.borderRadius = 50
    newElement.loop = false
    newElement.autoplay = false
    newElement.isPlaying = false
  } else if (activeTool.value === 'draw') {
    newElement.name = 'Pizarra'
    newElement.width = 400
    newElement.height = 300
    newElement.brushSize = 4
    newElement.brushColor = '#ff0000'
    newElement.lines = []
  }

  if (!documentState.value[pageNum.value]) documentState.value[pageNum.value] = []
  documentState.value[pageNum.value].push(newElement)
  selectedElementId.value = newElement.id
  activeTool.value = 'select'
}

const addAccordionSection = () => {
  if (selectedElement.value && selectedElement.value.type === 'accordion')
    selectedElement.value.items.push({ title: 'Nueva', content: '...', isOpen: false })
}
const removeBackgroundImage = () => {
  if (slideConfigs.value[pageNum.value]) {
    slideConfigs.value[pageNum.value].bgImage = null
    renderPage(pageNum.value)
  }
}
const clearDrawCanvas = (el: any) => {
  el.lines = []
}

// BASE64 AL SUBIR ARCHIVOS LOCALES
const handleLocalMediaUpload = (event: Event, el: any) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    el.src = e.target?.result as string
    if (el.type === '3d') el.name = file.name
  }
  reader.readAsDataURL(file)
}
const setSlideBackgroundImage = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    slideConfigs.value[pageNum.value].bgImage = ev.target?.result as string
    renderPage(pageNum.value)
  }
  reader.readAsDataURL(file)
}

// --- DIBUJO SVG ---
let isDrawingSVG = false
let currentLine: any = null
const startSvgDraw = (e: MouseEvent, el: any) => {
  if (playMode.value) return
  e.preventDefault()
  isDrawingSVG = true
  const rect = (e.target as SVGSVGElement).getBoundingClientRect()
  const x = (e.clientX - rect.left) / zoom.value
  const y = (e.clientY - rect.top) / zoom.value
  currentLine = { color: el.brushColor || '#ff0000', size: el.brushSize || 4, points: [{ x, y }] }
  if (!el.lines) el.lines = []
  el.lines.push(currentLine)
}
const doSvgDraw = (e: MouseEvent, el: any) => {
  if (!isDrawingSVG || !currentLine || playMode.value) return
  e.preventDefault()
  const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
  const x = (e.clientX - rect.left) / zoom.value
  const y = (e.clientY - rect.top) / zoom.value
  currentLine.points.push({ x, y })
}
const stopSvgDraw = () => {
  isDrawingSVG = false
  currentLine = null
}

// --- AUDIO ---
const playAudio = (el: any) => {
  if (!playMode.value) return
  const audioEls = document.querySelectorAll('audio')
  audioEls.forEach((a) => {
    if (a.src !== el.src) a.pause()
  })
  currentPageElements.value.forEach((item) => {
    if (item.type === 'audio' && item.id !== el.id) item.isPlaying = false
  })
  const audioEl = document.querySelector(`audio[src="${el.src}"]`) as HTMLAudioElement
  if (audioEl) {
    if (el.isPlaying) {
      audioEl.pause()
      el.isPlaying = false
    } else {
      audioEl.play()
      el.isPlaying = true
    }
  }
}

// --- ARRASTRE Y REDIMENSIÓN ---
let isDragging = false
let isResizing = false
let startX = 0,
  startY = 0
let initialElX = 0,
  initialElY = 0
let initialWidth = 0,
  initialHeight = 0

const startDrag = (e: MouseEvent, el: any, isHandle: boolean = false) => {
  if (playMode.value || isResizing) return
  if (el.type === 'draw' && !isHandle) return
  e.preventDefault()
  selectedElementId.value = el.id
  if (activeTool.value !== 'select') return
  isDragging = true
  startX = e.clientX
  startY = e.clientY
  initialElX = el.x
  initialElY = el.y
  const onMouseMove = (moveEvent: MouseEvent) => {
    if (!isDragging) return
    el.x = initialElX + (moveEvent.clientX - startX) / zoom.value
    el.y = initialElY + (moveEvent.clientY - startY) / zoom.value
  }
  const onMouseUp = () => {
    isDragging = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const startResize = (e: MouseEvent, el: any) => {
  if (playMode.value) return
  e.preventDefault()
  isResizing = true
  startX = e.clientX
  startY = e.clientY
  initialWidth = el.width
  initialHeight = el.height === 'auto' ? 50 : el.height
  const onMouseMove = (moveEvent: MouseEvent) => {
    if (!isResizing) return
    el.width = Math.max(20, initialWidth + (moveEvent.clientX - startX) / zoom.value)
    if (el.height !== 'auto')
      el.height = Math.max(20, initialHeight + (moveEvent.clientY - startY) / zoom.value)
  }
  const onMouseUp = () => {
    isResizing = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const triggerInteraction = (el: any) => {
  if (!playMode.value) return
  currentPageElements.value.forEach((item) => {
    if (item.id !== el.id && item.type === 'interactive') item.isOpen = false
  })
  el.isOpen = !el.isOpen
}
const deleteSelected = () => {
  if (!selectedElementId.value) return
  documentState.value[pageNum.value] = documentState.value[pageNum.value].filter(
    (el) => el.id !== selectedElementId.value,
  )
  selectedElementId.value = null
}
const selectElement = (id: string) => {
  selectedElementId.value = id
  activeTool.value = 'select'
}

const togglePlayMode = async () => {
  playMode.value = !playMode.value
  selectedElementId.value = null
  Object.values(documentState.value).forEach((pageItems) => {
    pageItems.forEach((el) => {
      if (el.type === 'interactive') el.isOpen = false
      if (el.type === 'accordion') el.items.forEach((item: any) => (item.isOpen = false))
      if (el.type === 'audio') {
        el.isPlaying = false
        const a = document.querySelector(`audio[src="${el.src}"]`) as HTMLAudioElement
        if (a) {
          a.pause()
          if (playMode.value && el.autoplay) {
            a.play()
              .then(() => (el.isPlaying = true))
              .catch((err) => console.log('Autoplay bloquedo', err))
          }
        }
      }
    })
  })
  await nextTick()
  fitToScreen()
}

// --- EXPORTACIÓN HTML ---
const exportPresentation = () => {
  if (Object.keys(documentState.value).length === 0 && !_RAW_PDF_DOC && docType.value === 'blank') {
    alert('El proyecto está vacío.')
    return
  }

  const safeStateString = JSON.stringify(documentState.value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
  const safeConfigString = JSON.stringify(slideConfigs.value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
  const safeMapString = JSON.stringify(pdfPageMap.value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presentación Pro</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"><\/script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"><\/script>
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"><\/script>
  <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web/src/regular/style.css" />
  <style>
    body { margin: 0; background: #000; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; user-select: none; -webkit-user-select: none; }
    #app { display: flex; justify-content: center; align-items: center; width: 100vw; height: 100vh; position: relative; }
    .canvas-wrapper { position: relative; box-shadow: 0 0 50px rgba(0,0,0,0.8); transform-origin: center center; transition: transform 0.2s; background-size: 100% 100%; background-position: center; }
    .layer-pdf { position: absolute; top: 0; left: 0; z-index: 0; pointer-events: none; }
    .interactive-element { position: absolute; box-sizing: border-box; display: flex; }
    .el-text { width: 100%; height: 100%; white-space: pre-wrap; word-break: break-word; user-select: text; -webkit-user-select: text; }
    .el-shape { width: 100%; height: 100%; }
    .el-icon { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    .el-content-fitted { width: 100%; height: 100%; display: block; border: none; }
    .el-link { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.1s; box-shadow: 0 4px 6px rgba(0,0,0,0.3); text-align: center; padding: 0 10px; box-sizing: border-box; }
    .el-link:active { transform: scale(0.95); }
    .el-interactive { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .hotspot-pulse { width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; animation: pulse 2s infinite; }
    @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.8; } 70% { transform: scale(1.1); opacity: 0; } 100% { transform: scale(0.95); opacity: 0; } }
    .interactive-modal { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 15px; background: white; color: #333; padding: 20px; border-radius: 8px; width: 320px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); z-index: 9999; cursor: default; user-select: text; }
    .modal-title { margin: 0 0 10px 0; font-size: 1.1rem; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    .el-accordion { width: 100%; height: 100%; overflow-y: auto; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .accordion-item { border-bottom: 1px solid rgba(255,255,255,0.1); }
    .accordion-header { padding: 12px 16px; font-weight: bold; display: flex; justify-content: space-between; cursor: pointer; background: rgba(0,0,0,0.2); }
    .accordion-content { padding: 16px; font-size: 0.9rem; line-height: 1.5; background: rgba(0,0,0,0.05); user-select: text; }
    .el-audio-btn { width: 100%; height: 100%; cursor: pointer; }
    .audio-visual { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2rem; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: transform 0.1s; }
    .audio-visual:active { transform: scale(0.9); }
    .audio-visual.is-playing { animation: bounce 1s infinite alternate; }
    @keyframes bounce { from { transform: scale(1); } to { transform: scale(1.1); } }
    .play-nav-overlay { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(30,30,30,0.8); backdrop-filter: blur(5px); padding: 10px 20px; border-radius: 30px; display: flex; gap: 15px; z-index: 10000; color: white; align-items: center; font-weight: bold; box-shadow: 0 10px 20px rgba(0,0,0,0.5);}
    .play-nav-overlay button { width: 32px; height: 32px; border-radius: 50%; background: #444; color: white; border: none; cursor: pointer; font-weight: bold; transition: 0.2s;}
    .play-nav-overlay button:hover:not(:disabled) { background: #58a6ff; }
    .play-nav-overlay button:disabled { opacity: 0.5; cursor: not-allowed; }
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
  </style>
</head>
<body>
  <script type="application/json" id="app-state-data">${safeStateString}<\/script>
  <script type="application/json" id="app-configs-data">${safeConfigString}<\/script>
  <script type="application/json" id="app-pdf-map">${safeMapString}<\/script>
  <script type="application/json" id="app-pdf-data">${_PDF_BASE64_STORE}<\/script>

  <div id="app">
    <div class="canvas-wrapper" :style="{ width: baseWidth + 'px', height: baseHeight + 'px', transform: 'scale(' + zoom + ')', backgroundColor: currentBgColor, backgroundImage: currentBgImage }">
      <canvas ref="pdfCanvas" class="layer-pdf" v-show="docType === 'pdf'"></canvas>
      
      <div v-for="el in currentPageElements" :key="el.id" class="interactive-element is-clickable"
           :style="{ left: el.x + 'px', top: el.y + 'px', width: el.width + 'px', height: (el.height === 'auto' ? 'auto' : el.height + 'px'), zIndex: el.zIndex, opacity: el.opacity !== undefined ? el.opacity : 1, transform: 'rotate(' + (el.rotation || 0) + 'deg)' }">
        
        <div v-if="el.type === 'text'" class="el-text" :style="{ color: el.color, fontSize: el.fontSize + 'px', fontWeight: el.fontWeight, fontFamily: el.fontFamily, fontStyle: el.fontStyle, textAlign: el.textAlign, lineHeight: el.lineHeight || 1.2, letterSpacing: (el.letterSpacing || 0) + 'px', textShadow: el.textShadow || 'none', backgroundColor: el.textBgColor || 'transparent', padding: el.textBgColor !== 'transparent' ? '10px' : '0', borderRadius: '4px' }">{{ el.content }}</div>
        
        <div v-else-if="el.type === 'shape'" class="el-shape" :style="{ backgroundColor: el.bgColor, borderRadius: el.borderRadius + 'px', border: el.borderWidth + 'px solid ' + el.borderColor, boxShadow: el.boxShadow || 'none' }"></div>
        
        <div v-else-if="el.type === 'icon'" class="el-icon" :style="{ color: el.color, fontSize: el.fontSize + 'px', backgroundColor: el.bgColor || 'transparent', borderRadius: (el.borderRadius || 0) + 'px' }"><i :class="'ph ph-' + el.iconName"></i></div>
        
        <div v-else-if="el.type === 'draw'" class="el-draw-board" style="width: 100%; height: 100%;">
           <svg style="width: 100%; height: 100%; display: block; overflow: visible;">
              <polyline v-for="(line, idx) in el.lines" :key="idx" :points="line.points.map(p => p.x+','+p.y).join(' ')" :stroke="line.color" :stroke-width="line.size" fill="none" stroke-linecap="round" stroke-linejoin="round" />
           </svg>
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

        <div v-else-if="el.type === 'image'" class="el-image-container" :style="{ borderRadius: (el.borderRadius || 0) + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), filter: 'grayscale('+(el.grayscale||0)+'%) blur('+(el.blur||0)+'px) sepia('+(el.sepia||0)+'%)', overflow: 'hidden', width: '100%', height: '100%' }">
          <img v-if="el.src" :src="el.src" class="el-content-fitted" :style="{ objectFit: el.fit }" />
        </div>
        
        <div v-else-if="el.type === 'video'" class="el-video-container" style="width: 100%; height: 100%;" :style="{ borderRadius: (el.borderRadius || 0) + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), overflow: 'hidden' }">
          <iframe v-if="isYouTube(el.src)" :src="getYouTubeEmbedUrl(el.src)" class="el-content-fitted" frameborder="0" allowfullscreen></iframe>
          <video v-else :src="el.src" controls :autoplay="el.autoplay" :loop="el.loop" :muted="el.muted" class="el-content-fitted" :style="{ objectFit: el.fit }"></video>
        </div>

        <div v-else-if="el.type === 'iframe'" class="el-iframe-container" style="width: 100%; height: 100%;" :style="{ borderRadius: (el.borderRadius || 0) + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), overflow: 'hidden' }">
          <iframe v-if="el.src" :src="el.src" width="100%" height="100%" frameborder="0"></iframe>
        </div>
        
        <div v-else-if="el.type === '3d'" class="el-3d" style="width: 100%; height: 100%;">
          <model-viewer v-if="el.src" :src="el.src" :auto-rotate="el.autoRotate" :camera-controls="el.cameraControls" :environment-image="el.envImage" style="width: 100%; height: 100%;"></model-viewer>
        </div>
        
        <div v-else-if="el.type === 'interactive'" class="el-interactive" @click.stop="triggerInteraction(el)">
          <div class="hotspot-pulse" :style="{ backgroundColor: el.color, boxShadow: '0 0 15px ' + el.color }"></div>
          <div v-if="el.isOpen" class="interactive-modal" :style="{ backgroundColor: el.modalBgColor || '#ffffff', color: el.modalTextColor || '#333333' }" @click.stop>
            <h4 class="modal-title" :style="{ borderBottomColor: el.modalTextColor || '#333333' }">{{ el.modalTitle }}</h4>
            <p v-html="el.contentHtml"></p>
          </div>
        </div>

        <div v-else-if="el.type === 'audio'" class="el-audio-btn" @click.stop="playAudio(el)">
          <div class="audio-visual" :class="{ 'is-playing': el.isPlaying }" :style="{ backgroundColor: el.bgColor, color: el.color, borderRadius: el.borderRadius + 'px' }">
            <i class="ph" :class="el.isPlaying ? 'ph-pause' : 'ph-speaker-high'"></i>
          </div>
          <audio v-if="el.src" :ref="'audio_'+el.id" :src="el.src" :loop="el.loop" :autoplay="el.autoplay"></audio>
        </div>

        <div v-else-if="el.type === 'link'" class="el-link" 
             :style="{ backgroundColor: el.bgColor, color: el.color, borderRadius: el.borderRadius + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), fontSize: (el.fontSize || 16) + 'px', fontWeight: el.fontWeight || 'bold', fontFamily: el.fontFamily || 'Arial' }"
             @click.stop="changePageTo(el.targetPage)">
          {{ el.text }}
        </div>

        <div v-else-if="el.type === 'accordion'" class="el-accordion" :style="{ backgroundColor: el.bgColor, color: el.color }">
          <div v-for="(item, idx) in el.items" :key="idx" class="accordion-item" :style="{ borderBottomColor: el.color }">
            <div class="accordion-header" @click.stop="item.isOpen = !item.isOpen">
              <span>{{ item.title }}</span>
              <span>{{ item.isOpen ? '▲' : '▼' }}</span>
            </div>
            <div v-show="item.isOpen" class="accordion-content">
              {{ item.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="play-nav-overlay">
      <button @click="changePageTo(pageNum - 1)" :disabled="pageNum <= 1">◀</button>
      <span>{{ pageNum }} / {{ numPages }}</span>
      <button @click="changePageTo(pageNum + 1)" :disabled="pageNum >= numPages">▶</button>
    </div>
  </div>

  <script>
    const { createApp, ref, computed, onMounted, nextTick } = Vue;

    createApp({
      setup() {
        const documentState = ref(JSON.parse(document.getElementById('app-state-data').textContent));
        const slideConfigs = ref(JSON.parse(document.getElementById('app-configs-data').textContent));
        const pdfPageMap = ref(JSON.parse(document.getElementById('app-pdf-map').textContent || '{}'));
        const rawPdfB64 = document.getElementById('app-pdf-data').textContent;
        
        const baseWidth = ref(${baseWidth.value});
        const baseHeight = ref(${baseHeight.value});
        const docType = ref('${docType.value}');
        
        const pageNum = ref(1);
        const numPages = ref(Math.max(...Object.keys(documentState.value).map(Number), 1));
        const zoom = ref(1.0);
        
        const currentPageElements = computed(() => documentState.value[pageNum.value] || []);
        
        const currentBgColor = computed(() => slideConfigs.value[pageNum.value]?.bgColor || '#ffffff');
        const currentBgImage = computed(() => slideConfigs.value[pageNum.value]?.bgImage ? 'url(' + slideConfigs.value[pageNum.value].bgImage + ')' : 'none');

        const isYouTube = (url) => url && url.match(/(?:youtu\\.be\\/|youtube\\.com\\/(?:embed\\/|v\\/|watch\\?v=|watch\\?.+&v=))([\\w-]{11})/);
        const getYouTubeEmbedUrl = (url) => {
          const match = url.match(/(?:youtu\\.be\\/|youtube\\.com\\/(?:embed\\/|v\\/|watch\\?v=|watch\\?.+&v=))([\\w-]{11})/);
          return match && match[1] ? 'https://www.youtube-nocookie.com/embed/' + match[1] + '?rel=0' : '';
        };

        const getChartValues = (data) => { if(!data || !data.length) return [10, 50, 30]; return data.map(d => parseFloat(d.value) || 0); };
        const getChartMax = (data) => { const vals = getChartValues(data); const max = Math.max(...vals); return max > 0 ? max : 1; };
        const getPieGradient = (data) => {
          if(!data || !data.length) return 'transparent';
          const total = data.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0) || 1;
          let currentAngle = 0;
          const stops = data.map(d => {
            const pct = ((parseFloat(d.value) || 0) / total) * 100;
            const stop = d.color + ' ' + currentAngle + '% ' + (currentAngle + pct) + '%';
            currentAngle += pct;
            return stop;
          });
          return 'conic-gradient(' + stops.join(', ') + ')';
        }

        const fitToScreen = () => {
          const wZoom = window.innerWidth / baseWidth.value;
          const hZoom = window.innerHeight / baseHeight.value;
          zoom.value = Math.min(wZoom, hZoom) * 0.95;
        };

        let pdfDoc = null;
        const pdfCanvas = ref(null);
        
        const initPdf = async () => {
            if (docType.value === 'pdf' && rawPdfB64) {
                const pdfData = atob(rawPdfB64);
                const uint8Array = new Uint8Array(pdfData.length);
                for (let i = 0; i < pdfData.length; i++) {
                    uint8Array[i] = pdfData.charCodeAt(i);
                }
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
                const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
                pdfDoc = await loadingTask.promise;
                renderPdfPage(pageNum.value);
            }
        };

        const renderPdfPage = async (num) => {
            await nextTick();
            if (docType.value !== 'pdf' || !pdfDoc || !pdfCanvas.value) return;
            const canvas = pdfCanvas.value;
            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 2;
            
            const actualPdfPage = pdfPageMap.value[num];
            
            // Si la página se marcó como vacía o excede, borramos el canvas en lugar de lanzar error
            if (!actualPdfPage || actualPdfPage <= 0 || actualPdfPage > pdfDoc.numPages) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            const page = await pdfDoc.getPage(actualPdfPage);
            const viewport = page.getViewport({ scale: 1.0 });
            
            canvas.width = viewport.width * dpr;
            canvas.height = viewport.height * dpr;
            canvas.style.width = viewport.width + 'px';
            canvas.style.height = viewport.height + 'px';
            ctx.scale(dpr, dpr);
            
            await page.render({ canvasContext: ctx, viewport }).promise;
        }

        const changePageTo = (num) => {
          if(num >= 1 && num <= numPages.value) {
            pageNum.value = num;
            closeAllInteractives();
            if(docType.value === 'pdf') renderPdfPage(num);
          }
        };

        const triggerInteraction = (el) => {
          currentPageElements.value.forEach(item => { if(item.id !== el.id && item.type === 'interactive') item.isOpen = false });
          el.isOpen = !el.isOpen;
        };

        const playAudio = (el) => {
          const audioEls = document.querySelectorAll('audio');
          audioEls.forEach(a => { if(a.src !== el.src) a.pause() });
          currentPageElements.value.forEach(item => { if(item.type === 'audio' && item.id !== el.id) item.isPlaying = false; });
          
          const audioEl = document.querySelector('audio[src="'+el.src+'"]');
          if(audioEl) {
            if(el.isPlaying) { audioEl.pause(); el.isPlaying = false; }
            else { audioEl.play(); el.isPlaying = true; }
          }
        };

        const closeAllInteractives = () => {
          Object.values(documentState.value).forEach(pageItems => {
            pageItems.forEach(el => {
              if(el.type === 'interactive') el.isOpen = false;
              if(el.type === 'accordion') el.items.forEach(item => item.isOpen = false);
              if(el.type === 'audio') { el.isPlaying = false; const a = document.querySelector('audio[src="'+el.src+'"]'); if(a) a.pause(); }
            });
          });
        };

        onMounted(() => {
          fitToScreen();
          initPdf();
          window.addEventListener('resize', fitToScreen);
          document.addEventListener('keydown', (e) => {
            if(e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); changePageTo(pageNum.value + 1); }
            if(e.key === 'ArrowLeft') { e.preventDefault(); changePageTo(pageNum.value - 1); }
          });
        });

        return { 
          baseWidth, baseHeight, docType, zoom, pageNum, numPages, currentPageElements,
          currentBgColor, currentBgImage, pdfCanvas,
          changePageTo, triggerInteraction, isYouTube, getYouTubeEmbedUrl,
          getChartValues, getChartMax, getPieGradient, playAudio
        };
      }
    }).mount('#app');
  <\/script>
</body>
</html>`

  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'presentacion_interactiva.html'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
/* =========================================
   DISEÑO PROFESIONAL OSCURO (TIPO EDITOR)
   ========================================= */

.pro-editor-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #0d1117;
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  overflow: hidden;
}

/* HEADER Y OVERLAY DE CARGA */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(13, 17, 23, 0.9);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}
.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(88, 166, 255, 0.3);
  border-top-color: #58a6ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 55px;
  background-color: #161b22;
  border-bottom: 1px solid #30363d;
  padding: 0 20px;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
}
.header-left,
.header-center,
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.pro-logo {
  font-size: 1.3rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.5px;
}
.text-accent {
  color: #58a6ff;
}
.file-menu {
  display: flex;
  gap: 10px;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.menu-item:hover:not(:disabled) {
  background: #30363d;
}
.menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.menu-item.is-loading {
  background: #58a6ff;
  color: #0d1117;
  font-weight: bold;
  border-color: #58a6ff;
}
.btn-export {
  background: #238636;
  border-color: #238636;
  color: white;
}
.btn-export:hover:not(:disabled) {
  background: #2ea043;
  border-color: #2ea043;
}
.shortcut {
  font-size: 0.7rem;
  color: #8b949e;
  margin-left: 6px;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #0d1117;
  padding: 4px;
  border-radius: 8px;
  border: 1px solid #30363d;
}
.zoom-level {
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}
.divider-vertical {
  width: 1px;
  height: 20px;
  background: #30363d;
  margin: 0 5px;
}

.btn-play {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #2ea043;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-play:hover {
  background: #3fb950;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(46, 160, 67, 0.4);
}
.btn-play.is-active {
  background: #da3633;
}
.btn-play.is-active:hover {
  background: #f85149;
  box-shadow: 0 4px 10px rgba(218, 54, 51, 0.4);
}
.btn-exit-play {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: #da3633;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
  transition: 0.2s;
}
.btn-exit-play:hover {
  background: #f85149;
  transform: translate(-50%, -2px);
}

/* CONTROLES DE NAVEGACIÓN EN PLAY MODE */
.play-nav-overlay {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(22, 27, 34, 0.9);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 30px;
  border: 1px solid #30363d;
  display: flex;
  gap: 15px;
  z-index: 10000;
  color: white;
  align-items: center;
  font-weight: 600;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}
.play-nav-overlay button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #30363d;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}
.play-nav-overlay button:hover:not(:disabled) {
  background: #58a6ff;
  transform: scale(1.1);
}
.play-nav-overlay button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.text-muted {
  color: #8b949e;
  font-weight: normal;
}

/* WORKSPACE LAYOUT */
.pro-workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.pro-sidebar {
  width: 280px;
  background-color: #161b22;
  border-right: 1px solid #30363d;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
}
.right-sidebar {
  border-right: none;
  border-left: 1px solid #30363d;
  width: 320px;
}

.panel-header {
  padding: 16px;
  font-weight: 600;
  font-size: 0.85rem;
  border-bottom: 1px solid #30363d;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #8b949e;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.badge {
  background: #30363d;
  color: #c9d1d9;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
}

.pro-toolbar {
  width: 65px;
  background-color: #0d1117;
  border-right: 1px solid #30363d;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 15px;
  gap: 8px;
  overflow-y: auto;
}
.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #8b949e;
  cursor: pointer;
  border-radius: 6px;
  padding: 6px;
  transition: all 0.2s;
}
.tool-btn:hover {
  background: #21262d;
  color: #c9d1d9;
}
.tool-btn.large {
  font-size: 1.4rem;
  width: 44px;
  height: 44px;
}
.tool-btn.active {
  background: rgba(88, 166, 255, 0.15);
  color: #58a6ff;
}
.tool-divider {
  width: 36px;
  height: 1px;
  background: #30363d;
  margin: 8px 0;
  flex-shrink: 0;
}

.pro-canvas-area {
  flex: 1;
  background-color: #010409;
  position: relative;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: radial-gradient(#30363d 1px, transparent 1px);
  background-size: 20px 20px;
}

/* TREE VIEW (LEFT SIDEBAR) */
.tree-view {
  padding: 10px 0;
  flex: 1;
  overflow-y: auto;
}
.tree-node-title {
  display: flex;
  justify-content: space-between; /* Modificado para separar el título de las acciones */
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s;
  color: #c9d1d9;
}
.tree-node-title:hover {
  background: #21262d;
}
.tree-node-title i {
  font-size: 1.2rem;
  color: #8b949e;
}
/* Nuevos estilos para los botones de acción */
.slide-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}
.tree-node-title:hover .slide-actions {
  opacity: 1;
}
.slide-action-btn {
  background: transparent;
  border: none;
  color: #8b949e;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}
.slide-action-btn:hover:not(:disabled) {
  background: #30363d;
  color: #c9d1d9;
}
.slide-action-btn.btn-trash:hover:not(:disabled) {
  background: rgba(218, 54, 51, 0.2);
  color: #ff7b72;
}
.slide-action-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.tree-node-title.is-active {
  background: rgba(88, 166, 255, 0.1);
  border-left: 3px solid #58a6ff;
  color: #58a6ff;
}
.tree-node-title.is-active .slide-name-wrapper i {
  color: #58a6ff;
}
.tree-node-title.is-active i {
  color: #58a6ff;
}
.tree-children {
  padding: 5px 0 5px 15px;
  background: transparent;
}
.tree-child {
  padding: 8px 16px 8px 30px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #8b949e;
  border-radius: 0 6px 6px 0;
  margin-right: 10px;
  transition: 0.2s;
}
.tree-child .icon {
  font-size: 1.1rem;
}
.tree-child:hover {
  background: #21262d;
  color: #c9d1d9;
}
.tree-child.is-selected {
  background: #30363d;
  color: #fff;
  font-weight: 500;
}
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #30363d;
  background: #161b22;
}

.slide-name-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}
.slide-name-wrapper i {
  font-size: 1.2rem;
  color: #8b949e;
}

/* INSPECTOR Y CONFIG (RIGHT SIDEBAR) */
.panel-content {
  padding: 20px;
}
.empty-state {
  text-align: center;
  color: #8b949e;
  padding-top: 40px;
  font-size: 0.9rem;
}
.empty-icon-wrapper {
  width: 60px;
  height: 60px;
  background: #21262d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px auto;
}
.element-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.badge-type {
  background: rgba(88, 166, 255, 0.15);
  color: #58a6ff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.5px;
}

.prop-section {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}
.section-title {
  color: #c9d1d9;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.prop-group {
  margin-bottom: 15px;
}
.prop-group:last-child {
  margin-bottom: 0;
}
.prop-group label {
  display: block;
  font-size: 0.75rem;
  color: #8b949e;
  margin-bottom: 6px;
  font-weight: 500;
}
.prop-row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
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
  background: #161b22;
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 8px 10px;
  border-radius: 6px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 0.85rem;
  transition: border-color 0.2s;
}
.pro-input:focus {
  outline: none;
  border-color: #58a6ff;
  box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.2);
}
.pro-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 4px 10px;
}
.pro-color-picker {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
}
.color-picker-wrapper::-webkit-color-swatch-wrapper {
  padding: 0;
}
.color-picker-wrapper::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}
.color-hex {
  font-size: 0.8rem;
  color: #c9d1d9;
  font-family: monospace;
}

.range-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}
.range-val {
  font-size: 0.8rem;
  color: #c9d1d9;
  min-width: 35px;
  text-align: right;
}

.info-box {
  background: rgba(88, 166, 255, 0.1);
  border-left: 3px solid #58a6ff;
  padding: 12px;
  border-radius: 6px;
  color: #c9d1d9;
  line-height: 1.5;
  font-size: 0.85rem;
}

.align-buttons {
  display: flex;
  gap: 4px;
  background: #161b22;
  border: 1px solid #30363d;
  padding: 4px;
  border-radius: 6px;
}
.align-buttons .tool-btn {
  flex: 1;
  font-size: 1rem;
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
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  box-sizing: border-box;
  transition: all 0.2s;
}
.btn-primary {
  background: #238636;
  color: #fff;
  border-color: rgba(240, 246, 252, 0.1);
}
.btn-primary:hover {
  background: #2ea043;
}
.btn-secondary {
  background: #21262d;
  color: #c9d1d9;
  border-color: #30363d;
}
.btn-secondary:hover {
  background: #30363d;
}
.btn-ghost {
  background: transparent;
  color: #c9d1d9;
  border-color: dashed #30363d;
}
.btn-ghost:hover {
  background: #21262d;
  color: #fff;
}
.btn-danger {
  background: rgba(218, 54, 51, 0.1);
  color: #ff7b72;
  border-color: rgba(218, 54, 51, 0.4);
}
.btn-danger:hover {
  background: rgba(218, 54, 51, 0.2);
}
.btn-icon-danger {
  background: transparent;
  color: #8b949e;
  padding: 6px;
  border-radius: 6px;
}
.btn-icon-danger:hover {
  background: rgba(218, 54, 51, 0.1);
  color: #ff7b72;
}
.btn-text-danger {
  background: transparent;
  color: #ff7b72;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px;
}
.btn-text-danger:hover {
  text-decoration: underline;
}

.large-btn {
  padding: 12px 24px;
  font-size: 1rem;
  border-radius: 8px;
}

.w-100 {
  width: 100%;
}
.mt-1 {
  margin-top: 5px;
}
.mt-2 {
  margin-top: 10px;
}
.mt-4 {
  margin-top: 20px;
}
.mb-1 {
  margin-bottom: 5px;
}
.mb-0 {
  margin-bottom: 0px !important;
}
.text-center {
  text-align: center;
}
.text-left {
  text-align: left;
}
.block {
  display: block;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #c9d1d9;
  font-size: 0.85rem;
  cursor: pointer;
}

/* CANVAS Y ELEMENTOS INTERACTIVOS */
.canvas-wrapper {
  position: relative;
  transform-origin: center center;
  transition: transform 0.1s ease-out;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.8);
  user-select: none;
  -webkit-user-select: none;
}
.canvas-wrapper.play-mode-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.9);
}

.layer-engine {
  position: relative;
  overflow: hidden;
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
  color: #8b949e;
  pointer-events: none;
  z-index: 0;
  background: rgba(0, 0, 0, 0.2);
}

.interactive-element {
  position: absolute;
  box-sizing: border-box;
  display: flex;
}
.interactive-element.is-selected {
  outline: 2px solid #58a6ff;
  outline-offset: 1px;
}
.interactive-element.is-clickable {
  cursor: pointer;
}
.interactive-element.no-pointer {
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 12px;
  height: 12px;
  background: #fff;
  border: 2px solid #58a6ff;
  border-radius: 50%;
  cursor: nwse-resize;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Contenidos de Elementos */
.el-text {
  width: 100%;
  height: 100%;
  white-space: pre-wrap;
  line-height: 1.3;
  word-break: break-word;
}
.el-shape {
  width: 100%;
  height: 100%;
}
.el-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.el-image-container,
.el-video-container,
.el-iframe-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.el-content-fitted {
  width: 100%;
  height: 100%;
  display: block;
  border: none;
}
.placeholder-box {
  width: 100%;
  height: 100%;
  background: rgba(33, 38, 45, 0.8);
  border: 1px dashed #30363d;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #8b949e;
  text-align: center;
  padding: 10px;
  box-sizing: border-box;
}
.drag-protector {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  cursor: move;
}
.el-3d {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Pizarra SVG */
.el-draw-board {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}
.draw-drag-handle {
  position: absolute;
  top: -28px;
  left: 0;
  padding: 4px 12px;
  background: #58a6ff;
  color: #000;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: bold;
  cursor: move;
  border-radius: 4px;
  z-index: 10;
}

/* Gráficos */
.el-chart-wrapper {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}
.chart-inner-area {
  flex: 1;
  position: relative;
  width: 100%;
  height: calc(100% - 30px);
}
.chart-bar-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  width: 100%;
  height: 100%;
  gap: 8px;
}
.bar-col {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 100%;
}
.bar-fill {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height 0.4s ease-out;
  box-shadow: inset 0 -10px 20px rgba(0, 0, 0, 0.1);
}
.chart-hbar-container {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 100%;
  height: 100%;
  gap: 5px;
}
.hbar-row {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 10px;
}
.hbar-track {
  flex: 1;
  height: 100%;
  min-height: 10px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
}
.hbar-fill {
  height: 100%;
  border-radius: 0 4px 4px 0;
  transition: width 0.4s ease-out;
  box-shadow: inset -10px 0 20px rgba(0, 0, 0, 0.1);
}
.chart-pie-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
}
.pie-circle {
  border-radius: 50%;
  width: 100%;
  height: 100%;
  max-width: 250px;
  max-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
.donut-hole {
  width: 55%;
  height: 55%;
  border-radius: 50%;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
}
.chart-label {
  font-size: 11px;
  margin-top: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  font-weight: 500;
}
.chart-value {
  font-size: 11px;
  margin-bottom: 4px;
  font-weight: 800;
}
.pie-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 15px;
}
.pie-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 500;
}
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  display: inline-block;
}

/* Hotspot */
.el-interactive {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hotspot-pulse {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 3px solid white;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% {
    transform: scale(0.9);
    opacity: 0.9;
  }
  70% {
    transform: scale(1.3);
    opacity: 0;
  }
  100% {
    transform: scale(0.9);
    opacity: 0;
  }
}
.interactive-modal {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 15px;
  background: #fff;
  color: #161b22;
  padding: 24px;
  border-radius: 12px;
  width: 350px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  z-index: 9999;
  cursor: default;
  user-select: text;
  -webkit-user-select: text;
}
.modal-title {
  margin: 0 0 12px 0;
  font-size: 1.2rem;
  border-bottom: 2px solid #f0f6fc;
  padding-bottom: 8px;
  font-weight: 800;
}

/* Links y Acordeones */
.el-link {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 15px;
  box-sizing: border-box;
  transition: 0.2s;
}
.el-link:hover {
  filter: brightness(1.1);
}
.el-link:active {
  transform: scale(0.97);
}

.el-accordion {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}
.accordion-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.accordion-item:last-child {
  border-bottom: none;
}
.accordion-header {
  padding: 14px 18px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.3);
  transition: 0.2s;
}
.accordion-header:hover {
  background: rgba(0, 0, 0, 0.4);
}
.accordion-content {
  padding: 16px 18px;
  font-size: 0.9rem;
  line-height: 1.6;
  background: rgba(0, 0, 0, 0.1);
  user-select: text;
}
.accordion-content.is-preview {
  opacity: 0.5;
}
.accordion-edit-item {
  background: rgba(255, 255, 255, 0.02);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #30363d;
}

/* Audio */
.el-audio-btn {
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.audio-visual {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  transition: 0.2s;
}
.audio-visual:hover {
  filter: brightness(1.1);
}
.audio-visual:active {
  transform: scale(0.95);
}
.audio-visual.is-playing {
  animation: pulse-audio 1.5s infinite alternate;
}
@keyframes pulse-audio {
  from {
    box-shadow: 0 0 0 0px rgba(255, 255, 255, 0.4);
  }
  to {
    box-shadow: 0 0 0 15px rgba(255, 255, 255, 0);
  }
}

/* PANTALLA VACÍA */
.empty-workspace {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-box {
  background: #0d1117;
  border: 1px solid #30363d;
  padding: 60px;
  border-radius: 16px;
  text-align: center;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}
.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 20px;
}
.empty-box h3 {
  margin: 0 0 15px 0;
  font-size: 1.5rem;
  font-weight: 800;
}
.empty-box p {
  color: #8b949e;
  font-size: 1rem;
  margin: 0;
  line-height: 1.6;
}
.button-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}
.divider-text {
  color: #484f58;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
}
</style>

<template>
  <div>
    <div class="pro-editor-app">
      <EditorHeader 
        :is-converting="isConverting"
        :has-doc="hasDoc"
        :zoom="zoom"
        :play-mode="playMode"
        @file-upload="handleFileUpload"
        @export="exportPresentation"
        @change-zoom="changeZoom"
        @fit-screen="fitToScreen"
        @toggle-play="togglePlayMode"
      />
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
          <div class="slides-preview-list">
            <div
              v-for="page in numPages"
              :key="page"
              class="thumb-item"
              :class="{ 'is-active': pageNum === page }"
              @click="changePageTo(page)"
            >
              <div class="thumb-num">{{ page }}</div>
              <div class="thumb-card-wrapper">
                <div
                  class="thumb-card"
                  :style="{
                    backgroundColor: slideConfigs[page]?.bgColor || '#ffffff',
                    backgroundImage: slideConfigs[page]?.bgImage
                      ? `url(${slideConfigs[page].bgImage})`
                      : pdfPageMap[page] && pdfThumbnails[pdfPageMap[page]]
                        ? `url(${pdfThumbnails[pdfPageMap[page]]})`
                        : 'none',
                  }"
                >
                  <div class="thumb-actions">
                    <button
                      class="thumb-action-btn"
                      @click.stop="moveSlide(page, 'up')"
                      :disabled="page === 1"
                      title="Subir"
                    >
                      <i class="ph ph-arrow-up"></i>
                    </button>
                    <button
                      class="thumb-action-btn"
                      @click.stop="moveSlide(page, 'down')"
                      :disabled="page === numPages"
                      title="Bajar"
                    >
                      <i class="ph ph-arrow-down"></i>
                    </button>
                    <button
                      class="thumb-action-btn"
                      @click.stop="duplicateSlide(page)"
                      title="Duplicar"
                    >
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
          <div class="sidebar-footer">
            <button class="btn-ghost w-100" @click="addNewSlide">
              <i class="ph ph-plus"></i> Nueva Diapositiva
            </button>
          </div>
        </aside>

        <div class="center-workspace" v-if="hasDoc">
          <div class="pro-top-toolbar" v-if="!playMode">
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
          </div>

          <main class="pro-canvas-area" ref="workspaceRef">
            <div class="canvas-wrapper" :class="{ 'play-mode-active': playMode }">
              <div
                class="canvas-shadow-box layer-engine"
                :class="[
                  playMode && activeTransition !== 'none' ? 'slide-trans-' + activeTransition : '',
                ]"
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
                    >No se detectó imagen de fondo en esta diapositiva. Usa el Inspector para
                    asignar una.</small
                  >
                </div>

                <div
                  v-for="(el, index) in currentPageElements"
                  :key="el.id + (playMode ? renderTrigger : '')"
                  v-show="!el.isHidden || !playMode"
                  class="interactive-element"
                  :class="[
                    {
                      'is-selected': selectedElementIds.includes(el.id) && !playMode,
                      'is-clickable':
                        playMode &&
                        ['link', 'interactive', 'audio', 'checkbox', 'rating'].includes(el.type),
                      'no-pointer': playMode && (el.type === 'draw' || el.type === 'mindmap'),
                      'is-hidden-editor': el.isHidden && !playMode,
                    },
                    playMode && el.animation && el.animation !== 'none' && !el.isHidden
                      ? 'anim-' + el.animation
                      : '',
                  ]"
                  :style="{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: el.height === 'auto' ? 'auto' : `${el.height}px`,
                    zIndex: index + 10,
                    opacity: el.opacity ?? 1,
                    transform: `rotate(${el.rotation || 0}deg)`,
                    animationDelay:
                      playMode && el.animation && el.animation !== 'none'
                        ? `${index * 0.1}s`
                        : '0s',
                    mixBlendMode: el.mixBlendMode || 'normal',
                  }"
                  @mousedown.stop="startDrag($event, el)"
                >
                  <div
                    v-if="el.type === 'text' || el.type === 'sticky'"
                    class="el-text"
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
                          @click.stop="activeMapNodeId = n0.idselectElement(el.id)"
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
                              @click.stop="activeMapNodeId = n1.idselectElement(el.id)"
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
                                  @click.stop="activeMapNodeId = n2.idselectElement(el.id)"
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
                                      @click.stop="activeMapNodeId = n3.idselectElement(el.id)"
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
                      @click.stop="playMode ? (item.checked = !item.checked) : null"
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
                      @click.stop="playMode && el.isInteractive ? (el.rating = s) : null"
                      :style="{
                        cursor: playMode && el.isInteractive ? 'pointer' : 'default',
                        opacity: s <= el.rating ? 1 : 0.25,
                        transition: '0.2s',
                      }"
                      >★</span
                    >
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
                      v-if="el.src"
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
                      borderRadius: (el.borderRadius || 0) + 'px',
                      border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'),
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
                    class="el-audio-wrapper"
                    @click.stop="playAudio(el)"
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
                      selectedElementIds.length === 1 &&
                      selectedElementIds.includes(el.id) &&
                      !playMode &&
                      !['interactive', 'audio'].includes(el.type) &&
                      !el.isLocked
                    "
                    class="resize-handle"
                    @mousedown.stop="startResize($event, el)"
                  ></div>
                </div>
              </div>
            </div>
          </main>
        </div>

        <div v-else-if="!hasDoc && !isConverting" class="empty-workspace w-100">
          <div class="empty-box">
            <div class="empty-icon-wrapper"><i class="ph ph-magic-wand"></i></div>
            <h3>Comienza a crear</h3>
            <p>Diseña desde cero o importa un documento existente para añadirle interactividad.</p>
            <div
              class="button-group mt-4"
              style="display: flex; flex-direction: column; gap: 10px; align-items: center"
            >
              <button class="btn-primary large-btn w-100" @click="showNewProjectModal = true">
                <i class="ph ph-file-plus"></i> Proyecto en Blanco
              </button>
              <div class="divider-text" style="color: #8b949e; font-size: 0.9rem; margin: 5px 0">
                o
              </div>
              <label
                class="btn-secondary large-btn w-100"
                style="margin: 0; text-align: center; display: flex"
              >
                <input
                  type="file"
                  @change="handleFileUpload"
                  accept=".pdf, .pptx, .ppsx, .potx, .html"
                  hidden
                />
                <i class="ph ph-upload-simple"></i> Subir PDF / PPTX / HTML
              </label>
            </div>
          </div>
        </div>

        <div
          v-if="showNewProjectModal"
          class="loading-overlay"
          style="z-index: 10001; backdrop-filter: blur(5px)"
        >
          <div class="new-project-modal">
            <div class="modal-header">
              <h3>Crear Nuevo Proyecto</h3>
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

            <div class="prop-group mt-4">
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
                class="info-box mt-2"
                style="
                  font-size: 0.75rem;
                  background: rgba(88, 166, 255, 0.1);
                  border-left: 2px solid #58a6ff;
                  padding: 8px;
                "
              >
                <i class="ph ph-info"></i> Diseña la Diapositiva 1. Al añadir nuevas diapositivas,
                se duplicará su diseño y elementos actuando como maestro.
              </div>
            </div>

            <div class="modal-actions mt-4 pt-4">
              <button class="btn-ghost" @click="showNewProjectModal = false">Cancelar</button>
              <button class="btn-primary" @click="confirmCreateProject">Crear Proyecto</button>
            </div>
          </div>
        </div>

        <aside class="pro-sidebar right-sidebar" v-if="hasDoc && !playMode">
          <div class="panel-header">Propiedades</div>

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
            <div class="element-header">
              <div class="badge-type">
                <i :class="`ph ${getIconClassForType(selectedElement.type)}`"></i>
                {{ selectedElement.type.toUpperCase() }}
              </div>
              <button class="btn-icon-danger" @click="deleteSelected" title="Eliminar Elemento">
                <i class="ph ph-trash"></i>
              </button>
            </div>

            <div class="prop-section" v-if="selectedElement.groupId">
              <div class="section-title">En Grupo</div>
              <button class="btn-secondary w-100" @click="ungroupElements">
                <i class="ph ph-exclude"></i> Desagrupar Elemento
              </button>
            </div>

            <div class="prop-section" v-if="selectedElement.type !== 'draw'">
              <div class="section-title">Animación (Entrada)</div>
              <div class="prop-group mb-0">
                <select v-model="selectedElement.animation" class="pro-input">
                  <option value="none">Ninguna</option>
                  <option value="fade-in">Desvanecer (Fade In)</option>
                  <option value="slide-in">Entrar desde abajo</option>
                  <option value="bounce">Rebote</option>
                </select>
              </div>
            </div>

            <div
              class="prop-section"
              v-if="!['audio', 'interactive'].includes(selectedElement.type)"
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
                  <label>Alto (H)</label
                  ><input
                    type="number"
                    v-model="selectedElement.height"
                    class="pro-input"
                    :disabled="
                      [
                        'text',
                        'list',
                        'checkbox',
                        'accordion',
                        'arrow',
                        'rating',
                        'codeblock',
                      ].includes(selectedElement.type)
                    "
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

            <div class="prop-section">
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

            <template v-if="selectedElement.type === 'mindmap'">
              <div class="prop-section">
                <div class="section-title">Diseño del Mapa Mental</div>
                <div class="prop-row">
                  <div class="prop-group half">
                    <label>Color Líneas</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.lineColor"
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

              <div class="prop-section" style="border-color: #58a6ff" v-if="activeMapNodeId">
                <div class="section-title" style="color: #58a6ff">
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
                        v-model="activeMapNode.bgColor"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                  <div class="prop-group half">
                    <label>Color Texto</label>
                    <div class="color-picker-wrapper">
                      <input type="color" v-model="activeMapNode.color" class="pro-color-picker" />
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
              <div class="prop-section empty-state" v-else style="padding: 20px 10px">
                <i class="ph ph-hand-pointing" style="font-size: 2rem"></i>
                <p style="margin-top: 10px; font-size: 0.8rem">
                  Haz clic en un nodo del mapa para editarlo.
                </p>
              </div>
            </template>

            <template v-if="selectedElement.type === 'table'">
              <div class="prop-section">
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
                        v-model="selectedElement.color"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                  <div class="prop-group half">
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

                <div class="prop-row">
                  <div class="prop-group half">
                    <label>Fondo Cabecera</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.headerBgColor"
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
                        v-model="selectedElement.rowBgColor1"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                  <div class="prop-group half">
                    <label>Fondo Impares</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.rowBgColor2"
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

              <div class="prop-section">
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

            <template v-if="selectedElement.type === 'list'">
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
                        v-model="selectedElement.color"
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

            <template v-if="selectedElement.type === 'checkbox'">
              <div class="prop-section">
                <div class="section-title">Lista de Tareas</div>
                <div
                  v-for="(item, idx) in selectedElement.items"
                  :key="idx"
                  class="accordion-edit-item"
                >
                  <input type="checkbox" v-model="item.checked" style="accent-color: #58a6ff" />
                  <input
                    type="text"
                    v-model="item.text"
                    class="pro-input mb-0"
                    placeholder="Tarea..."
                    style="padding: 4px 8px"
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
                        v-model="selectedElement.color"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                  <div class="prop-group half">
                    <label>Color Check ✅</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.checkedColor"
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

            <template v-if="['text', 'sticky'].includes(selectedElement.type)">
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
                <div class="prop-group" v-if="selectedElement.type === 'sticky'">
                  <label>Color Papel</label>
                  <div class="color-picker-wrapper">
                    <input
                      type="color"
                      v-model="selectedElement.textBgColor"
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

            <template v-if="selectedElement.type === 'codeblock'">
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

            <template v-if="['shape', 'icon', 'arrow'].includes(selectedElement.type)">
              <div class="prop-section">
                <div class="section-title">Estilo Visual</div>

                <div class="prop-group" v-if="selectedElement.type === 'icon'">
                  <label>Nombre (Phosphor Icons)</label>
                  <input
                    type="text"
                    v-model="selectedElement.iconName"
                    class="pro-input"
                    placeholder="ej: heart"
                  />
                  <a
                    href="https://phosphoricons.com/"
                    target="_blank"
                    class="help-link mt-1"
                    style="display: block; font-size: 10px; color: #58a6ff"
                    >Ver catálogo ↗</a
                  >
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
                        v-model="selectedElement.color"
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
                      v-model="selectedElement.bgColor"
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
                        v-model="selectedElement.color"
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
                        v-model="selectedElement.gradientColor"
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
                        v-model="selectedElement.bgColor"
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
                        v-model="selectedElement.borderColor"
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

            <template v-if="selectedElement.type === 'rating'">
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
                        v-model="selectedElement.color"
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

            <template v-if="selectedElement.type === 'timer'">
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
                        v-model="selectedElement.color"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
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

            <template v-if="selectedElement.type === 'progress'">
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
                        v-model="selectedElement.color"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                  <div class="prop-group half">
                    <label>Color Carril</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.bgColor"
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

            <template v-if="selectedElement.type === 'qrcode'">
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
                        v-model="selectedElement.color"
                        class="pro-color-picker"
                      />
                    </div>
                  </div>
                  <div class="prop-group half">
                    <label>Fondo QR</label>
                    <div class="color-picker-wrapper">
                      <input
                        type="color"
                        v-model="selectedElement.bgColor"
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
              v-if="['image', 'video', 'iframe', '3d', 'magnifier'].includes(selectedElement.type)"
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
                      v-model="selectedElement.borderColor"
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

            <template v-if="selectedElement.type === 'draw'">
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

            <template v-if="['chart', 'poll'].includes(selectedElement.type)">
              <div class="prop-section">
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
                    selectedElement.chartData.push({ label: 'Nuevo', value: 50, color: '#3b82f6' })
                  "
                >
                  <i class="ph ph-plus"></i> Añadir Fila
                </button>
              </div>
            </template>

            <template v-if="selectedElement.type === 'audio'">
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

            <template v-if="selectedElement.type === 'interactive'">
              <div class="prop-section">
                <div class="section-title">Hotspot Interactivo</div>
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

            <template v-if="selectedElement.type === 'link'">
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
                      v-model="selectedElement.borderColor"
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
              <div class="section-title">Fondo Base y Transición</div>
              <div class="prop-group mt-2">
                <label>Transición de Entrada</label>
                <select v-model="slideConfigs[pageNum].transition" class="pro-input">
                  <option value="none">Ninguna</option>
                  <option value="fade">Desvanecer (Fade)</option>
                  <option value="slide">Deslizar (Slide)</option>
                  <option value="zoom">Acercar (Zoom)</option>
                </select>
              </div>
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
import EditorHeader from '@/components/EditorHeader.vue'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString()

// --- ESTADO GENERAL ---
const pdfCanvas = ref<HTMLCanvasElement | null>(null)
const workspaceRef = ref<HTMLElement | null>(null)

let _RAW_PDF_DOC: any = null
let _PDF_BASE64_STORE: string = ''
let timerInterval: ReturnType<typeof setInterval> | null = null

const docType = ref<'pdf' | 'blank'>('blank')
const hasDoc = ref(false)
const playMode = ref(false)
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
  | 'list'
  | 'checkbox'
  | 'table'
  | '3d'
  | 'interactive'
  | 'image'
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
  | 'poll'
  | 'rating'
const activeTool = ref<ToolType>('select')
const baseWidth = ref(1280)
const baseHeight = ref(720)

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

const currentPageElements = computed(() => documentState.value[pageNum.value] || [])
const selectedElement = computed(() =>
  selectedElementIds.value.length === 1
    ? currentPageElements.value.find((el) => el.id === selectedElementIds.value[0])
    : null,
)

const currentBgColor = computed(() => slideConfigs.value[pageNum.value]?.bgColor || '#ffffff')
const currentBgImage = computed(() =>
  slideConfigs.value[pageNum.value]?.bgImage
    ? `url(${slideConfigs.value[pageNum.value].bgImage})`
    : 'none',
)
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
  audio: 'ph-speaker-high',
  qrcode: 'ph-qr-code',
  progress: 'ph-sliders-horizontal',
  timer: 'ph-timer',
  codeblock: 'ph-code',
  magnifier: 'ph-magnifying-glass',
  poll: 'ph-chart-pie-slice',
  rating: 'ph-star-half',
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
    bgColor: '#2563eb',
    color: '#ffffff',
    borderRadius: 6,
    borderWidth: 0,
    borderColor: '#ffffff',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: 14,
    fontWeight: '600',
    animation: 'none',
  },
  accordion: {
    name: 'Acordeón',
    width: 320,
    height: 'auto',
    bgColor: '#ffffff',
    color: '#334155',
    items: [{ title: 'Sección 1', content: 'Detalle...', isOpen: false }],
    animation: 'none',
  },
  text: {
    name: 'Texto',
    width: 300,
    height: 'auto',
    content: 'Escribe aquí...',
    color: '#1e293b',
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
    animation: 'none',
  },
  list: {
    name: 'Lista',
    width: 300,
    height: 'auto',
    items: ['Elemento 1', 'Elemento 2', 'Elemento 3'],
    listType: 'ul',
    bulletStyle: 'disc',
    color: '#1e293b',
    fontSize: 24,
    fontWeight: '400',
    fontFamily: 'Helvetica, Arial, sans-serif',
    itemSpacing: 10,
    animation: 'none',
  },
  checkbox: {
    name: 'Tareas',
    width: 300,
    height: 'auto',
    items: [
      { text: 'Tarea 1', checked: false },
      { text: 'Tarea 2', checked: true },
    ],
    checkedColor: '#10b981',
    color: '#1e293b',
    fontSize: 20,
    fontWeight: '400',
    fontFamily: 'Helvetica, Arial, sans-serif',
    itemSpacing: 12,
    strikeThrough: true,
    animation: 'none',
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
    color: '#334155',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    headerBgColor: '#f1f5f9',
    rowBgColor1: '#ffffff',
    rowBgColor2: '#f8fafc',
    fontSize: 16,
    fontFamily: 'Helvetica, Arial, sans-serif',
    textAlign: 'left',
    borderRadius: 8,
    animation: 'none',
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
    animation: 'none',
    boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
  },
  mindmap: {
    name: 'Mapa Mental',
    width: 600,
    height: 400,
    lineColor: '#94a3b8',
    lineWidth: 2,
    fontFamily: 'Helvetica, Arial, sans-serif',
    animation: 'none',
    nodes: [
      {
        id: 'm1',
        text: 'Tema Central',
        parentId: null,
        bgColor: '#3b82f6',
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
    bgColor: '#f1f5f9',
    gradientType: 'none',
    gradientColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#cbd5e1',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    isGlass: false,
    animation: 'none',
  },
  arrow: {
    name: 'Flecha',
    width: 200,
    height: 'auto',
    color: '#64748b',
    strokeWidth: 3,
    arrowHead: 'end',
    animation: 'none',
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
    animation: 'none',
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
    animation: 'none',
  },
  '3d': {
    name: 'Modelo 3D',
    width: 300,
    height: 300,
    src: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    autoRotate: true,
    cameraControls: true,
    envImage: '',
    animation: 'none',
  },
  interactive: {
    name: 'Hotspot',
    width: 40,
    height: 40,
    color: '#3b82f6',
    modalTitle: 'Info',
    contentHtml: '<p>Edita el HTML.</p>',
    isOpen: false,
    modalBgColor: '#ffffff',
    modalTextColor: '#1e293b',
    animation: 'none',
  },
  icon: {
    name: 'Icono',
    width: 64,
    height: 64,
    color: '#475569',
    bgColor: 'transparent',
    borderRadius: 0,
    iconName: 'star',
    fontSize: 64,
    animation: 'none',
  },
  chart: {
    name: 'Gráfico',
    width: 400,
    height: 300,
    color: '#334155',
    bgColor: '#ffffff',
    chartType: 'bar',
    chartTitle: 'Datos',
    showValues: true,
    showLegend: true,
    borderRadius: 12,
    chartData: [
      { label: 'Q1', value: 30, color: '#3b82f6' },
      { label: 'Q2', value: 60, color: '#10b981' },
      { label: 'Q3', value: 40, color: '#f59e0b' },
    ],
    animation: 'none',
  },
  iframe: {
    name: 'Iframe',
    width: 400,
    height: 300,
    src: '',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    animation: 'none',
  },
  audio: {
    name: 'Audio',
    width: 160,
    height: 48,
    src: '',
    bgColor: '#1e293b',
    color: '#ffffff',
    borderRadius: 24,
    loop: false,
    autoplay: false,
    isPlaying: false,
    animation: 'none',
    variant: 'pill',
  },
  draw: {
    name: 'Pizarra',
    width: 400,
    height: 300,
    brushSize: 4,
    brushColor: '#ef4444',
    lines: [],
    animation: 'none',
  },
  qrcode: {
    name: 'Código QR',
    width: 150,
    height: 150,
    qrUrl: 'https://',
    color: '#0f172a',
    bgColor: '#ffffff',
    borderRadius: 8,
    animation: 'none',
  },
  progress: {
    name: 'Progreso',
    width: 300,
    height: 12,
    progress: 50,
    color: '#3b82f6',
    bgColor: '#e2e8f0',
    borderRadius: 6,
    animation: 'none',
  },
  timer: {
    name: 'Temporizador',
    width: 180,
    height: 60,
    duration: 5,
    color: '#1e293b',
    bgColor: '#f8fafc',
    fontSize: 36,
    borderRadius: 8,
    animation: 'none',
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
    animation: 'none',
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
    animation: 'none',
  },
  poll: {
    name: 'Encuesta',
    width: 350,
    height: 'auto',
    color: '#334155',
    bgColor: '#ffffff',
    chartTitle: 'Resultados',
    borderRadius: 12,
    chartData: [
      { label: 'Opción A', value: 65, color: '#3b82f6' },
      { label: 'Opción B', value: 35, color: '#e2e8f0' },
    ],
    animation: 'none',
  },
  rating: {
    name: 'Puntuación',
    width: 200,
    height: 'auto',
    rating: 3,
    maxStars: 5,
    color: '#f59e0b',
    fontSize: 32,
    animation: 'none',
    isInteractive: true,
  },
}

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

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  if (timerInterval) clearInterval(timerInterval)
})

const handleGlobalKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && playMode.value) togglePlayMode()
  if (playMode.value && ['ArrowRight', ' ', 'ArrowLeft'].includes(e.key)) {
    e.preventDefault()
    changePageTo(pageNum.value + (e.key === 'ArrowLeft' ? -1 : 1))
  }
}

// --- UTILS ---
const YT_REGEX = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
const isYouTube = (url: string) => url && YT_REGEX.test(url)
const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(YT_REGEX)
  return match && match[1] ? `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0` : ''
}
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

const processPdfFile = async (file: File | Blob) => {
  docType.value = 'pdf'
  const reader = new FileReader()
  reader.onload = async (e) => {
    _PDF_BASE64_STORE = (e.target?.result as string).split(',')[1]
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
    _RAW_PDF_DOC = markRaw(await loadingTask.promise)
    numPages.value = _RAW_PDF_DOC.numPages
    hasDoc.value = true
    documentState.value = {}
    slideConfigs.value = {}
    pdfPageMap.value = {}
    pdfThumbnails.value = {}
    initializeConfigs()
    await generatePdfThumbnails()
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
      const response = await fetch(
        `https://v2.convertapi.com/convert/pptx/to/pdf?Secret=DxcAISlmv67N1pyEtVKUVPh1Y56Y20FQ`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Parameters: [
              {
                Name: 'File',
                FileValue: { Name: file.name, Data: (reader.result as string).split(',')[1] },
              },
            ],
          }),
        },
      )
      if (!response.ok) throw new Error('Fallo API')
      const pdfBase64 = (await response.json()).Files[0].FileData
      const byteChars = atob(pdfBase64)
      const byteNums = new Uint8Array(byteChars.length)
      for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i)
      await processPdfFile(new Blob([byteNums], { type: 'application/pdf' }))
    } catch {
      alert('Error al convertir el PowerPoint. Verifica tu API Key.')
    } finally {
      isConverting.value = false
    }
  }
}

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
        docType.value = (docTypeMatch ? docTypeMatch[1] : 'blank') as 'pdf' | 'blank'
      }

      const pdfDataNode = doc.getElementById('app-pdf-data')
      _PDF_BASE64_STORE = pdfDataNode?.textContent || ''

      numPages.value = Math.max(...Object.keys(documentState.value).map(Number), 1)
      pageNum.value = 1
      hasDoc.value = true

      if (docType.value === 'pdf' && _PDF_BASE64_STORE) {
        const pdfData = atob(_PDF_BASE64_STORE)
        const uint8Array = new Uint8Array(pdfData.length)
        for (let i = 0; i < pdfData.length; i++) uint8Array[i] = pdfData.charCodeAt(i)

        const loadingTask = pdfjsLib.getDocument({ data: uint8Array })
        _RAW_PDF_DOC = markRaw(await loadingTask.promise)
        await generatePdfThumbnails()
      } else {
        _RAW_PDF_DOC = null
        pdfThumbnails.value = {}
      }

      await renderPage(1)
      setTimeout(fitToScreen, 100)
    } catch (error) {
      console.error(error)
      alert('Error al importar. ¿Estás seguro de que es un archivo exportado por PresentPro?')
    }
  }
  reader.readAsText(file)
}

const renderPage = async (num: number) => {
  await nextTick()
  const canvas = pdfCanvas.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return

  const actualPdfPage = pdfPageMap.value[num]
  if (
    docType.value === 'pdf' &&
    _RAW_PDF_DOC &&
    actualPdfPage > 0 &&
    actualPdfPage <= _RAW_PDF_DOC.numPages
  ) {
    const page = await _RAW_PDF_DOC.getPage(actualPdfPage)
    const viewport = page.getViewport({ scale: 1.0 })
    baseWidth.value = viewport.width
    baseHeight.value = viewport.height
    const dpr = window.devicePixelRatio || 2
    canvas.width = viewport.width * dpr
    canvas.height = viewport.height * dpr
    canvas.style.width = `${viewport.width}px`
    canvas.style.height = `${viewport.height}px`
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvasContext: ctx, viewport }).promise
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

// --- CREACIÓN DE PROYECTO (MODAL) ---
const confirmCreateProject = () => {
  _RAW_PDF_DOC = null
  _PDF_BASE64_STORE = ''
  docType.value = 'blank'
  numPages.value = 1
  pageNum.value = 1

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

  documentState.value = {}
  slideConfigs.value = {}
  pdfPageMap.value = {}
  pdfThumbnails.value = {}

  applyTemplate(projectConfigs.value.template)

  initializeConfigs()
  hasDoc.value = true
  showNewProjectModal.value = false
  renderPage(1)
  setTimeout(fitToScreen, 100)
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
    ...(ELEMENT_DEFAULTS[type] || {}),
    ...overrides,
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
        height: 8,
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
  if (numPages.value <= 1) return alert('No puedes eliminar la única diapositiva del proyecto.')
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
  numPages.value += 1

  if (isCustomTemplateMode.value) {
    const masterElements = documentState.value[1] || []
    const masterConfig = slideConfigs.value[1] || {
      bgColor: '#ffffff',
      bgImage: null,
      transition: 'none',
    }

    documentState.value[numPages.value] = JSON.parse(JSON.stringify(masterElements)).map(
      (el: any) => ({
        ...el,
        id: `el_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      }),
    )
    slideConfigs.value[numPages.value] = JSON.parse(JSON.stringify(masterConfig))
  } else {
    documentState.value[numPages.value] = []
    slideConfigs.value[numPages.value] = { bgColor: '#ffffff', bgImage: null, transition: 'none' }
  }

  pdfPageMap.value[numPages.value] = 0 // Lienzo en blanco
  changePageTo(numPages.value)
}

const changePageTo = async (num: number) => {
  if (num >= 1 && num <= numPages.value) {
    pageNum.value = num
    selectedElementIds.value = []
    renderTrigger.value++
    activeTransition.value = 'none'
    await nextTick()
    if (workspaceRef.value) void workspaceRef.value.offsetWidth
    activeTransition.value = slideConfigs.value[num]?.transition || 'none'
    renderPage(num)
  }
}
const changeZoom = (delta: number) => (zoom.value = Math.max(0.2, Math.min(zoom.value + delta, 4)))

const fitToScreen = () => {
  if (workspaceRef.value) {
    // Calculamos el zoom para que entre perfectamente a lo ancho Y a lo alto dejando un pequeño margen
    const scaleX = (workspaceRef.value.clientWidth - 60) / baseWidth.value
    const scaleY = (workspaceRef.value.clientHeight - 60) / baseHeight.value
    zoom.value = Math.max(0.1, Math.min(scaleX, scaleY))
  }
}

// --- CREACIÓN Y SELECCIÓN DE ELEMENTOS ---
const handleCanvasClick = (e: MouseEvent) => {
  if (playMode.value || activeTool.value === 'select') {
    selectedElementIds.value = []
    activeMapNodeId.value = null
    return
  }
  const rect = (e.target as HTMLElement).getBoundingClientRect()

  const newElement = {
    id: `el_${Date.now()}`,
    x: (e.clientX - rect.left) / zoom.value,
    y: (e.clientY - rect.top) / zoom.value,
    type: activeTool.value,
    opacity: 1,
    rotation: 0,
    mixBlendMode: 'normal',
    isHidden: false,
    isLocked: false,
    groupId: null,
    ...(ELEMENT_DEFAULTS[activeTool.value] || {}),
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

// --- ARRASTRE Y REDIMENSIÓN ---
let isDragging = false,
  isResizing = false,
  startX = 0,
  startY = 0,
  initialPositions: any[] = [],
  initialWidth = 0,
  initialHeight = 0
const startDrag = (e: MouseEvent, el: any, isHandle: boolean = false) => {
  if (playMode.value || isResizing || el.isLocked || (el.type === 'draw' && !isHandle)) return
  e.preventDefault()

  if (!selectedElementIds.value.includes(el.id)) selectElement(el.id, e)
  if (activeTool.value !== 'select') return

  isDragging = true
  startX = e.clientX
  startY = e.clientY

  const draggedEls = currentPageElements.value.filter(
    (e) => selectedElementIds.value.includes(e.id) && !e.isLocked,
  )
  initialPositions = draggedEls.map((e) => ({ id: e.id, startX: e.x, startY: e.y }))

  const onMouseMove = (moveEvent: MouseEvent) => {
    if (!isDragging) return
    const dx = (moveEvent.clientX - startX) / zoom.value
    const dy = (moveEvent.clientY - startY) / zoom.value
    draggedEls.forEach((elem) => {
      const initPos = initialPositions.find((p) => p.id === elem.id)
      if (initPos) {
        elem.x = initPos.startX + dx
        elem.y = initPos.startY + dy
      }
    })
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
  if (playMode.value || el.isLocked) return
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

// --- PLAY MODE & TIMERS ---
const togglePlayMode = async () => {
  playMode.value = !playMode.value
  selectedElementIds.value = []
  renderTrigger.value++

  if (timerInterval) clearInterval(timerInterval)

  Object.values(documentState.value).forEach((pageItems) => {
    pageItems.forEach((el) => {
      if (el.type === 'interactive') el.isOpen = false
      if (el.type === 'accordion') el.items.forEach((item: any) => (item.isOpen = false))
      if (el.type === 'timer') {
        el.timeLeft = el.duration * 60
        el.isRunning = playMode.value
      }
      if (el.type === 'audio') {
        el.isPlaying = false
        const a = document.querySelector(`audio[src="${el.src}"]`) as HTMLAudioElement
        if (a) {
          a.pause()
          if (playMode.value && el.autoplay)
            a.play()
              .then(() => (el.isPlaying = true))
              .catch(() => {})
        }
      }
    })
  })

  if (playMode.value) {
    activeTransition.value = slideConfigs.value[pageNum.value]?.transition || 'none'
    timerInterval = setInterval(() => {
      Object.values(documentState.value).forEach((pageItems) => {
        pageItems.forEach((el) => {
          if (el.type === 'timer' && el.isRunning && el.timeLeft > 0) el.timeLeft--
        })
      })
    }, 1000)
  } else {
    activeTransition.value = 'none'
  }

  await nextTick()
  fitToScreen()
}

// --- EXPORTACIÓN HTML ---
const exportPresentation = () => {
  if (Object.keys(documentState.value).length === 0 && !_RAW_PDF_DOC && docType.value === 'blank')
    return alert('El proyecto está vacío.')

  const safeJson = (data: any) =>
    JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')

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

    .slide-trans-fade { animation: transFade 0.6s ease-out forwards; }
    .slide-trans-slide { animation: transSlide 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
    .slide-trans-zoom { animation: transZoom 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
    @keyframes transFade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes transSlide { from { translate: 50px 0; opacity: 0; } to { translate: 0 0; opacity: 1; } }
    @keyframes transZoom { from { scale: 0.95; opacity: 0; } to { scale: 1; opacity: 1; } }
    .anim-fade-in { animation: animFadeIn 0.8s ease-out both; }
    .anim-slide-in { animation: animSlideIn 0.8s cubic-bezier(0.25, 1, 0.5, 1) both; }
    .anim-bounce { animation: animBounce 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
    @keyframes animFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes animSlideIn { from { translate: 0 50px; opacity: 0; } to { translate: 0 0; opacity: 1; } }
    @keyframes animBounce { 0% { scale: 0.5; opacity: 0; } 50% { scale: 1.05; opacity: 1; } 100% { scale: 1; opacity: 1; } }
  </style>
</head>
<body>
  <script type="application/json" id="app-meta-data">{"baseWidth": ${baseWidth.value}, "baseHeight": ${baseHeight.value}, "docType": "${docType.value}"}<\/script>
  <script type="application/json" id="app-state-data">${safeJson(documentState.value)}<\/script>
  <script type="application/json" id="app-configs-data">${safeJson(slideConfigs.value)}<\/script>
  <script type="application/json" id="app-pdf-map">${safeJson(pdfPageMap.value)}<\/script>
  <script type="application/json" id="app-pdf-data">${_PDF_BASE64_STORE}<\/script>

  <div id="app">
    <div class="canvas-wrapper play-mode-active" :style="{ width: baseWidth + 'px', height: baseHeight + 'px', transform: 'scale(' + zoom + ')' }">
      <div class="canvas-shadow-box layer-engine" :class="activeTransition !== 'none' ? 'slide-trans-' + activeTransition : ''" :style="{ width: '100%', height: '100%', backgroundColor: currentBgColor, backgroundImage: currentBgImage, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }">
          <canvas ref="pdfCanvas" class="layer-pdf" v-show="docType === 'pdf'"></canvas>
          
          <div v-for="(el, index) in currentPageElements" :key="el.id + renderTrigger" class="interactive-element is-clickable"
               v-show="!el.isHidden"
               :class="el.animation && el.animation !== 'none' ? 'anim-' + el.animation : ''"
               :style="{ left: el.x + 'px', top: el.y + 'px', width: el.width + 'px', height: (el.height === 'auto' ? 'auto' : el.height + 'px'), zIndex: index + 10, opacity: el.opacity ?? 1, transform: 'rotate(' + (el.rotation || 0) + 'deg)', animationDelay: el.animation && el.animation !== 'none' ? (index * 0.1) + 's' : '0s', mixBlendMode: el.mixBlendMode || 'normal' }">
            
            <div v-if="el.type === 'text' || el.type === 'sticky'" class="el-text" :style="{ color: el.color, fontSize: el.fontSize + 'px', fontWeight: el.fontWeight, fontFamily: el.fontFamily, fontStyle: el.fontStyle, textAlign: el.textAlign, textTransform: el.textTransform || 'none', textDecoration: el.textDecoration || 'none', lineHeight: el.lineHeight || 1.2, letterSpacing: (el.letterSpacing || 0) + 'px', textShadow: el.textShadow || 'none', backgroundColor: el.textBgColor || 'transparent', padding: el.textBgColor !== 'transparent' ? '15px' : '0', borderRadius: el.type === 'sticky' ? '0 0 16px 4px' : '4px', boxShadow: el.boxShadow || 'none' }">{{ el.content }}</div>

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
              <div v-for="(item, idx) in el.items" :key="idx" style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; transition: opacity 0.2s;" :style="{ opacity: item.checked ? 0.6 : 1 }" @click.stop="item.checked = !item.checked">
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
              <img v-if="el.src" :src="el.src" class="el-content-fitted" :style="{ objectFit: el.fit }" />
            </div>

            <div v-else-if="el.type === 'qrcode'" style="width: 100%; height: 100%; padding: 10px; box-sizing: border-box; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" :style="{ backgroundColor: el.bgColor, borderRadius: (el.borderRadius || 0) + 'px' }">
              <img :src="'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=' + encodeURIComponent(el.qrUrl || 'https://google.com') + '&color=' + el.color.replace('#','') + '&bgcolor=' + el.bgColor.replace('#','')" style="width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply;" draggable="false" />
            </div>

            <div v-else-if="el.type === 'progress'" style="width: 100%; height: 100%; overflow: hidden;" :style="{ backgroundColor: el.bgColor, borderRadius: (el.borderRadius || 0) + 'px' }">
              <div :style="{ width: (el.progress || 0) + '%', backgroundColor: el.color, height: '100%', transition: 'width 0.5s ease' }"></div>
            </div>

            <div v-else-if="el.type === 'rating'" class="el-rating" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;" :style="{ color: el.color, fontSize: el.fontSize + 'px' }">
               <span v-for="s in el.maxStars" :key="s" @click.stop="el.isInteractive ? el.rating = s : null" :style="{ cursor: el.isInteractive ? 'pointer' : 'default', opacity: s <= el.rating ? 1 : 0.25, transition: '0.2s' }">★</span>
            </div>

            <div v-else-if="el.type === 'timer'" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-variant-numeric: tabular-nums;"
                 :style="{ backgroundColor: el.bgColor, color: el.color, borderRadius: (el.borderRadius || 0) + 'px', fontSize: (el.fontSize || 48) + 'px' }">
              {{ formatTime(el.timeLeft !== undefined ? el.timeLeft : el.duration * 60) }}
            </div>

            <div v-else-if="el.type === 'magnifier'" class="el-magnifier" :style="{ borderRadius: '50%', border: (el.borderWidth || 4) + 'px solid ' + (el.borderColor || '#fff'), overflow: 'hidden', width: '100%', height: '100%', boxShadow: el.boxShadow || '0 10px 25px rgba(0,0,0,0.5)' }">
              <div v-if="el.src" :style="{ width: '100%', height: '100%', backgroundImage: 'url(' + el.src + ')', backgroundSize: (el.zoomLevel * 100) + '%', backgroundPosition: el.focusX + '% ' + el.focusY + '%', backgroundRepeat: 'no-repeat' }"></div>
              <div v-else class="placeholder-box" style="border-radius: 50%"><i class="ph ph-magnifying-glass"></i></div>
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

            <div v-else-if="el.type === 'audio'" class="el-audio-wrapper" @click.stop="playAudio(el)" :style="{ width: '100%', height: '100%' }">
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
              <audio v-if="el.src" :ref="'audio_'+el.id" :src="el.src" :loop="el.loop" :autoplay="playMode && el.autoplay"></audio>
            </div>

            <div v-else-if="el.type === 'link'" class="el-link" 
                 :style="{ backgroundColor: el.bgColor, color: el.color, borderRadius: el.borderRadius + 'px', border: (el.borderWidth || 0) + 'px solid ' + (el.borderColor || '#000'), fontSize: (el.fontSize || 16) + 'px', fontWeight: el.fontWeight || 'bold', fontFamily: el.fontFamily || 'Arial', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }"
                 @click.stop="changePageTo(el.targetPage)">
              {{ el.text }}
            </div>

            <div v-else-if="el.type === 'accordion'" class="el-accordion" :style="{ backgroundColor: el.bgColor, color: el.color, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }">
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
        
        const baseWidth = ref(\${baseWidth.value}); const baseHeight = ref(\${baseHeight.value}); const docType = ref('\${docType.value}');
        const pageNum = ref(1); const numPages = ref(Math.max(...Object.keys(documentState.value).map(Number), 1)); const zoom = ref(1.0);
        
        const renderTrigger = ref(0); const activeTransition = ref('none');

        const currentPageElements = computed(() => documentState.value[pageNum.value] || []);
        const currentBgColor = computed(() => slideConfigs.value[pageNum.value]?.bgColor || '#ffffff');
        const currentBgImage = computed(() => slideConfigs.value[pageNum.value]?.bgImage ? 'url(' + slideConfigs.value[pageNum.value].bgImage + ')' : 'none');

        const isYouTube = (url) => url && url.match(/(?:youtu\\.be\\/|youtube\\.com\\/(?:embed\\/|v\\/|watch\\?v=|watch\\?.+&v=))([\\w-]{11})/);
        const getYouTubeEmbedUrl = (url) => {
          const match = url.match(/(?:youtu\\.be\\/|youtube\\.com\\/(?:embed\\/|v\\/|watch\\?v=|watch\\?.+&v=))([\\w-]{11})/);
          return match && match[1] ? 'https://www.youtube-nocookie.com/embed/' + match[1] + '?rel=0' : '';
        };

        const formatTime = (seconds) => {
          const m = Math.floor(seconds / 60).toString().padStart(2, '0');
          const s = (seconds % 60).toString().padStart(2, '0');
          return m + ':' + s;
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

        const fitToScreen = () => { zoom.value = Math.min(window.innerWidth / baseWidth.value, window.innerHeight / baseHeight.value) * 0.95; };

        let pdfDoc = null; const pdfCanvas = ref(null);
        
        const initPdf = async () => {
            if (docType.value === 'pdf' && rawPdfB64) {
                const pdfData = atob(rawPdfB64);
                const uint8Array = new Uint8Array(pdfData.length);
                for (let i = 0; i < pdfData.length; i++) uint8Array[i] = pdfData.charCodeAt(i);
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
                pdfDoc = await pdfjsLib.getDocument({ data: uint8Array }).promise;
                renderPdfPage(pageNum.value);
            }
        };

        const renderPdfPage = async (num) => {
            await nextTick();
            if (docType.value !== 'pdf' || !pdfDoc || !pdfCanvas.value) return;
            const canvas = pdfCanvas.value; const ctx = canvas.getContext('2d'); const dpr = window.devicePixelRatio || 2;
            const actualPdfPage = pdfPageMap.value[num];
            if (!actualPdfPage || actualPdfPage <= 0 || actualPdfPage > pdfDoc.numPages) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
            const page = await pdfDoc.getPage(actualPdfPage);
            const viewport = page.getViewport({ scale: 1.0 });
            canvas.width = viewport.width * dpr; canvas.height = viewport.height * dpr;
            canvas.style.width = viewport.width + 'px'; canvas.style.height = viewport.height + 'px';
            ctx.scale(dpr, dpr);
            await page.render({ canvasContext: ctx, viewport }).promise;
        }

        const closeAllInteractives = () => {
          Object.values(documentState.value).forEach(pageItems => {
            pageItems.forEach(el => {
              if(el.type === 'interactive') el.isOpen = false;
              if(el.type === 'accordion') el.items.forEach(item => item.isOpen = false);
              if(el.type === 'audio') { el.isPlaying = false; const a = document.querySelector('audio[src="'+el.src+'"]'); if(a) a.pause(); }
            });
          });
        };

        const changePageTo = async (num) => {
          if(num >= 1 && num <= numPages.value) {
            pageNum.value = num; closeAllInteractives();
            renderTrigger.value++;
            activeTransition.value = 'none';
            await nextTick();
            void document.body.offsetWidth; // force reflow
            activeTransition.value = slideConfigs.value[num]?.transition || 'none';
            
            // Reiniciar temporizadores
            Object.values(documentState.value).forEach(pageItems => {
              pageItems.forEach(el => { if (el.type === 'timer') { el.timeLeft = el.duration * 60; el.isRunning = true; } });
            });

            if(docType.value === 'pdf') renderPdfPage(num);
          }
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

        onMounted(() => {
          activeTransition.value = slideConfigs.value[1]?.transition || 'none';
          
          // Inicializar temporizadores al abrir
          Object.values(documentState.value).forEach(pageItems => {
            pageItems.forEach(el => { if (el.type === 'timer') { el.timeLeft = el.duration * 60; el.isRunning = true; } });
          });

          setInterval(() => {
            Object.values(documentState.value).forEach(pageItems => {
              pageItems.forEach(el => { if (el.type === 'timer' && el.isRunning && el.timeLeft > 0) el.timeLeft--; });
            });
          }, 1000);

          fitToScreen(); initPdf(); window.addEventListener('resize', fitToScreen);
          document.addEventListener('keydown', (e) => {
            if(['ArrowRight', ' '].includes(e.key)) { e.preventDefault(); changePageTo(pageNum.value + 1); }
            if(e.key === 'ArrowLeft') { e.preventDefault(); changePageTo(pageNum.value - 1); }
          });
        });

        return { 
          baseWidth, baseHeight, docType, zoom, pageNum, numPages, currentPageElements,
          currentBgColor, currentBgImage, pdfCanvas, changePageTo, triggerInteraction, isYouTube, 
          getYouTubeEmbedUrl, getChartValues, getChartMax, getPieGradient, playAudio, renderTrigger, activeTransition, formatTime, getNodesByParent, getNodeStyle
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
.pro-editor-app {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #0d1117;
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  overflow: hidden;
}
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
/* pro-header existe por el componente hijo pero lo dejamos listo por si acaso */
.pro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 48px;
  background-color: #161b22;
  border-bottom: 1px solid #30363d;
  padding: 0 16px;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
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
  color: #58a6ff;
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
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
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
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 45px;
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
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
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
.play-nav-overlay {
  position: fixed;
  bottom: 25px;
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
  width: 28px;
  height: 28px;
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
  background-color: #010409;
}
.pro-top-toolbar {
  display: flex;
  gap: 10px;
  padding: 6px 15px;
  background-color: #161b22;
  border-bottom: 1px solid #30363d;
  overflow-x: auto;
  flex-shrink: 0;
  align-items: center;
}
.pro-top-toolbar::-webkit-scrollbar {
  height: 4px;
}
.pro-top-toolbar::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 2px;
}
.toolbar-category {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-right: 1px solid #30363d;
  padding-right: 12px;
}
.toolbar-category:last-child {
  border-right: none;
  padding-right: 0;
}
.category-label {
  font-size: 0.6rem;
  font-weight: 600;
  color: #8b949e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.category-tools {
  display: flex;
  gap: 2px;
}
.tool-btn {
  font-size: 1.1rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #8b949e;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}
.tool-btn:hover {
  background: #21262d;
  color: #c9d1d9;
}
.tool-btn.active {
  background: rgba(88, 166, 255, 0.15);
  color: #58a6ff;
}

/* ÁREA DEL LIENZO */
.pro-canvas-area {
  flex: 1;
  position: relative;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: radial-gradient(#30363d 1px, transparent 1px);
  background-size: 20px 20px;
}

/* PANELES LATERALES MÁS COMPACTOS */
.pro-sidebar {
  width: 240px; /* Reducido de 280px para dar más espacio a la diapositiva */
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
  width: 280px; /* Reducido de 320px para equilibrar paneles */
}
.panel-header {
  padding: 12px 15px; /* Padding reducido */
  font-weight: 600;
  font-size: 0.8rem;
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
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
}
.sidebar-footer {
  padding: 12px 15px;
  border-top: 1px solid #30363d;
  background: #161b22;
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
  border-radius: 6px;
  padding: 6px;
  transition: background 0.2s;
}
.thumb-item:hover {
  background: #21262d;
}
.thumb-item.is-active {
  background: rgba(88, 166, 255, 0.1);
  border: 1px solid #58a6ff;
}
.thumb-num {
  font-size: 0.8rem;
  font-weight: bold;
  color: #8b949e;
  margin-top: 5px;
  min-width: 15px;
}
.thumb-item.is-active .thumb-num {
  color: #58a6ff;
}
.thumb-card-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.thumb-card {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 4px;
  border: 1px solid #30363d;
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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s;
  backdrop-filter: blur(2px);
}
.thumb-card:hover .thumb-actions {
  opacity: 1;
}
.thumb-action-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: #30363d;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  font-size: 0.8rem;
}
.thumb-action-btn:hover:not(:disabled) {
  background: #58a6ff;
  transform: scale(1.1);
}
.thumb-action-btn.btn-trash:hover:not(:disabled) {
  background: #ff7b72;
}
.thumb-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #30363d !important;
  color: #8b949e !important;
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
  color: #8b949e;
  border-radius: 4px;
  transition: 0.2s;
  border: 1px solid transparent;
}
.tree-child .icon {
  font-size: 0.9rem;
}
.tree-child:hover {
  background: #30363d;
  color: #c9d1d9;
}
.tree-child.is-selected {
  background: #58a6ff;
  color: #fff;
  font-weight: 500;
}
.drag-handle {
  cursor: grab;
  opacity: 0.5;
  font-size: 1rem;
}
.drag-handle:hover {
  opacity: 1;
  color: #fff;
}
.tree-child.drag-over {
  border-top: 2px solid #58a6ff;
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
  color: #8b949e;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 2px;
  border-radius: 4px;
  transition: 0.2s;
}
.layer-action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.layer-action-btn.is-active {
  color: #f59e0b;
}

.panel-content {
  padding: 15px; /* Reducido de 20px */
}
.empty-state {
  text-align: center;
  color: #8b949e;
  padding-top: 30px;
  font-size: 0.85rem;
}
.empty-icon-wrapper {
  width: 50px;
  height: 50px;
  background: #21262d;
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
  background: rgba(88, 166, 255, 0.15);
  color: #58a6ff;
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
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 12px; /* Reducido de 15px */
  margin-bottom: 12px; /* Reducido de 15px */
}
.section-title {
  color: #c9d1d9;
  font-weight: 600;
  font-size: 0.75rem;
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
  color: #8b949e;
  margin-bottom: 4px;
  font-weight: 500;
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
  background: #161b22;
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 6px 8px; /* Reducido */
  border-radius: 4px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 0.8rem;
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
  gap: 8px;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 4px;
  padding: 2px 8px;
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
  color: #c9d1d9;
  font-family: monospace;
}
.range-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}
.range-val {
  font-size: 0.75rem;
  color: #c9d1d9;
  min-width: 30px;
  text-align: right;
}
.info-box {
  background: rgba(88, 166, 255, 0.1);
  border-left: 3px solid #58a6ff;
  padding: 10px;
  border-radius: 4px;
  color: #c9d1d9;
  line-height: 1.4;
  font-size: 0.8rem;
}
.align-buttons {
  display: flex;
  gap: 4px;
  background: #161b22;
  border: 1px solid #30363d;
  padding: 3px;
  border-radius: 4px;
}
.align-buttons .tool-btn {
  flex: 1;
  font-size: 0.9rem;
  border-radius: 3px;
}
.align-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  background: #161b22;
  border: 1px solid #30363d;
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
  padding: 4px;
  border-radius: 4px;
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
  color: #c9d1d9;
  font-size: 0.8rem;
  cursor: pointer;
}

/* ÁREA DE LIENZO Y ELEMENTOS */
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
.interactive-element.is-hidden-editor {
  opacity: 0.3 !important;
  border: 1px dashed #f59e0b;
}
.resize-handle {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 10px;
  height: 10px;
  background: #fff;
  border: 2px solid #58a6ff;
  border-radius: 50%;
  cursor: nwse-resize;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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
  width: 100%; height: 100%; background: rgba(33, 38, 45, 0.8); border: 1px dashed #30363d;
  display: flex; flex-direction: column; gap: 10px; align-items: center; justify-content: center;
  font-size: 0.8rem; color: #8b949e; text-align: center; padding: 10px; box-sizing: border-box;
}
.drag-protector { position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 10; cursor: move; }
.el-3d { width: 100%; height: 100%; position: relative; }
.el-draw-board { width: 100%; height: 100%; position: relative; display: flex; flex-direction: column; }
.draw-drag-handle {
  position: absolute; top: -25px; left: 0; padding: 3px 10px; background: #58a6ff; color: #000;
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
.interactive-modal { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 15px; background: #fff; color: #161b22; padding: 20px; border-radius: 8px; width: 300px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); z-index: 9999; cursor: default; user-select: text; -webkit-user-select: text; }
.modal-title { margin: 0 0 10px 0; font-size: 1.1rem; border-bottom: 2px solid #f0f6fc; padding-bottom: 6px; font-weight: 800; }

.el-link { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 0 15px; box-sizing: border-box; transition: 0.2s; }
.el-link:hover { filter: brightness(1.1); }
.el-link:active { transform: scale(0.97); }

.el-accordion { width: 100%; height: 100%; overflow-y: auto; border-radius: 6px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
.accordion-item { border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.accordion-item:last-child { border-bottom: none; }
.accordion-header { padding: 10px 14px; font-weight: 600; font-size: 0.9rem; display: flex; justify-content: space-between; background: rgba(0, 0, 0, 0.3); transition: 0.2s; }
.accordion-header:hover { background: rgba(0, 0, 0, 0.4); }
.accordion-content { padding: 12px 14px; font-size: 0.85rem; line-height: 1.5; background: rgba(0, 0, 0, 0.1); user-select: text; }
.accordion-content.is-preview { opacity: 0.5; }

.accordion-edit-item { background: rgba(255, 255, 255, 0.02); padding: 8px; border-radius: 6px; margin-bottom: 8px; border: 1px solid #30363d; }

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
@keyframes pulse-audio { from { box-shadow: 0 0 0 0px rgba(255, 255, 255, 0.4); } to { box-shadow: 0 0 0 15px rgba(255, 255, 255, 0); } }

/* ESTADO VACÍO */
.empty-workspace { display: flex; align-items: center; justify-content: center; background-color: #010409; }
.empty-box { background: #0d1117; border: 1px solid #30363d; padding: 50px; border-radius: 12px; text-align: center; max-width: 450px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); }
.empty-box h3 { margin: 0 0 12px 0; font-size: 1.3rem; font-weight: 800; }
.empty-box p { color: #8b949e; font-size: 0.9rem; margin: 0; line-height: 1.5; }

/* MODAL DE NUEVO PROYECTO */
.new-project-modal { background: #0d1117; border: 1px solid #30363d; border-radius: 10px; padding: 25px; width: 400px; max-width: 90vw; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
.modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #30363d; padding-bottom: 12px; }
.modal-header h3 { margin: 0; color: #c9d1d9; font-size: 1.1rem; }
.template-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px; }
.template-card { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
.template-card:hover { border-color: #58a6ff; background: rgba(88, 166, 255, 0.05); }
.template-card.is-active { border-color: #58a6ff; background: rgba(88, 166, 255, 0.1); box-shadow: 0 0 0 1px #58a6ff; }
.template-card i { font-size: 1.8rem; color: #8b949e; }
.template-card.is-active i { color: #58a6ff; }
.template-card span { font-size: 0.8rem; font-weight: 600; color: #c9d1d9; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #30363d; }

/* MAPA MENTAL ESTILOS */
.el-mindmap-container { width: 100%; height: 100%; position: relative; overflow: visible; display: flex; align-items: center; justify-content: flex-start; }
.mm-wrapper { display: flex; align-items: center; justify-content: flex-start; width: 100%; height: 100%; box-sizing: border-box; padding: 10px; }
.mm-level-0 { display: flex; align-items: center; position: relative; }
.mm-node-block { display: flex; flex-direction: column; align-items: center; padding: 8px 12px; cursor: pointer; transition: 0.2s; position: relative; z-index: 2; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
.mm-node-block:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); }
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
</style>
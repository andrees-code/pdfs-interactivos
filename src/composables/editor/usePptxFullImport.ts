/**
 * usePptxFullImport.ts
 *
 * Composable para importación completa de PPTX con todos los elementos editables.
 * Llama en paralelo a:
 *   - POST /forms/pptx/full-extract  → JSON con todos los elementos de cada slide
 *   - POST /forms/pptx/convert-bg-only → PDF de fondo puro (sin shapes, solo tema)
 *
 * Mapea el JSON al schema de SlideElement del editor y devuelve:
 *   - backgroundPdfBlob: Blob del PDF de fondo
 *   - slides: Record<pageNum, SlideElement[]>
 *   - slideCx / slideCy: dimensiones originales del PPTX en EMU
 */

const HF_BASE_URL =
  (import.meta.env.VITE_GOTENBERG_URL as string | undefined)
    ?.replace(/\/forms\/libreoffice\/convert$/, '')
  ?? 'https://andrees04-mi-conversor-pptx.hf.space'

const FULL_EXTRACT_URL  = `${HF_BASE_URL}/forms/pptx/full-extract`
const CONVERT_BG_URL    = `${HF_BASE_URL}/forms/pptx/convert-bg-only`
const TIMEOUT_EXTRACT   = 120_000
const TIMEOUT_CONVERT   = 120_000

export interface FullImportResult {
  backgroundPdfBlob: Blob
  slides: Record<string, Array<Record<string, unknown>>>   // pageNum (string) → array de SlideElement
  slideCx: number
  slideCy: number
  hasBgPdf: boolean
  cleanBackgroundVerified: boolean
  cleanSourceEndpoint: string
  cleanFallbackUsed: boolean
  cleanFallbackReason: string | null
}

/**
 * Sube el PPTX a ambos endpoints en paralelo.
 * Lanza Error si full-extract falla. Si convert-bg-only falla, hasBgPdf=false (no bloqueante).
 */
export async function importPptxFull(
  file: File,
): Promise<FullImportResult> {
  const buildForm = () => {
    const fd = new FormData()
    fd.append('files', file, file.name || 'presentacion.pptx')
    return fd
  }

  const fetchWithTimeout = (url: string, timeout: number): Promise<Response> => {
    const ctrl = new AbortController()
    const id = setTimeout(() => ctrl.abort(), timeout)
    return fetch(url, { method: 'POST', body: buildForm(), signal: ctrl.signal })
      .finally(() => clearTimeout(id))
  }

  const [extractRes, bgRes] = await Promise.all([
    fetchWithTimeout(FULL_EXTRACT_URL, TIMEOUT_EXTRACT),
    fetchWithTimeout(CONVERT_BG_URL,   TIMEOUT_CONVERT),
  ])

  if (!extractRes.ok) {
    const detail = await extractRes.text().catch(() => '')
    throw new Error(`full-extract falló HTTP ${extractRes.status}: ${detail.slice(0, 200)}`)
  }

  const rawJson = await extractRes.json() as {
    slideCx: number
    slideCy: number
    pages: Record<string, { background: unknown; elements: unknown[] }>
  }

  let backgroundPdfBlob: Blob = new Blob([], { type: 'application/pdf' })
  let hasBgPdf = false
  let cleanBackgroundVerified = false
  let cleanSourceEndpoint = 'none'
  let cleanFallbackUsed = false
  let cleanFallbackReason: string | null = null

  if (bgRes.ok) {
    const blob = await bgRes.blob()
    // Verificar que sea PDF real
    const sig = await blob.slice(0, 5).text().catch(() => '')
    if (sig === '%PDF-') {
      backgroundPdfBlob = blob
      hasBgPdf = true
      cleanSourceEndpoint = 'convert-bg-only'

      const verifiedHeader = bgRes.headers.get('x-clean-verified')
      const fallbackHeader = bgRes.headers.get('x-clean-fallback-used')
      const residualHeader = bgRes.headers.get('x-clean-residual-text-nodes')

      // Compatibilidad: si no hay header (deploy antiguo), asumimos válido si hay PDF.
      cleanBackgroundVerified = verifiedHeader ? verifiedHeader === 'true' : true
      cleanFallbackUsed = fallbackHeader === 'true'
      if (!cleanBackgroundVerified) {
        cleanFallbackReason = `Residual text nodes: ${residualHeader ?? 'unknown'}`
      }
    }
  }

  const { slideCx, slideCy, pages } = rawJson
  const slides: Record<string, Array<Record<string, unknown>>> = {}

  for (const [pageStr, pageData] of Object.entries(pages)) {
    const elements = pageData.elements ?? []
    // Bug 1 fix: no escalar aquí — se escala una vez en el editor tras processPdfFile
    const mapped = elements.map(el => mapElementToEditor(el))

    // Diagnóstico: verificar que se mapean propiedades
    if (mapped.length > 0) {
      const first = mapped[0] as Record<string, unknown>
      console.log(`[usePptxFullImport] Page ${pageStr}: ${mapped.length} elementos mapeados. First element:`, {
        id: first.id,
        type: first.type,
        hasFontSize: 'fontSize' in first,
        fontSize: first.fontSize,
        hasColor: 'color' in first,
        color: first.color,
        hasFontWeight: 'fontWeight' in first,
        fontWeight: first.fontWeight,
        hasFontFamily: 'fontFamily' in first,
        fontFamily: first.fontFamily,
      })
    }

    slides[pageStr] = mapped
  }

  return {
    backgroundPdfBlob,
    slides,
    slideCx,
    slideCy,
    hasBgPdf,
    cleanBackgroundVerified,
    cleanSourceEndpoint,
    cleanFallbackUsed,
    cleanFallbackReason,
  }
}


/**
 * Transforma un elemento del JSON de full-extract al schema del editor Vue.
 * Bug 1 fix: NO escala coordenadas aquí. Las coords (xNorm/yNorm/wNorm/hNorm)
 * se escalan UNA SOLA VEZ en convertPptxFullEdit, después de que processPdfFile
 * actualice baseWidth/baseHeight con las dimensiones reales del canvas.
 */
const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback

const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const asBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === 'boolean' ? value : fallback

function mapElementToEditor(el: unknown): Record<string, unknown> {
  const source = (el as Record<string, unknown>) || {}
  const base = {
    id:               asString(source.id, `el_${Date.now()}_${Math.floor(Math.random() * 10000)}`),
    // Coordenadas normalizadas — se materializan en convertPptxFullEdit
    xNorm:            asNumber(source.xNorm, 0),
    yNorm:            asNumber(source.yNorm, 0),
    wNorm:            asNumber(source.wNorm, 0.2),
    hNorm:            asNumber(source.hNorm, 0.05),
    hIsAuto:          !source.hNorm,
    // Placeholders sobrescritos en el editor
    x: 0, y: 0, width: 10, height: 10 as number | 'auto',
    zIndex:           asNumber(source.zIndex, 0),
    opacity:          asNumber(source.opacity, 1),
    rotation:         asNumber(source.rotation, 0),
    mixBlendMode:     asString(source.mixBlendMode, 'normal'),
    isHidden:         false,
    isLocked:         false,
    groupId:          null,
    // Animación: solo si el shape era animado en el PPTX original
    animationType:    asBoolean(source.isAnimated) ? asString(source.animationType, 'fade-in') : 'none',
    animationOrder:   asBoolean(source.isAnimated) ? asNumber(source.animationOrder, 0) : 0,
    animationTrigger: asBoolean(source.isAnimated) ? asString(source.animationTrigger, 'onClick') : 'onClick',
  }

  // Diagnóstico: log de entrada para texto
  if (asString(source.type, 'shape') === 'text') {
    console.log('[mapElementToEditor] Input text element:', {
      id: source.id,
      type: source.type,
      content: source.content,
      fontSize: source.fontSize,
      fontSizePt: source.fontSizePt,
      color: source.color,
      fontWeight: source.fontWeight,
      fontFamily: source.fontFamily,
    })
  }

  switch (asString(source.type, 'shape')) {
    case 'text':
      const textElement = {
        ...base,
        type:           'text',
        content:        asString(source.content, ''),
        // paragraphs omitido: el editor usa content (texto plano). Tener arrays
        // anidados en documentState dispara tracking reactivo innecesario de Vue.
        color:          asString(source.color, '#1e293b'),
        fontSize:       asNumber(source.fontSize, 18),
        fontWeight:     asString(source.fontWeight, '400'),
        fontFamily:     asString(source.fontFamily, 'Helvetica, Arial, sans-serif'),
        fontStyle:      asString(source.fontStyle, 'normal'),
        textAlign:      asString(source.textAlign, 'left'),
        textTransform:  'none',
        textDecoration: 'none',
        lineHeight:     1.2,
        letterSpacing:  0,
        textShadow:     'none',
        textBgColor:    asString(source.textBgColor, 'transparent'),
        borderWidth:    asNumber(source.borderWidth, 0),
        borderColor:    asString(source.borderColor, '#000000'),
        animation:      asBoolean(source.isAnimated) ? asString(source.animationType, 'fade-in') : 'none',
      }

      // Diagnóstico: log de salida después mapping
      console.log('[mapElementToEditor] Output text element:', {
        id: textElement.id,
        type: textElement.type,
        content: textElement.content,
        fontSize: textElement.fontSize,
        color: textElement.color,
        fontWeight: textElement.fontWeight,
        fontFamily: textElement.fontFamily,
      })

      return textElement

    case 'image':
      return {
        ...base,
        type:         'image',
        src:          asString(source.src, ''),
        fit:          'fill',
        borderRadius: 0,
        borderWidth:  0,
        borderColor:  '#000000',
        grayscale:    0,
        blur:         0,
        sepia:        0,
        animation:    asBoolean(source.isAnimated) ? asString(source.animationType, 'fade-in') : 'none',
      }

    case 'shape':
      return {
        ...base,
        type:        'shape',
        shapeType:   asString(source.shapeType, 'rect'),
        fillColor:   asString(source.fillColor, 'transparent'),
        borderWidth: asNumber(source.borderWidth, 0),
        borderColor: asString(source.borderColor, '#000000'),
        animation:   asBoolean(source.isAnimated) ? asString(source.animationType, 'fade-in') : 'none',
      }

    default:
      return { ...base, type: asString(source.type, 'shape') }
  }
}

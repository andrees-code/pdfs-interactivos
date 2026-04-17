# 🎨 GUÍA DE ESTILO - DocFlow

**Documentación Visual**  
**Versión**: 1.0  
**Última actualización**: Abril 2026

---

## 📌 IDENTIDAD VISUAL

### Nombre de Marca
```
╔════════════════════════════════╗
║       D O C F L O W            ║
║                                ║
║  Documentos Interactivos       ║
║  Profesionales                 ║
╚════════════════════════════════╝
```

**Pronunciación**: /dɑk floʊ/  
**Concepto**: Fluidez en la gestión de documentos  
**Target**: Profesionales, empresas, educadores

---

## 🎨 PALETA DE COLORES

### Primarios

```
Indigo Primario
Hex:   #6366F1
RGB:   99, 102, 241
HSL:   239°, 100%, 67%
Uso:   CTAs, botones, elementos activos
┌────────────────────┐
│      #6366F1       │ ← Color principal
└────────────────────┘

Indigo Oscuro (Hover)
Hex:   #4F46E5
RGB:   79, 70, 229
HSL:   243°, 100%, 60%
Uso:   Estados hover, focus
┌────────────────────┐
│      #4F46E5       │ ← Más oscuro
└────────────────────┘

Violet (Gradiente)
Hex:   #8B5CF6
RGB:   139, 92, 246
HSL:   259°, 90%, 66%
Uso:   Gradientes, acentos secundarios
┌────────────────────┐
│      #8B5CF6       │ ← Complementario
└────────────────────┘

Rose (Energía)
Hex:   #EC4899
RGB:   236, 72, 153
HSL:   331°, 88%, 60%
Uso:   Highlights, elementos energéticos
┌────────────────────┐
│      #EC4899       │ ← Energía
└────────────────────┘
```

### Gradiente Principal

```
Indigo → Violet

#6366F1 ⟹⟹⟹⟹⟹⟹⟹ #8B5CF6
(100%)              (0%)

Usado en:
- Logo principal
- Favicon
- Botones CTA
- Gradientes de fondo

CSS:
linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)
```

### Neutrales (Dark Theme)

```
Background
┌─────────────────────────┐
│ Base: #09090b           │ ← Fondo principal
│ Surface: #111113        │ ← Contenedores
│ Surface Hover: #1c1c21  │ ← Hover
│ Surface Active: #27272a │ ← Activo
└─────────────────────────┘

Text
┌─────────────────────────┐
│ Primary: #ffffff        │ ← Texto principal
│ Secondary: #a1a1aa      │ ← Secundario
│ Tertiary: #71717a       │ ← Ayuda/hints
└─────────────────────────┘
```

### Estados

```
Success     #10b981   ✓
Warning     #f59e0b   ⚠
Danger      #ef4444   ✗
```

---

## 🔤 TIPOGRAFÍA

### Geist (Headings)

```
Familia: Geist Sans
Origen: Vercel / Google Fonts
Estilos: 500, 600, 700, 800

H1 - Geist 800
Tamaño: 48px | Línea: 1.2
Letter-spacing: -0.5px
Ejemplo: "Títulos principales"

H2 - Geist 700
Tamaño: 36px | Línea: 1.2
Letter-spacing: -0.3px
Ejemplo: "Subtítulos importantes"

H3 - Geist 700
Tamaño: 28px | Línea: 1.2
Letter-spacing: -0.2px

H4 - Geist 600
Tamaño: 22px | Línea: 1.3

H5 - Geist 600
Tamaño: 18px | Línea: 1.3

H6 - Geist 600
Tamaño: 16px | Línea: 1.3
```

### Inter (Body)

```
Familia: Inter
Origen: Rasmus Andersson / Google Fonts
Estilos: 300, 400, 500, 600, 700, 800

Body - Inter 400
Tamaño: 14-16px | Línea: 1.6
Uso: Párrafos, contenido
Ejemplo: "Contenido regular del sitio"

Small - Inter 400
Tamaño: 12px | Línea: 1.5
Uso: Labels, helpers
Ejemplo: "Texto pequeño"

Bold - Inter 600-700
Tamaño: 14-16px
Uso: Énfasis en texto

Links - Inter 500
Color: #6366F1 (primario)
Decoration: underline
Hover: #4F46E5
```

---

## 🏷️ LOGO

### Logo Principal (200x200px)

```
Ubicación: public/logo.svg

Concepto: 
- Documento en transformación
- Líneas fluidas y dinámicas
- Gradiente Indigo → Violet

Versiones:
✓ Principal (con texto)
✓ Icon (sin texto, 128x128)

Mínimo recomendado: 120x120px
```

**Usos**:
- Header del sitio web
- Landing page hero
- Presentaciones
- Marketing materials
- Print (con ajustes)

### Logo Icon (128x128px)

```
Ubicación: public/logo-icon.svg

Concepto:
- Símbolo minimalista
- Identificador simple
- Escalable a tamaños pequeños

Versiones:
✓ Color (Indigo)
✓ Blanco (para fondos oscuros)
```

**Usos**:
- App icons
- Botones
- Favicon base
- Espacios pequeños
- Social media avatars

---

## 📱 FAVICON

### Especificaciones

```
Formato Primario: SVG (favicon.svg)
├─ Escalable infinitamente
├─ Compatible: Chrome, Firefox, Safari (moderno)
└─ Size: Variable

Formato Fallback: PNG
├─ favicon-32x32.png   (favicon pequeño)
├─ favicon-64x64.png   (favicon mediano)
├─ favicon.png         (favicon general)
└─ apple-touch-icon.png (180x180, iOS/macOS)

Todos basados en el logo icon con gradiente
```

### Implementación HTML

```html
<!-- SVG (Primario - Navegadores modernos) -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">

<!-- PNG Fallback -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="64x64" href="/favicon-64x64.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" href="/apple-touch-icon.png">

<!-- Manifest PWA -->
<link rel="manifest" href="/manifest.json">

<!-- Theme Color -->
<meta name="theme-color" content="#6366F1">
```

---

## 📏 GRID Y ESPACIADO

```
Radiuses (CSS):
--radius-sm: 6px      (pequeños elementos)
--radius-md: 10px     (elementos regulares)
--radius-lg: 16px     (paneles/cards)
--radius-xl: 24px     (modales)
--radius-full: 9999px (redondeado total)

Spacing (recomendado):
4px   (xs)
8px   (sm)
12px  (md)
16px  (lg)
24px  (xl)
32px  (2xl)
48px  (3xl)
```

---

## 🎭 SOMBRAS

```
Sutil (elementos pequeños)
--shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.15)

Medio (cards, panels)
--shadow-md: 0 8px 24px rgba(0, 0, 0, 0.25)

Fuerte (modales, overlays)
--shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.4)

Glow (efectos de énfasis)
--shadow-glow: 0 0 20px rgba(99, 102, 241, 0.2)
```

---

## ⚡ TRANSICIONES

```
Rápida (microinteracciones)
--transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1)

Normal (cambios estándar)
--transition-normal: 0.25s cubic-bezier(0.4, 0, 0.2, 1)

Bounce (animaciones de atención)
--transition-bounce: 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)
```

---

## 🧩 COMPONENTES

### Botón Principal (CTA)

```
Background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)
Text: Geist 600, 14-16px, #ffffff
Padding: 12px 24px
Border-radius: 10px
Transition: --transition-normal
Shadow: --shadow-md

Hover:
Background: #4F46E5
Shadow: --shadow-lg

Active:
Transform: scale(0.98)
```

### Card/Panel

```
Background: #111113 (var(--bg-surface))
Border: 1px solid #27272a (var(--border-strong))
Border-radius: 16px
Box-shadow: --shadow-md
Padding: 24px

Hover:
Background: #1c1c21
```

### Input

```
Background: #09090b
Border: 1px solid var(--border-subtle)
Border-radius: 10px
Padding: 12px 16px
Color: #ffffff
Font: Inter 400

Focus:
Border-color: #6366F1
Box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1)
```

---

## 📚 ARCHIVOS DE REFERENCIA

```
Logo & Favicon:
├── public/logo.svg                (principal)
├── public/logo-icon.svg           (icon)
├── public/favicon.svg             (moderno)
├── public/favicon-32x32.png       (web)
├── public/favicon-64x64.png       (tablet)
├── public/apple-touch-icon.png    (iOS)
└── public/manifest.json           (PWA)

Estilos:
└── src/assets/global.css          (variables CSS)

Documentación:
├── BRANDING.md                    (guía de marca)
├── BEFORE_AND_AFTER.md            (comparativa)
├── DEPLOYMENT.md                  (deployment)
└── STYLE_GUIDE.md                 (este archivo)
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### En Componentes
- [ ] Usar `--font-heading` en h1-h6
- [ ] Usar `--font-main` en paragraphs
- [ ] Usar colores primarios de la paleta
- [ ] Usar valores de spacing definidos
- [ ] Aplicar transiciones de movimiento

### En Proyecto
- [ ] Logo en header
- [ ] Favicon visible en tab
- [ ] Metadatos SEO completos
- [ ] Open Graph tags
- [ ] PWA Manifest

---

## 🚀 GUÍA DE USO

```css
/* Tipografía */
h1 { font-family: var(--font-heading); }
p { font-family: var(--font-main); }

/* Colores */
.button-primary { background: var(--accent-primary); }
.button-primary:hover { background: var(--accent-primary-hover); }

/* Espaciado */
.card { 
  padding: 24px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

/* Transiciones */
.interactive {
  transition: all var(--transition-normal);
}
```

---

**DocFlow Design System v1.0**  
Listo para Producción ✅
# 🎨 IDENTIDAD VISUAL - DocFlow

**Última actualización**: Abril 2026  
**Status**: Versión 1.0 - Producción

---

## 📋 Resumen Ejecutivo

DocFlow es la plataforma profesional para gestión y edición de PDFs interactivos. Esta guía define los estándares visuales y de marca para mantener consistencia en todos los medios.

---

## 🎯 Nombre de Marca

**Nombre Principal**: **DocFlow**  
**Pronunciación**: /dɑk floʊ/  
**Concepto**: Fluidez en la gestión y transformación de documentos  
**Target**: Profesionales, empresas, educadores, creadores de contenido

---

## 🎨 Paleta de Colores

### Colores Primarios

| Nombre | Hex | RGB | Uso |
|--------|-----|-----|-----|
| **Indigo Primario** | `#6366F1` | 99, 102, 241 | CTA, Botones, Activos |
| **Indigo Oscuro** | `#4F46E5` | 79, 70, 229 | Hover, Focus |
| **Violet** | `#8B5CF6` | 139, 92, 246 | Gradientes, Acentos |
| **Rose** | `#EC4899` | 236, 72, 153 | Energía, Highlights |

### Colores Secundarios (Dark Theme)

| Elemento | Hex | Uso |
|----------|-----|-----|
| **Background Base** | `#09090b` | Fondo principal |
| **Surface** | `#111113` | Contenedores |
| **Surface Hover** | `#1c1c21` | Estados hover |
| **Surface Active** | `#27272a` | Estados activos |
| **Text Primary** | `#ffffff` | Texto principal |
| **Text Secondary** | `#a1a1aa` | Texto secundario |
| **Text Tertiary** | `#71717a` | Texto de ayuda |

### Colores de Estado

| Estado | Hex |
|--------|-----|
| **Success** | `#10b981` |
| **Warning** | `#f59e0b` |
| **Danger** | `#ef4444` |

---

## 🔤 Tipografía

### Jerarquía Tipográfica

```
HEADINGS (H1-H6):
Font: Geist Sans (700-800 weight)
Source: Google Fonts
Características: Moderna, limpia, profesional
https://fonts.google.com/specimen/Geist

BODY TEXT & UI:
Font: Inter (400-500 weight)
Source: Google Fonts
Características: Altamente legible, neutra, versátil
https://fonts.google.com/specimen/Inter
```

### Tamaños Recomendados

| Elemento | Tamaño | Peso | Línea |
|----------|--------|------|-------|
| **H1** | 48px | 800 | 1.2 |
| **H2** | 36px | 700 | 1.2 |
| **H3** | 28px | 700 | 1.2 |
| **H4** | 22px | 600 | 1.3 |
| **H5** | 18px | 600 | 1.3 |
| **H6** | 16px | 600 | 1.3 |
| **Body** | 14-16px | 400-500 | 1.6 |
| **Small** | 12px | 400 | 1.5 |

---

## 🏷️ Logo

### Logo Principal
- **Ubicación**: `public/logo.svg`
- **Dimensiones**: 200x200px (escalable)
- **Versión**: Completa con texto "DocFlow"
- **Gradiente**: Indigo → Violet
- **Concepto Visual**: Documento transformándose con líneas fluidas

**Uso Recomendado**:
- Header de sitio web
- Landing page
- Presentaciones
- Marketing materials

### Logo Icon (Simplificado)
- **Ubicación**: `public/logo-icon.svg`
- **Dimensiones**: 128x128px
- **Versión**: Solo símbolo sin texto
- **Uso Recomendado**:
  - App icon
  - Favicon base
  - Botones
  - Small spaces

### Favicon
- **Ubicación**: `public/favicon.svg`
- **Dimensiones**: 32x32px
- **Formato**: SVG (escalable), compatible con todos los navegadores
- **Color**: Indigo Primario + Degradado
- **Simplificación**: Documento minimalista con líneas

---

## 📏 Especificaciones Técnicas

### CSS Variables Disponibles

```css
/* Colores */
--accent-primary: #6366f1
--accent-primary-hover: #4f46e5
--accent-secondary: #8b5cf6
--accent-tertiary: #ec4899

/* Tipografía */
--font-heading: 'Geist', sans-serif
--font-main: 'Inter', sans-serif

/* Espaciado */
--radius-sm: 6px
--radius-md: 10px
--radius-lg: 16px
--radius-xl: 24px
--radius-full: 9999px

/* Sombras */
--shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.15)
--shadow-md: 0 8px 24px rgba(0, 0, 0, 0.25)
--shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.4)
--shadow-glow: 0 0 20px rgba(99, 102, 241, 0.2)

/* Transiciones */
--transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1)
--transition-normal: 0.25s cubic-bezier(0.4, 0, 0.2, 1)
--transition-bounce: 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)
```

---

## ✅ Checklist de Implementación

- [x] Nombre de marca: "DocFlow"
- [x] Logo principal con gradiente
- [x] Logo icon simplificado
- [x] Favicon SVG
- [x] Tipografía Geist para headings
- [x] Tipografía Inter para body
- [x] Paleta de colores profesional
- [x] Actualización de index.html
- [x] Actualización de global.css
- [x] Metadatos SEO y OpenGraph
- [x] Tema color para navegadores

---

## 🚀 Archivos Generados

```
public/
  ├── logo.svg              # Logo principal (200x200)
  ├── logo-icon.svg         # Logo simplificado (128x128)
  ├── favicon.svg           # Favicon (32x32)
  └── favicon-source.svg    # Fuente del favicon

src/
  └── assets/
      └── global.css        # Estilos globales actualizados

Configuración:
  ├── index.html            # Meta tags y referencias actualizadas
  ├── package.json          # Nombre y descripción actualizados
  └── BRANDING.md           # Este archivo
```

---

## 🎯 Próximos Pasos (Recomendaciones)

1. **Deploy a Producción**
   - Validar que favicon se cargue correctamente en todos los navegadores
   - Probar logo en diferentes resoluciones

2. **Redes Sociales**
   - Usar logo principal para perfiles
   - Crear templates de cover con paleta de DocFlow

3. **Marketing**
   - Crear style guide para marketing materials
   - Preparar assets para publicidad

4. **Monitoreo**
   - Verificar que OG tags aparezcan correctamente en comparticiones
   - Monitorear performance de fuentes de Google

---

## 📞 Contacto & Soporte

Para actualizaciones de branding: Ver `BRANDING.md`

---

**DocFlow** - Documentos Interactivos Profesionales  
Versión 1.0 | Abril 2026
# 🎮 ATAJOS DE TECLADO - EDITOR INTERACTIVO

## ✅ COMBINACIONES DEFINITIVAS (Sin interferencias)

### 📌 SELECCIÓN DE ELEMENTOS

```
Click izquierdo (solo)
  → Selecciona UN elemento
  → O deselecciona todo si click en vacío

Ctrl + Click izquierdo (SIN arrastrar)
  → Agregar/quitar elemento a selección (TOGGLE)

Ctrl + DRAG (arrastrar)
  → Crear rectángulo de selección (marquee)
  → Selecciona todos los elementos dentro del rectángulo

Shift + Ctrl + DRAG
  → Marquee ADDITIVE (agrega al rectángulo de selección anterior)
  → No borra la selección anterior
```

### 🖱️ DESPLAZAMIENTO (PANNING)

```
Rueda del ratón (arriba/abajo)
  → Desplazar canvas verticalmente

Botón central del ratón + DRAG
  → Desplazar canvas en ANY DIRECCIÓN
  → No interfiere con selección

Espacio + Click izquierdo + DRAG
  → Desplazar canvas (alternativa)
  → Útil si no tienes botón central
```

### 🔍 ZOOM

```
Ctrl + Rueda arriba
  → Acercar (aumentar zoom)

Ctrl + Rueda abajo
  → Alejar (reducir zoom)
```

---

## 🎯 CASOS DE USO COMUNES

### Caso 1: Seleccionar 5 elementos dispersos
```
1. Presiona CTRL
2. Arrastra un rectángulo sobre los 5 elementos
3. Suelta el mouse → ¡Seleccionados!
```

### Caso 2: Agregar más elementos a una selección existente
```
1. Tienes 3 elementos seleccionados
2. Presiona CTRL + SHIFT
3. Arrastra un rectángulo sobre 2 elementos más
4. Suelta → Ahora tienes 5 seleccionados
```

### Caso 3: Mover el canvas sin seleccionar nada
```
Opción A: Presiona botón central del ratón y arrastra
Opción B: Presiona Espacio y haz click+drag
```

### Caso 4: Ver más del documento
```
Presiona Ctrl + usa la rueda del ratón hacia abajo
```

---

## 🔍 DETALLES TÉCNICOS

### El flujo tiene prioridades estrictas

1. **Si presionas Ctrl + Click izquierdo**
   - Se prioritiza MARQUEE SELECTION
   - El panning se IGNORA completamente
   - Puedes arrastrar sin preocupaciones

2. **Si presionas Botón central O Espacio + Click**
   - Se prioritiza PANNING
   - La selección se IGNORA
   - Solo se mueve el canvas

3. **Si presionas Click izquierdo normal**
   - Selecciona el elemento bajo el cursor
   - Sin interferencias

### Detection de arrastre (3px umbral)

- **Menos de 3 píxeles de movimiento** → Se considera un CLICK
- **Más de 3 píxeles de movimiento** → Se considera un DRAG
- Esto evita selecciones accidentales

### Variables de control interno

```typescript
interactionMode: 'marquee' | 'panning' | 'none'
  // Rastrea qué está pasando en este momento

hasMovedDuringInteraction: boolean
  // Distingue entre clicks y drags

isMarqueeSelecting: boolean
  // Específicamente para marquee selection

isPanning: boolean
  // Específicamente para panning
```

---

## ⚠️ NOTA IMPORTANTE

Si activaste la herramienta de "crear elemento" (no es "select"), entonces:
- **Click normal** → Crea un nuevo elemento, no selecciona
- **Ctrl + Drag** → Todavía hace marquee selection para seleccionar múltiples (si herramienta es 'select')

Siempre asegúrate de estar en modo "Select" para las operaciones de selección.

---

## 🚀 Qué cambió en esta versión

✅ **Ctrl+Drag** ahora funciona correctamente para marquee selection  
✅ **Panning** no interfiere con Ctrl+Click  
✅ **Toggle selection** con Ctrl+Click simple (sin arrastrar)  
✅ **Clear event priorities** - Sin conflictos entre modos  
✅ **Visual feedback** - Rectángulo azul punteado mientras arrastras  

---

Última localización: `src/views/EditorPresentacionesView.vue`  
Funciones clave:
- `handleCanvasPanStart()` - Gestiona prioridades
- `handleCanvasClick()` - Validación de clicks
- `handleCanvasWheel()` - Zoom y panning

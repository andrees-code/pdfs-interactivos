# DocFlow

**Documentos Interactivos Profesionales**

Plataforma moderna y profesional para crear, editar y presentar PDFs interactivos con la ayuda de inteligencia artificial. DocFlow combina herramientas poderosas de edición con una experiencia de usuario intuitiva.

## 🎯 Características

- 📄 Editor de PDFs interactivo avanzado
- 🎨 Editor de presentaciones profesional
- 🤖 Asistencia de IA integrada
- 📚 Biblioteca de documentos organizada
- 🔐 Autenticación y gestión de suscripción
- 🌙 Interfaz moderna con tema oscuro premium
- ⚡ Rendimiento optimizado

## 🚀 Primeros Pasos

### Requisitos Previos

- Node.js `^20.19.0 || >=22.12.0`
- npm o pnpm

### Instalación

```sh
npm install
```

### Desarrollo

```sh
npm run dev
```

La aplicación se ejecutará en `http://localhost:5173`

### Variables de Entorno

Crear archivo `.env` en frontend:

```sh
VITE_BACKEND_URL=http://localhost:3000
```

Para login social con Google debes registrar callback hacia backend:

- `https://<tu-backend>/api/api/v1/users/auth/google/callback`

### Compilar para Producción

```sh
npm run build
```

### Vista Previa de Producción

```sh
npm run preview
```

### Verificación de Tipos

```sh
npm run type-check
```

### Linting

```sh
npm run lint
```

### Formateo de Código

```sh
npm run format
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/           # Componentes Vue reutilizables
├── views/                # Vistas principales
├── stores/               # Gestión de estado (Pinia)
├── services/             # Servicios y llamadas API
├── config/               # Configuración
├── router/               # Enrutamiento
└── assets/               # Recursos estáticos y estilos
```

## 🎨 Identidad Visual

Ver [BRANDING.md](./BRANDING.md) para detalles sobre la identidad visual, colores, tipografía y especificaciones de marca.

### Colores Principales

- **Indigo Primario**: `#6366F1`
- **Violet Secundario**: `#8B5CF6`
- **Rose Accent**: `#EC4899`

### Tipografía

- **Headings**: Geist Sans (700-800 weight)
- **Body**: Inter (400-500 weight)

## 🛠️ Stack Tecnológico

- **Frontend**: Vue 3 + TypeScript
- **Build**: Vite
- **Router**: Vue Router
- **Estado**: Pinia
- **Estilos**: CSS3 con variables personalizadas + Tailwind
- **PDF**: PDF.js
- **Captura / export**: html-to-image, jszip, pako
- **Herramientas**: ESLint, Prettier, Vue TSC

## 📚 Documentación

- **[CLAUDE.md](./CLAUDE.md)** — guía técnica del repo: arquitectura, mapa del
  editor, trampas conocidas y convenciones. Léela antes de tocar código.
- [BRANDING.md](./BRANDING.md) y [STYLE_GUIDE.md](./STYLE_GUIDE.md) — identidad
  visual y sistema de diseño.
- [KEYBOARD_SHORTCUTS.md](./KEYBOARD_SHORTCUTS.md) — atajos del editor.
- [DEPLOYMENT.md](./DEPLOYMENT.md) — despliegue en Vercel.

## 🔗 Enlaces Útiles

- [Vue 3 Docs](https://vuejs.org/)
- [Vite Docs](https://vite.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Pinia Docs](https://pinia.vuejs.org/)

## 📝 Licencia

Privado - Todos los derechos reservados

## 🤝 Contacto

Para más información sobre DocFlow, contacta a nuestro equipo.

---

**DocFlow v1.0** | Abril 2026 

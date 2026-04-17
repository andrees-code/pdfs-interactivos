# 🚀 GUÍA DE DEPLOYMENT - DocFlow

**Versión**: 1.0  
**Actualizado**: Abril 2026

---

## 📋 Pre-Deployment Checklist

Antes de lanzar DocFlow a producción, verifica estos puntos:

### ✅ Branding & Assets
- [x] Logo principal en `public/logo.svg`
- [x] Logo icon en `public/logo-icon.svg`
- [x] Favicons generados (`favicon.svg`, `favicon-*.png`)
- [x] Manifest PWA en `public/manifest.json`
- [x] Metadatos SEO en `index.html`
- [x] Identificador de Google en `index.html` (si aplica)

### ✅ Código
- [ ] `npm run lint` sin errores
- [ ] `npm run type-check` sin errores
- [ ] Todas las rutas API configuradas correctamente
- [ ] Variables de entorno configuradas (`.env.production`)
- [ ] Remove debug logs y console.log

### ✅ Performance
- [ ] `npm run build` se ejecuta sin warnings
- [ ] Tamaño del bundle verificado
- [ ] Imágenes optimizadas
- [ ] Lazy loading configurado

### ✅ Security
- [ ] HTTPS habilitado
- [ ] Headers de seguridad configurados
- [ ] CORS configurado correctamente
- [ ] Validación de inputs

### ✅ Testing
- [ ] Tests E2E pasando
- [ ] Pruebas en navegadores principales (Chrome, Firefox, Safari, Edge)
- [ ] Verificar favicon en todos los navegadores
- [ ] Verificar responsividad en móviles

---

## 🔧 Variables de Entorno

Crear `.env.production`:

```env
VITE_BACKEND_URL=https://tu-backend.vercel.app
VITE_API_TIMEOUT=30000
VITE_LOG_LEVEL=error
```

---

## 📦 Build para Producción

```bash
# 1. Limpiar build anterior
rm -r dist/

# 2. Ejecutar linting y type check
npm run lint
npm run type-check

# 3. Build optimizado
npm run build

# 4. Verificar tamaño del bundle
# (Vite mostrará el tamaño automáticamente)

# 5. Preview local
npm run preview
```

---

## 🌐 Deployment a Vercel

### Opción 1: CLI de Vercel

```bash
npm install -g vercel
vercel --prod
```

### Opción 2: Git Integration

1. Push a GitHub/GitLab
2. Conectar repositorio en [Vercel Dashboard](https://vercel.com)
3. Configurar variables de entorno en Vercel
4. Deploy automático en cada push

### Configuración Vercel (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_BACKEND_URL": "@backend_url"
  },
  "headers": [
    {
      "source": "/favicon.svg",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## ✅ Post-Deployment Verification

Después de desplegar, verifica:

```bash
# 1. Verificar favicon
curl -I https://tu-app.vercel.app/favicon.svg
# Debe retornar 200 OK

# 2. Verificar manifest
curl https://tu-app.vercel.app/manifest.json
# Debe retornar JSON válido

# 3. Verificar title
curl https://tu-app.vercel.app | grep "<title>"
# Debe mostrar: "DocFlow - Documentos Interactivos Profesionales"

# 4. Verificar Open Graph
curl https://tu-app.vercel.app | grep "og:title"
# Debe mostrar: "DocFlow"
```

---

## 🎨 Monitoreo de Marca

Después del deployment:

1. **Google Search Console**
   - Agregar sitio
   - Verificar que favicon se ve correctamente
   - Monitorear posicionamiento

2. **Social Media**
   - Compartir en redes sociales
   - Verificar que OG tags se renderizan correctamente
   - Verificar que favicon aparece en tabs compartidas

3. **Performance Monitoring**
   - Configurar Sentry/LogRocket para monitorear errores
   - Monitorear Core Web Vitals

---

## 🔄 Actualización de Branding

Si necesitas actualizar logo o favicons:

```bash
# 1. Editar `public/favicon-source.svg`
# 2. Regenerar favicons
npm run generate-favicons

# 3. Actualizar `BRANDING.md` si es necesario
# 4. Commit y push
git add .
git commit -m "chore: update branding assets"
git push
```

---

## 📞 Rollback

Si hay problemas después del deployment:

```bash
# En Vercel Dashboard:
1. Ir a "Deployments"
2. Seleccionar deploy anterior
3. Click en "Promote to Production"

# O via CLI:
vercel rollback
```

---

## 📚 Recursos Adicionales

- [Vercel Docs](https://vercel.com/docs)
- [Vite Build Guide](https://vite.dev/guide/build.html)
- [Web.dev Performance](https://web.dev/performance/)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

**DocFlow v1.0** | Listo para Producción ✅
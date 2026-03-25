import fs from 'fs';
import path from 'path';

const file = path.resolve('./src/views/EditorPresentacionesView.vue');
let content = fs.readFileSync(file, 'utf8');

// Eliminamos el watcher viejo inyectado en el paso anterior para actualizarlo
const oldSnippetStart = content.indexOf('// --- INYECTADO: REFRENDO EN TIEMPO REAL ---');
const scriptEnd = content.lastIndexOf('</script>');

if (oldSnippetStart !== -1 && scriptEnd !== -1) {
  content = content.slice(0, oldSnippetStart) + content.slice(scriptEnd);
}

// Inyectamos el watcher rápido y optimizado (150ms debounce)
const newInsertIndex = content.lastIndexOf('</script>');
const newSnippet = `
  // --- INYECTADO: REFRENDO EN TIEMPO REAL V2 ---
  let __thumbTimeout = null;
  
  watch(currentPageElements, () => {
    if (!playMode.value) {
      if (__thumbTimeout) clearTimeout(__thumbTimeout);
      __thumbTimeout = setTimeout(() => {
        captureThumbnail();
      }, 150); // Extremadamente rápido para la ilusión de tiempo real
    }
  }, { deep: true });
  
  watch(() => slideConfigs.value[pageNum.value], () => {
    if (!playMode.value) {
      if (__thumbTimeout) clearTimeout(__thumbTimeout);
      __thumbTimeout = setTimeout(() => {
        captureThumbnail();
      }, 150);
    }
  }, { deep: true });
  
  // Agregar también el resize observer o mutación final para la velocidad extrema
  onMounted(() => {
    const target = document.querySelector('.pro-workspace');
    if (target) {
        target.addEventListener('mouseup', () => {
             if (__thumbTimeout) clearTimeout(__thumbTimeout);
             __thumbTimeout = setTimeout(captureThumbnail, 100);
        });
        target.addEventListener('keyup', () => {
             if (__thumbTimeout) clearTimeout(__thumbTimeout);
             __thumbTimeout = setTimeout(captureThumbnail, 100);
        });
    }
  });
`;

content = content.slice(0, newInsertIndex) + newSnippet + '\n' + content.slice(newInsertIndex);

// Update background-size of thumb-card to ensure it displays correctly
const thumbCardIndex = content.indexOf('.thumb-card {');
if (thumbCardIndex !== -1) {
    content = content.replace('.thumb-card {\n', '.thumb-card {\n  background-size: cover !important;\n  background-position: center !important;\n');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully injected ultra-fast realtime watcher and layout fixes.');

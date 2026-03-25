import fs from 'fs';
import path from 'path';

const file = path.resolve('./src/views/BibliotecaView.vue');
let content = fs.readFileSync(file, 'utf8');

// 1. IMPORT PDF.JS
if (!content.includes("import * as pdfjsLib from 'pdfjs-dist'")) {
    const importMatch = content.indexOf('import { useAuthStore }');
    const importSnippet = `import * as pdfjsLib from 'pdfjs-dist';\n// Inicializar worker igual que en editor\npdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();\n`;
    content = content.slice(0, importMatch) + importSnippet + content.slice(importMatch);
}

// 2. AÑADIR projectThumbnails AL SETUP
if (!content.includes('const projectThumbnails = ref<Record<string, string>>({});')) {
    const constMatch = content.indexOf('const authStore =');
    content = content.slice(0, constMatch) + `const projectThumbnails = ref<Record<string, string>>({});\n` + content.slice(constMatch);
}

// 3. AÑADIR LÓGICA DE CLONADO (generateThumbnailsForLibrary)
if (!content.includes('generateThumbnailsForLibrary')) {
    const loadPresentationsMatch = content.indexOf('const loadPresentations = async () => {');
    
    const logicSnippet = `
const generatePdfPreview = async (base64Data: string) => {
  try {
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.5 });
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error("Error generating PDF preview in library:", error);
    return null;
  }
};

const generateThumbnailsForLibrary = async (projectsArray: any[]) => {
  for (const project of projectsArray) {
    if (project.coverImage) {
      projectThumbnails.value[project._id] = project.coverImage;
    } else if (project.docType === 'pdf' && project.pdfBase64) {
      const url = await generatePdfPreview(project.pdfBase64);
      if (url) projectThumbnails.value[project._id] = url;
    } else if (project.docType === 'blank') {
      // Extrae la config de la página 1 guardada
      const page1 = project.slideConfigs?.[1];
      if (page1) {
        if (page1.bgImage) {
           projectThumbnails.value[project._id] = page1.bgImage;
        } else if (page1.bgColor) {
           // Fake a tiny 1x1 colored pixel or just save color
           projectThumbnails.value[project._id] = page1.bgColor;
        }
      }
    }
  }
};
`;
    content = content.slice(0, loadPresentationsMatch) + logicSnippet + '\n' + content.slice(loadPresentationsMatch);
    
    // Inyectar en la carga
    const fetchMatch = content.indexOf('presentations.value = await presentationService.getPresentationsByUserId(user.id);');
    const fetchReplace = `presentations.value = await presentationService.getPresentationsByUserId(user.id);
      // 🔥 NUEVO: Generar vistas previas nativas replicando lógica del editor
      generateThumbnailsForLibrary(presentations.value);`;
    content = content.replace('presentations.value = await presentationService.getPresentationsByUserId(user.id);', fetchReplace);
}

// 4. ACTUALIZAR RENDERIZADO DEL ESTILO `.project-thumbnail`
const styleMatch = `backgroundImage: project.coverImage ? 'url(' + project.coverImage + ')' : 'none',`;
const newStyleMatch = `backgroundImage: projectThumbnails[project._id] && projectThumbnails[project._id].startsWith('data:image') || projectThumbnails[project._id]?.startsWith('blob:') || projectThumbnails[project._id]?.startsWith('http') ? 'url(' + projectThumbnails[project._id] + ')' : 'none',
              backgroundColor: projectThumbnails[project._id] && projectThumbnails[project._id].startsWith('#') ? projectThumbnails[project._id] : 'transparent',`;
if (content.includes(styleMatch)) {
   content = content.replace(styleMatch, newStyleMatch);
}

// 5. ACTUALIZAR CONDICIONAL DEL ICONO (v-if="!project.coverImage")
const iconMatch = `v-if="!project.coverImage"`;
const newIconMatch = `v-if="!projectThumbnails[project._id]"`;
if (content.includes(iconMatch)) {
   content = content.replace(iconMatch, newIconMatch);
}

fs.writeFileSync(file, content, 'utf8');
console.log('BibliotecaView preview logic updated heavily.');

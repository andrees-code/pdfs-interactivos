import fs from 'fs';
import path from 'path';

const file = path.resolve('./src/views/BibliotecaView.vue');
let content = fs.readFileSync(file, 'utf8');

const targetIndex = content.indexOf('const createNewProject = () => {');

if (targetIndex !== -1) {
  const insert = `
const loadPresentations = async () => {
  isLoading.value = true
  try {
    const userId = authStore.user?._id || authStore.user?.id
    const allData = await presentationService.getUserPresentations(userId)
    presentations.value = allData.filter((p: any) => p.userId === userId)
    
    // Generar vistas previas nativas extrayendo Base64 u Objetos de las bases de datos de la presentacion
    if (typeof generateThumbnailsForLibrary === 'function') {
      generateThumbnailsForLibrary(presentations.value)
    }
  } catch (error) {
    console.error('Error cargando proyectos:', error)
  } finally {
    isLoading.value = false
  }
}

`;
  
  content = content.slice(0, targetIndex) + insert + content.slice(targetIndex);
  
  // Limpiar basura residual de la inyeccion fallida anterior ("const userId = authStore.user._id || authStore.user.id" sin función)
  const badStr1 = `    const userId = authStore.user._id || authStore.user.id
    if (!userId) return
    const allData = await presentationService.getUserPresentations(userId)
    generateThumbnailsForLibrary(allData)
    presentations.value = allData.sort(
      (a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),\n`;

  content = content.replace(badStr1, '');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Repaired loadPresentations logic successfully.');
} else {
  console.log('Failed to find anchor to inject.');
}

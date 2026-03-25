import fs from 'fs';
import path from 'path';

const file = path.resolve('./src/views/BibliotecaView.vue');
let content = fs.readFileSync(file, 'utf8');

// The multi_replace_file_content deleted loadPresentations and left dangling code.
// Let's replace the broken block with the correct loadPresentations block.

const brokenSnippetStart = content.indexOf('    const userId = authStore.user._id || authStore.user.id');
const brokenSnippetEnd = content.indexOf('const createNewProject = () => {');

if (brokenSnippetStart !== -1 && brokenSnippetEnd !== -1) {
  const correctSnippet = `
const loadPresentations = async () => {
  isLoading.value = true;
  try {
    const userId = authStore.user?._id || authStore.user?.id;
    if (!userId) return;
    
    // Fetch from backend
    const allData = await presentationService.getUserPresentations(userId);
    
    // Filter for current user
    const filtered = allData.filter((p: any) => p.userId === userId);
    
    // Generate native previews directly from base64 PDF and slide objects!
    if (typeof generateThumbnailsForLibrary === 'function') {
      generateThumbnailsForLibrary(filtered);
    }
    
    // Sort and assign
    presentations.value = filtered.sort(
      (a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('Error cargando proyectos:', error);
  } finally {
    isLoading.value = false;
  }
};

`;
  
  content = content.slice(0, brokenSnippetStart) + correctSnippet + content.slice(brokenSnippetEnd);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Restored loadPresentations successfully.');
} else {
  console.log('Could not find broken snippet boundaries.');
}

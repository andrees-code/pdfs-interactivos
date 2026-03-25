import fs from 'fs';
import path from 'path';

// 1. Fix BibliotecaView
const bibPath = path.resolve('./src/views/BibliotecaView.vue');
if (fs.existsSync(bibPath)) {
  let content = fs.readFileSync(bibPath, 'utf8');
  content = content.replace(/z-index:\s*50;/g, 'z-index: 9999;');
  content = content.replace(/z-index:\s*100;/g, 'z-index: 10000;');
  fs.writeFileSync(bibPath, content, 'utf8');
  console.log('Fixed Z-index in BibliotecaView');
}

// 2. Fix EditorHeader
const headerPath = path.resolve('./src/components/EditorHeader.vue');
if (fs.existsSync(headerPath)) {
  let content = fs.readFileSync(headerPath, 'utf8');
  content = content.replace(/z-index:\s*10;/g, 'z-index: 9999;');
  content = content.replace(/z-index:\s*100;/g, 'z-index: 10000;');
  fs.writeFileSync(headerPath, content, 'utf8');
  console.log('Fixed Z-index in EditorHeader');
}

// 3. Fix EditorPresentacionesView Thumbnails fluidity
const editorPath = path.resolve('./src/views/EditorPresentacionesView.vue');
if (fs.existsSync(editorPath)) {
  let content = fs.readFileSync(editorPath, 'utf8');
  
  // Aceptamos cualquier transition existente en thumb-card y la enriquecemos, o simplemente la forzamos.
  const thumbCardMatch = /\.thumb-card\s*\{/g;
  content = content.replace(thumbCardMatch, '.thumb-card {\n  transition: background-image 0.4s cubic-bezier(0.25, 1, 0.5, 1), transform 0.2s;\n  will-change: background-image, transform;\n');
  
  const thumbIconMatch = /\.thumb-icon\s*\{/g;
  content = content.replace(thumbIconMatch, '.thumb-icon {\n  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);\n');
  
  fs.writeFileSync(editorPath, content, 'utf8');
  console.log('Added fluidity to thumbnails in EditorPresentacionesView');
}

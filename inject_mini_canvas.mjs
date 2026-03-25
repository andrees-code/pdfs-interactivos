import fs from 'fs';
import path from 'path';

const file = path.resolve('./src/views/BibliotecaView.vue');
let content = fs.readFileSync(file, 'utf8');

// 1. INYECTAR LA FUNCIÓN getMiniElementStyle
if (!content.includes('getMiniElementStyle')) {
  const methodAnchor = content.indexOf('const formatTime =');
  const styleMethod = `
const getMiniElementStyle = (el: any, p: any) => {
   const bw = p.baseWidth || 1280;
   const bh = p.baseHeight || 720;
   const scaleX = 100 / bw;
   const scaleY = 100 / bh;
   const fakeThumbnailWidth = 300; 
   const fontScale = fakeThumbnailWidth / bw;

   return {
      position: 'absolute',
      left: (el.x * scaleX) + '%',
      top: (el.y * scaleY) + '%',
      width: el.width === 'auto' ? 'auto' : (el.width * scaleX) + '%',
      height: el.height === 'auto' ? 'auto' : (el.height * scaleY) + '%',
      backgroundColor: el.type === 'text' ? (el.textBgColor || 'transparent') : (el.bgColor || 'transparent'),
      color: el.textColor || el.color || '#fff',
      opacity: el.opacity !== undefined ? el.opacity : 1,
      transform: 'rotate(' + (el.rotation || 0) + 'deg)',
      mixBlendMode: el.mixBlendMode || 'normal',
      backgroundImage: el.type === 'image' && el.src ? 'url(' + el.src + ')' : 'none',
      backgroundSize: '100% 100%',
      fontSize: ((el.fontSize || 16) * fontScale) + 'px',
      borderRadius: (el.borderRadius ? el.borderRadius * fontScale : (el.type === 'sticky' ? 2 : 0)) + 'px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: el.textAlign === 'center' ? 'center' : (el.textAlign === 'right' ? 'flex-end' : 'flex-start'),
      padding: el.type === 'sticky' || el.textBgColor !== 'transparent' ? '2px' : '0',
      border: el.borderWidth ? (el.borderWidth * fontScale) + 'px solid ' + el.borderColor : 'none',
   };
};
`;
  content = content.slice(0, methodAnchor) + styleMethod + content.slice(methodAnchor);
}

// 2. INYECTAR EL DOM DEL MINI-CANVAS DENTRO DE PROJECT-THUMBNAIL
// Buscamos: <div class="thumb-actions"> y lo reemplazamos con el canvas Y el thumb actions
const domAnchor = `<div class="thumb-actions">`;
if (content.includes(domAnchor) && !content.includes('class="mini-canvas-layer"')) {
  const domInsert = `
            <!-- Capa Miniatura Nativa para "las herramientas" -->
            <div 
              class="mini-canvas-layer" 
              v-if="!project.coverImage && project.documentState && project.documentState[1]" 
              style="position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index: 5;"
            >
              <div 
                v-for="el in project.documentState[1]" 
                :key="'mini-'+el.id" 
                :style="getMiniElementStyle(el, project)"
              >
                <!-- Solo renderizamos texto si es sticky, text o mindmap -->
                <span v-if="el.type === 'text' || el.type === 'sticky'" style="line-height:1.1; display:block; width:100%;">
                  {{ el.content }}
                </span>
              </div>
            </div>

            <div class="thumb-actions">`;
  content = content.replace(domAnchor, domInsert);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Script injection of mini-canvas successful.');

import fs from 'fs';
import path from 'path';

const file = path.resolve('./src/views/BibliotecaView.vue');
let content = fs.readFileSync(file, 'utf8');

// 1. REEMPLAZAR getMiniElementStyle
const oldMethodStart = content.indexOf('const getMiniElementStyle =');
const oldMethodEnd = content.indexOf('};', oldMethodStart) + 2;

if (oldMethodStart !== -1 && oldMethodEnd !== -1) {
    const updatedMethod = `const getMiniElementStyle = (el: any, p: any) => {
   const bw = p.baseWidth || 1280;
   const bh = p.baseHeight || 720;
   const scaleX = 100 / bw;
   const scaleY = 100 / bh;
   const fakeThumbnailWidth = 300; 
   const fontScale = fakeThumbnailWidth / bw;

   let br = (el.borderRadius ? el.borderRadius * fontScale : 0) + 'px';
   if (el.type === 'ellipse') br = '50%';
   else if (el.type === 'sticky') br = '0 0 4px 1px';

   // Parse shadows safely
   let shadow = el.boxShadow || 'none';
   if (shadow !== 'none' && shadow.includes('px')) {
      // Intentar escalar box-shadow pero es complejo, lo dejamos nativo o sutil:
      // Solo tomamos el string crudo, en preview se verá bien
   }

   return {
      position: 'absolute',
      left: (el.x * scaleX) + '%',
      top: (el.y * scaleY) + '%',
      width: el.width === 'auto' ? 'auto' : (el.width * scaleX) + '%',
      height: el.height === 'auto' ? 'auto' : (el.height * scaleY) + '%',
      backgroundColor: el.type === 'text' || el.type === 'sticky' ? (el.textBgColor || 'transparent') : (el.bgColor || 'transparent'),
      color: el.textColor || el.color || '#fff',
      opacity: el.opacity !== undefined ? Number(el.opacity) : 1,
      transform: 'rotate(' + (el.rotation || 0) + 'deg)',
      mixBlendMode: el.mixBlendMode || 'normal',
      backgroundImage: el.type === 'image' && el.src ? 'url(' + el.src + ')' : 'none',
      backgroundSize: '100% 100%',
      fontSize: ((el.fontSize || 16) * fontScale) + 'px',
      borderRadius: br,
      boxShadow: shadow,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: el.textAlign === 'center' ? 'center' : (el.textAlign === 'right' ? 'flex-end' : 'flex-start'),
      padding: el.type === 'sticky' || (el.type === 'text' && el.textBgColor !== 'transparent') ? '2px' : '0',
      border: el.borderWidth ? (el.borderWidth * fontScale) + 'px solid ' + el.borderColor : 'none',
   };
};`;
    // We overwrite ONLY the function
    const endFunctionBound = content.indexOf('};', oldMethodStart) + 2;
    content = content.slice(0, oldMethodStart) + updatedMethod + content.slice(endFunctionBound);
}

// 2. AÑADIR LOS ESTILOS DEL BOTON DE EDITAR Y ZINDEX
const cssTarget = '.thumb-actions {';
const cssReplace = `.thumb-actions {
  z-index: 20; /* Elevado sobre el mini-canvas */`;

if (content.includes(cssTarget) && !content.includes('z-index: 20; /* Elevado')) {
    content = content.replace(cssTarget, cssReplace);
}

// Y el hover espectacular del botón
const hoverTarget = `.project-thumbnail:hover .thumb-actions {
  opacity: 1;
}`;

const hoverReplace = `.project-thumbnail:hover .thumb-actions {
  opacity: 1;
}

.thumb-actions .btn-primary {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 15px rgba(56, 139, 253, 0.3);
}

.thumb-actions .btn-primary:hover {
  transform: scale(1.15) translateY(-2px);
  box-shadow: 0 8px 25px rgba(56, 139, 253, 0.6);
  background: var(--accent-primary-hover);
}`;

if (content.includes(hoverTarget) && !content.includes('cubic-bezier(0.34')) {
    content = content.replace(hoverTarget, hoverReplace);
}

fs.writeFileSync(file, content, 'utf8');
console.log('DOM parser fidelity updated successfully.');

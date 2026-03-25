import fs from 'fs';
import path from 'path';

const file = path.resolve('./src/views/BibliotecaView.vue');
let content = fs.readFileSync(file, 'utf8');

const badAnchorInfo = content.indexOf('const getMiniElementStyle = (el: any, p: any) => {');
if (badAnchorInfo !== -1) {
    // Tomamos la logica de la funcion desde la caida EOF
    const methodBody = `
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
    // Borramos el bloque mal formado (TODO el bloque hasta el penultimo caracter, que sería \n o similar)
    // Es mas seguro reemplazar literalmente la versión inyectada que ya sabemos cómo luce.
    // Usaremos un substring.
    content = content.replace(methodBody, ''); // Asume comillas exactas. Si falla, localizamos por string.
    
    // Si no funcionó el replace exacto, removemos manualmente
    const badStart = content.indexOf('const getMiniElementStyle =');
    if (badStart !== -1) {
       content = content.slice(0, badStart);
       const closeTag = '</style>';
       if (!content.includes(closeTag)) content += '\n</style>\n';
    }

    // Inyectarlo ANTES de formatDate
    const goodAnchor = content.indexOf('const formatDate =');
    if (goodAnchor !== -1) {
        content = content.slice(0, goodAnchor) + methodBody + content.slice(goodAnchor);
    } else {
        // En caso remoto de no encontrar formatDate
        const setupAnchor = content.indexOf('const loadPresentations =');
        content = content.slice(0, setupAnchor) + methodBody + content.slice(setupAnchor);
    }
    
    // Fix: the missing '>' from the eof slice glitch
    if (content.endsWith('</style')) {
         content += '>';
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log('Function scope repaired successfully.');
} else {
    console.log('Function not found.');
}

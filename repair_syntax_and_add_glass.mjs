import fs from 'fs';
import path from 'path';

const file = path.resolve('./src/views/BibliotecaView.vue');
let content = fs.readFileSync(file, 'utf8');

// The file has a duplicate '};' near const formatDate =
const buggySyntax = `   };
};
};
`;
const buggySyntax2 = `   };
};
const formatDate =`;

if (content.includes('};\n};\n};')) {
    content = content.replace('};\n};\n};', '};\n};');
}
if (content.includes('};\n};\nconst formatDate')) {
    content = content.replace('};\n};\nconst formatDate', '};\nconst formatDate');
}
// Un enfoque más agresivo y robusto para capturar las llaves duplicadas al final de getMiniElementStyle
// Sabemos que terminó en border: ... 'none', }; };
const endOfObject = `border: el.borderWidth ? (el.borderWidth * fontScale) + 'px solid ' + el.borderColor : 'none',\n   };\n};`;

const badBlock = endOfObject + `\n};\n`;
if (content.includes(badBlock)) {
   content = content.replace(badBlock, endOfObject + '\n');
} else {
   // Apenas reemplazar 3 llaves seguidas
   content = content.replace(/};\s*};\s*};/g, '};\n};');
   content = content.replace(/};\s*};\s*const formatDate/g, '};\nconst formatDate');
}

// Ahora, vamos a añadir el soporte de isGlass a nuestro objeto devuelto
const opacityTarget = `opacity: el.opacity !== undefined ? Number(el.opacity) : 1,`;
const glassTarget = `opacity: el.opacity !== undefined ? Number(el.opacity) : 1,
      backdropFilter: el.isGlass ? 'blur(10px)' : 'none',
      WebkitBackdropFilter: el.isGlass ? 'blur(10px)' : 'none',`;

if (content.includes(opacityTarget) && !content.includes('backdropFilter: el.isGlass')) {
    content = content.replace(opacityTarget, glassTarget);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Syntax repaired and isGlass supported.');

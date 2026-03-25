import fs from 'fs';
import path from 'path';

const file = path.resolve('./src/views/EditorPresentacionesView.vue');
let content = fs.readFileSync(file, 'utf8');

const styleIndex = content.lastIndexOf('<style scoped>');
if (styleIndex === -1) {
  console.log('No style scoped found.');
  process.exit(1);
}

let scriptAndTemplate = content.slice(0, styleIndex);
let styleBlock = content.slice(styleIndex);

const replacements = [
  { match: /#0d1117/gi, replace: 'var(--bg-base)' },
  { match: /#161b22/gi, replace: 'rgba(17, 17, 19, 0.7)' }, // Glass base
  { match: /#30363d/gi, replace: 'var(--border-strong)' },
  { match: /#c9d1d9/gi, replace: 'var(--text-primary)' },
  { match: /#8b949e/gi, replace: 'var(--text-secondary)' },
  { match: /#58a6ff/gi, replace: 'var(--accent-primary)' },
  { match: /#1f6feb/gi, replace: 'var(--accent-primary-hover)' },
  { match: /#2ea043/gi, replace: 'var(--success)' },
  { match: /#238636/gi, replace: 'var(--success)' },
  { match: /#f85149/gi, replace: 'var(--danger-hover)' },
  { match: /#ff7b72/gi, replace: 'var(--danger)' },
  { match: /#21262d/gi, replace: 'var(--bg-surface-active)' },
  { match: /#484f58/gi, replace: 'var(--border-subtle)' },
];

for (const { match, replace } of replacements) {
  styleBlock = styleBlock.replace(match, replace);
}

// Inject glassmorphism and transitions to key components
const structuralHacks = [
  {
    find: /\.pro-sidebar \{/g,
    replace: '.pro-sidebar {\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  background: rgba(17, 17, 19, 0.65) !important;\n  border-right: 1px solid var(--glass-border) !important;\n  box-shadow: 4px 0 24px rgba(0,0,0,0.3) !important;\n  z-index: 40;'
  },
  {
    find: /\.properties-panel \{/g,
    replace: '.properties-panel {\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  background: rgba(17, 17, 19, 0.65) !important;\n  border-left: 1px solid var(--glass-border) !important;\n  box-shadow: -4px 0 24px rgba(0,0,0,0.3) !important;\n  z-index: 40;'
  },
  {
    find: /\.pro-top-toolbar \{/g,
    replace: '.pro-top-toolbar {\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  background: rgba(17, 17, 19, 0.7) !important;\n  border-bottom: 1px solid var(--glass-border) !important;\n  border-radius: 0 0 var(--radius-lg) var(--radius-lg);\n  box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;\n  z-index: 30;\n  margin: 0px 10px;\n  width: calc(100% - 20px);\n'
  },
  {
    find: /\.pro-canvas-area \{/g,
    replace: '.pro-canvas-area {\n  background-color: var(--bg-base);\n  background-image: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 60%);\n'
  },
  {
    find: /\.canvas-wrapper \{/g,
    replace: '.canvas-wrapper {\n  transition: transform 0.15s cubic-bezier(0.2, 0, 0, 1);\n  will-change: transform;\n'
  },
  {
    find: /\.interactive-element \{/g,
    replace: '.interactive-element {\n  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;\n  will-change: transform, opacity;\n'
  },
  {
    find: /\.tool-btn \{/g,
    replace: '.tool-btn {\n  transition: all var(--transition-bounce);\n  border-radius: var(--radius-sm);\n'
  },
  {
    find: /\.tool-btn:hover \{/g,
    replace: '.tool-btn:hover {\n  transform: translateY(-2px);\n'
  },
  {
    find: /\.layer-engine \{/g,
    replace: '.layer-engine {\n  box-shadow: var(--shadow-lg) !important;\n  border: 1px solid var(--glass-border);\n'
  }
];

for (const { find, replace } of structuralHacks) {
  styleBlock = styleBlock.replace(find, replace);
}

fs.writeFileSync(file, scriptAndTemplate + styleBlock, 'utf8');
console.log('Successfully refactored Editor CSS.');

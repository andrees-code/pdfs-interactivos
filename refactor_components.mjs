import fs from 'fs';
import path from 'path';

const files = [
  './src/components/EditorHeader.vue',
  './src/components/IconPickerModal.vue',
  './src/App.vue'
];

const replacements = [
  { match: /#0d1117/gi, replace: 'var(--bg-base)' },
  { match: /#161b22/gi, replace: 'rgba(17, 17, 19, 0.7)' },
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

for (const fp of files) {
  const fullPath = path.resolve(fp);
  if (!fs.existsSync(fullPath)) continue;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const styleIndex = content.lastIndexOf('<style scoped>');
  if (styleIndex === -1 && content.lastIndexOf('<style>') === -1) {
      continue;
  }
  
  for (const { match, replace } of replacements) {
    content = content.replace(match, replace);
  }
  
  // Specific glassmorphism upgrades for components
  if (fp.includes('EditorHeader.vue')) {
    content = content.replace('.pro-header {', '.pro-header {\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  background: rgba(17, 17, 19, 0.8) !important;\n');
    content = content.replace('.user-dropdown {', '.user-dropdown {\n  backdrop-filter: blur(16px);\n  background: rgba(17, 17, 19, 0.8) !important;\n');
  } else if (fp.includes('IconPickerModal.vue')) {
    content = content.replace('.modal-container {', '.modal-container {\n  backdrop-filter: blur(24px);\n  -webkit-backdrop-filter: blur(24px);\n  background: rgba(17, 17, 19, 0.85) !important;\n  border: 1px solid var(--glass-border);\n  box-shadow: var(--shadow-lg);\n');
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Refactored ${fp}`);
}

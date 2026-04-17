export default {
  // 1. La URL exacta de tu proyecto en Vercel
  site: 'https://pdfs-interactivos.vercel.app',
  
  scanner: {
    // 2. Obliga al robot a ejecutar tu JavaScript para que pueda "ver" tus menús y enlaces
    skipJavascript: false,
  },
  
  puppeteerClusterOptions: {
    // 3. Le da 60 segundos (en lugar de 30) a cada página para cargar, vital para los PDFs
    timeout: 60000,
    // 4. Analiza las páginas de 1 en 1 para que el servidor y tu memoria no colapsen
    maxConcurrency: 1
  }
}
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {trackingApiPlugin} from './server/viteTracking.ts';

export default defineConfig({
  appType: 'mpa',
  plugins: [react(),trackingApiPlugin()],
  server: {
    host: '127.0.0.1', port: 5173, strictPort: true,
    watch: { ignored: ['**/.codex-tools/**','**/.agents/**','**/reference/**','**/tools/**','**/docs/**'] },
  },
  // This workspace also contains hundreds of skill/demo HTML files. Scan only the app entry.
  optimizeDeps: { entries: ['index.html','about/index.html','tracking/index.html','contact/index.html'], include: ['react','react-dom/client'] },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  build: { target: 'es2022',rolldownOptions:{input:{home:'index.html',about:'about/index.html',tracking:'tracking/index.html',contact:'contact/index.html'}} },
});

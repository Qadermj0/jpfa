import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
   base: '/jpfa/',
  plugins: [react()],
  server: {
    port: 5175, // يتطابق مع المنفذ الافتراضي لـ Vite 7.0.0
  },
});
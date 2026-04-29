import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    define: {
        'process.env.NODE_ENV': '"production"'
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/content/injectPanel.tsx'),
            name: 'ContentScript',
            fileName: () => 'content.js', // Force exact filename
            formats: ['iife']
        },
        outDir: 'dist',
        emptyOutDir: false,
        cssCodeSplit: false,
        rollupOptions: {
            output: {
                extend: true,
            }
        },
        minify: false
    },
});

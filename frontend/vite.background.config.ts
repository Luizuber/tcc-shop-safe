import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/background/background.ts'),
            name: 'BackgroundScript',
            fileName: () => 'background.js',
            formats: ['cjs']
        },
        outDir: 'dist',
        emptyOutDir: false
    },
});

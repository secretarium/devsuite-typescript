/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    cacheDir: '../../node_modules/.vite/klave',

    server: {
        port: 4220,
        host: 'localhost'
    },

    preview: {
        port: 4320,
        host: 'localhost'
    },

    plugins: [
        react(),
        viteTsConfigPaths({
            root: '.'
        })
    ]
});

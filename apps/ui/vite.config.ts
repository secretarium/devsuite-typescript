/// <reference types='vitest' />
import { defineConfig } from 'vite';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* @ts-expect-error */
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
    root: __dirname,
    cacheDir: '../../node_modules/.vite/ui',

    server: {
        port: 4200,
        host: 'localhost'
    },

    preview: {
        port: 4300,
        host: 'localhost'
    },

    plugins: [react(), nxViteTsPaths(), tailwindcss(), TanStackRouterVite()],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },

    build: {
        outDir: '../../dist/ui',
        reportCompressedSize: true,
        commonjsOptions: {
            transformMixedEsModules: true
        }
    },

    define: {
        'import.meta.vitest': undefined
    },
    test: {
        globals: true,
        cache: {
            dir: '../../node_modules/.vitest'
        },
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        includeSource: ['src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        reporters: ['default'],
        coverage: {
            reportsDirectory: '../../coverage/ui',
            provider: 'v8'
        }
    }
});

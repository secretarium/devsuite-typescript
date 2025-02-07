/// <reference types='vitest' />
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import git from 'git-rev-sync';
import { version } from './package.json';

export default defineConfig({
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/pda-front',

    server: {
        port: 3380,
        host: 'localhost',
        fs: {
            allow: [
                searchForWorkspaceRoot(process.cwd())
            ]
        }
    },

    preview: {
        port: 3385,
        host: 'localhost'
    },

    plugins: [react(), nxViteTsPaths(), tailwindcss(), TanStackRouterVite({
        routesDirectory: path.join(__dirname, 'src/routes'),
        generatedRouteTree: path.join(__dirname, './src/routeTree.gen.ts'),
        enableRouteGeneration: true,
        autoCodeSplitting: true
    })],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },

    build: {
        emptyOutDir: true,
        outDir: '../../dist/apps/pda-front',
        chunkSizeWarningLimit: 1024,
        reportCompressedSize: true,
        rollupOptions: {
            treeshake: 'smallest',
            output: {
                compact: true,
                manualChunks: {
                    react: ['react', 'react-dom']
                }
            }
        },
        commonjsOptions: {
            transformMixedEsModules: true
        }
    },

    define: {
        'import.meta.vitest': undefined,
        'import.meta.env.VITE_REPO_COMMIT': JSON.stringify(git.long('.')),
        'import.meta.env.VITE_REPO_BRANCH': JSON.stringify(git.branch('.')),
        'import.meta.env.VITE_REPO_DIRTY': git.isDirty(),
        'import.meta.env.VITE_REPO_VERSION': JSON.stringify(version)
    },

    test: {
        globals: true,
        cache: {
            dir: '../../node_modules/.vitest/apps/pda-front'
        },
        environment: 'jsdom',
        setupFiles: './fixtures/vitest.env.setup.ts',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        includeSource: ['src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        reporters: ['default'],
        coverage: {
            reportsDirectory: '../../coverage/apps/pda-front',
            provider: 'v8'
        }
    }
});

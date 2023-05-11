import { Worker } from 'node:worker_threads';
import { resolve } from 'node:path';
// import { fileURLToPath } from 'node:url';

export const createCompilter = () => {
    console.log('createCompilter _dir  ', require.resolve('@klave/compiler'));
    console.log('createCompilter .     ', resolve('.', 'compilerModule.mjs'));
    console.log('createCompilter @klave', resolve('@klave/compiler', 'src', 'compilerModule.mjs'));
    const compiler = new Worker(__dirname + '/compilerModule.mjs', {
        name: 'Klave WASM Compiler',
        env: {},
        argv: []
    });
    compiler.postMessage({ type: 'compile' });
    return compiler;
};

import { Worker } from 'node:worker_threads';

export const createCompiler = async () => {
    const compiler = new Worker(__dirname + '/compilerModule.mjs', {
        name: 'Klave WASM Compiler',
        env: {},
        argv: []
    });
    compiler.postMessage({ type: 'compile' });
    return compiler;
};

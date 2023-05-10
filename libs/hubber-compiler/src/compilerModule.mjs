'use strict';

import { parentPort } from 'node:worker_threads';
import { PassThrough } from 'node:stream'; 'node:stream';
import { serializeError } from 'serialize-error';
import assemblyscript from 'assemblyscript/asc';

/** @type {import('assemblyscript/dist/asc.d.ts')} */
const asc = assemblyscript;
const pendingResolves = {};

const compileStdOut = new PassThrough();
const compileStdErr = new PassThrough();

parentPort.on('message', (message) => {
    if (message.type === 'compile') {
        parentPort.postMessage({
            type: 'start',
            version: asc.version
        });
        asc.main([
            '.',
            '--exportRuntime',
            '--traceResolution',
            '-O', '--noAssert',
            '--optimizeLevel', '3',
            '--shrinkLevel', '2',
            '--converge',
            '--outFile', 'out.wasm',
            '--textFile', 'out.wat'
        ], {
            stdout: compileStdOut,
            stderr: compileStdErr,
            reportDiagnostic: (diagnostics) => {
                parentPort.postMessage({
                    type: 'diagnostic',
                    diagnostics
                });
            },
            readFile: async (filename) => {
                return await new Promise((resolve) => {
                    pendingResolves[filename] = resolve;
                    parentPort.postMessage({
                        type: 'read',
                        filename
                    });
                }).catch(() => {
                    pendingResolves[filename](null);
                    delete pendingResolves[message.filename];
                });
            },
            writeFile: async (filename, contents) => {
                parentPort.postMessage({
                    type: 'write',
                    filename,
                    contents
                });
            }
        }).then((result) => {
            if (result.error) {
                parentPort.postMessage({
                    type: 'errored',
                    error: serializeError(result.error)
                });
            } else
                parentPort.postMessage({
                    type: 'done',
                    stats: result.stats.toString(),
                    stdout: compileStdOut.read(),
                    stderr: compileStdErr.read()
                });
        }).catch((error) => {
            parentPort.postMessage({
                type: 'errored',
                error: serializeError(error)
            });
        });
    } else if (message.type === 'read') {
        if (pendingResolves[message.filename]) {
            pendingResolves[message.filename](message.contents);
            delete pendingResolves[message.filename];
        }
    }
});
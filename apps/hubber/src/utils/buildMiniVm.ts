import stream from 'node:stream';
import nodePath from 'node:path';
// import { writeFile } from 'fs-extra';
// import { loopWhile } from 'deasync';
import { ErrorObject, serializeError } from 'serialize-error';
import type { Stats } from 'assemblyscript/dist/asc';
import { createCompilter } from '../utils/compilerWorker';
import type { Context } from 'probot';
import { KlaveRcConfiguration } from '@secretarium/trustless-app';
import { DeploymentPushPayload } from '@secretarium/hubber-api';
import { Repo } from '@prisma/client';
import { dummyMap } from './dummyVmFs';

type BuildOutput = {
    success: true;
    result: {
        stats: Stats;
        binary: Uint8Array;
    };
    stdout: stream.Duplex;
    stderr: stream.Duplex;
} | {
    success: false;
    error?: Error | ErrorObject;
}

type BuildMiniVMEvent = 'start' | 'error' | 'done'
type BuildMiniVMEventHandler = (result?: BuildOutput) => void;

export type DeploymentContext<Type> = {
    octokit: Context['octokit']
} & Type;

export class BuildMiniVM {

    private eventHanlders: Partial<Record<BuildMiniVMEvent, BuildMiniVMEventHandler[]>> = {};

    constructor(private options: {
        type: 'github';
        context: DeploymentContext<DeploymentPushPayload>;
        repo: Repo;
        application: KlaveRcConfiguration['applications'][number];
    }) { }

    getContentSync(path: string): string | null {
        const normalisedPath = path.split(nodePath.sep).join(nodePath.posix.sep);
        return dummyMap[normalisedPath] ?? null;
    }

    async getContent(path: string): Promise<Awaited<ReturnType<typeof octokit.repos.getContent>> | { data: string | null }> {

        const { context: { octokit, ...context }, repo } = this.options;

        try {
            return await octokit.repos.getContent({
                owner: repo.owner,
                repo: repo.name,
                ref: context.commit.ref,
                path,
                mediaType: {
                    format: 'raw+json'
                }
            });
        } catch {
            return { data: this.getContentSync(path) };
        }
    }

    async getRootContent() {
        try {
            const content = await this.getContent(`${this.options.application.rootDir}`);
            if (typeof content.data === 'object' && Array.isArray(content.data)) {
                const compilableFiles = content.data.find(file => ['index.ts'].includes(file.name));
                return await this.getContent(`${compilableFiles?.path}`);
            } else
                return content;
        } catch (e) {
            console.error(e);
            return { data: null };
        }
    }

    on(event: BuildMiniVMEvent, callback: BuildMiniVMEventHandler) {
        this.eventHanlders[event] = [
            ...(this.eventHanlders[event] ?? []),
            callback
        ];
    }

    async build(): Promise<BuildOutput> {

        const rootContent = await this.getRootContent();
        dummyMap['..ts'] = rootContent?.data?.toString() ?? null;

        let compiledBinary = new Uint8Array(0);
        const compiler = createCompilter();
        try {
            return new Promise<BuildOutput>((resolve) => {
                compiler.on('message', (message) => {
                    if (message.type === 'start') {
                        this.eventHanlders['start']?.forEach(handler => handler());
                    } else if (message.type === 'read') {
                        this.getContent(message.filename).then(contents => {
                            compiler.postMessage({
                                type: 'read',
                                filename: message.filename,
                                contents: contents.data
                            });
                        });
                    } else if (message.type === 'write') {
                        if (message.filename.includes('.wasm')) {
                            compiledBinary = message.contents;
                        }
                    } else if (message.type === 'diagnostic') {
                        console.log(message.diagnostics);
                    } else if (message.type === 'errored') {
                        console.error(message.error);
                        this.eventHanlders['error']?.forEach(handler => handler());
                        compiler.terminate().finally(() => {
                            resolve({
                                success: false,
                                error: message.error
                            });
                        });
                    } else if (message.type === 'done') {
                        const output = {
                            success: true,
                            result: {
                                stats: message.stats,
                                binary: compiledBinary
                            },
                            stdout: message.stdout,
                            stderr: message.stderr
                        };
                        this.eventHanlders['done']?.forEach(handler => handler(output));
                        compiler.terminate().finally(() => {
                            resolve(output);
                        });
                    }
                });
            });
        } catch (error) {
            console.error(serializeError(error));
            return {
                success: false,
                error: serializeError(error)
            };
        }
    }
}

export default BuildMiniVM;
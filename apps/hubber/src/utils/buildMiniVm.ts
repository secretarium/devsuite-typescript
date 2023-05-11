import nodePath from 'node:path';
import { sigstore } from 'sigstore';
import { ErrorObject, serializeError } from 'serialize-error';
import type { Stats } from 'assemblyscript/dist/asc';
import { createCompilter } from '@klave/compiler';
import type { Context } from 'probot';
import { KlaveRcConfiguration } from '@klave/sdk';
import { DeploymentPushPayload } from '@secretarium/hubber-api';
import { Repo } from '@prisma/client';
import { dummyMap } from './dummyVmFs';

type BuildOutput = {
    stdout: string;
    stderr: string;
} & ({
    success: true;
    result: {
        stats: Stats;
        wasm: Uint8Array;
        wat?: string;
        dts?: string;
        signature?: sigstore.Bundle;
    };
} | {
    success: false;
    error?: Error | ErrorObject;
})

type BuildMiniVMEvent = 'start' | 'emit' | 'diagnostic' | 'error' | 'done'
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
            console.error('BuildMiniVm:getRootContent', e);
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
        let compiledWAT: string | undefined;
        let compiledDTS: string | undefined;
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
                                id: message.id,
                                contents: contents.data
                            });
                        });
                    } else if (message.type === 'write') {
                        this.eventHanlders['emit']?.forEach(handler => handler(message));
                        if ((message.filename as string).endsWith('.wasm'))
                            compiledBinary = message.contents;
                        if ((message.filename as string).endsWith('.wat'))
                            compiledWAT = message.contents;
                        if ((message.filename as string).endsWith('.d.ts'))
                            compiledDTS = message.contents;
                    } else if (message.type === 'diagnostic') {
                        this.eventHanlders['diagnostic']?.forEach(handler => handler(message));
                    } else if (message.type === 'errored') {
                        this.eventHanlders['error']?.forEach(handler => handler(message));
                        compiler.terminate().finally(() => {
                            resolve({
                                success: false,
                                error: message.error,
                                stdout: message.stdout ?? '',
                                stderr: message.stderr ?? ''
                            });
                        });
                    } else if (message.type === 'done') {
                        let signature: sigstore.Bundle;
                        // TODO Add OIDC token
                        sigstore.sign(Buffer.from(compiledBinary), { identityToken: '' })
                            .then(bundle => {
                                signature = bundle;
                            })
                            .catch(() => { return; })
                            .finally(() => {
                                const output = {
                                    success: true,
                                    result: {
                                        stats: message.stats,
                                        wasm: compiledBinary,
                                        wat: compiledWAT,
                                        dts: compiledDTS,
                                        signature
                                    },
                                    stdout: message.stdout ?? '',
                                    stderr: message.stderr ?? ''
                                };
                                this.eventHanlders['done']?.forEach(handler => handler(output));
                                compiler.terminate().finally(() => {
                                    resolve(output);
                                });
                            });
                    }
                });
            });
        } catch (error) {
            console.error('BuildMiniVm:build', serializeError(error));
            return {
                success: false,
                error: serializeError(error),
                stdout: '',
                stderr: ''
            };
        }
    }
}

export default BuildMiniVM;
import stream from 'node:stream';
import nodePath from 'node:path';
// import { writeFile } from 'fs-extra';
// import { loopWhile } from 'deasync';
import * as asc from 'assemblyscript/cli/asc';
import type { Context } from 'probot';
import { KlaveRcConfiguration } from '@secretarium/trustless-app';
import { DeploymentPushPayload } from '@secretarium/hubber-api';
import { Repo } from '@prisma/client';
import { dummyMap } from './dummyVmFs';

type BuildOutput = {
    success: true;
    stdout: stream.Duplex;
    stderr: stream.Duplex;
    binary: Uint8Array;
} | {
    success: false;
}

export type DeploymentContext<Type> = {
    octokit: Context['octokit']
} & Type;

export class BuildMiniVM {
    constructor(private options: {
        type: 'github';
        context: DeploymentContext<DeploymentPushPayload>;
        repo: Repo;
        application: KlaveRcConfiguration['applications'][number];
    }) { }

    async getContent(path: string): ReturnType<typeof octokit.repos.getContent> {

        console.log(`Reading ${path}`);
        const { context: { octokit, ...context }, repo } = this.options;

        return await octokit.repos.getContent({
            owner: repo.owner,
            repo: repo.name,
            ref: context.commit.ref,
            path,
            mediaType: {
                format: 'raw+json'
            }
        });
    }

    getContentSync(path: string): string | null {
        const normalisedPath = path.split(nodePath.sep).join(nodePath.posix.sep);
        return dummyMap[normalisedPath] ?? null;
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
            return null;
        }
    }

    async build(): Promise<BuildOutput> {

        const { application, context: { commit } } = this.options;

        console.log(`Building ${application.name} from ${application.rootDir} @ ${commit.ref} ...`);

        const rootContent = await this.getRootContent();
        dummyMap['..ts'] = rootContent?.data.toString() ?? null;

        let compiledBinary = new Uint8Array(0);
        const compileStdOut = new stream.Duplex();
        const compileStdErr = new stream.Duplex();

        try {
            return new Promise((resolve) => {
                asc.main([
                    '.',
                    // '--stats',
                    // '--noUnsafe',
                    '--exportRuntime',
                    '--traceResolution',
                    '-O', '--noAssert',
                    '--optimizeLevel', '3',
                    '--shrinkLevel', '2',
                    '--converge',
                    '--binaryFile', 'out.wasm',
                    '--textFile', 'out.wat',
                    '--tsdFile', 'out.d.ts',
                    '--idlFile', 'out.idl'
                    // '--',
                    // '--title="Klave WASM Compiler"',
                    // '--enable-fips'
                ], {
                    // stdout: compileStdOut,
                    // stderr: compileStdErr,
                    reportDiagnostic: (diagnostic) => {
                        console.log(diagnostic);
                        console.log(diagnostic.message);
                    },
                    readFile: (filename) => {
                        console.log(`Compiler requests file '${filename}'`);
                        return this.getContentSync(filename);
                        // const source = this.getContentSync(filename);
                        // console.log('Content for', filename, source, typeof source.data, `'${source?.data.toString()}'`);
                        // if (source.status !== 200)
                        //     return null;
                        // return source?.data.toString();
                    },
                    writeFile: (filename, contents) => {
                        console.log('Compiler providing output', filename);
                        if (filename.includes('.wasm')) {
                            compiledBinary = contents;
                            //     const path = `${process.cwd()}/tmp/out.${Math.random().toString().substring(3, 9)}.wasm`;
                            //     console.log('WASM copy export:', path);
                            //     writeFile(path, contents);
                        }
                    }
                }, (error) => {
                    if (error)
                        console.error(error);
                    resolve({
                        success: true,
                        stdout: compileStdOut,
                        stderr: compileStdErr,
                        binary: compiledBinary
                    });
                    return 0;
                });
            });
        } catch (error) {
            console.error(error);
            return {
                success: false
            };
        }
    }
}

export default BuildMiniVM;
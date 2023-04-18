import stream from 'node:stream';
// import { loopWhile } from 'deasync';
import * as asb from 'asbuild';
// import * as asc from 'assemblyscript/cli/asc';
import type { Context } from 'probot';
import { KlaveRcConfiguration } from '@secretarium/trustless-app';
import { DeploymentPushPayload } from '@secretarium/hubber-api';
import { Repo } from '@prisma/client';
import { dummyMap } from './dummyVmFs';

type BuildOutput = {
    stdout: stream.Duplex;
    stderr: stream.Duplex;
    binary: Uint8Array;
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

    getContentSync(path: string): string {
        return dummyMap[path];
    }

    async getRootContent() {
        const content = await this.getContent(`${this.options.application.rootDir}`);
        if (typeof content.data === 'object' && Array.isArray(content.data)) {
            const compilableFiles = content.data.find(file => ['index.ts'].includes(file.name));
            return await this.getContent(`${compilableFiles?.path}`);
        } else
            return content;
    }

    async build(): Promise<BuildOutput> {

        const { application, context: { commit } } = this.options;

        console.log(`Building ${application.name} from ${application.rootDir} @ ${commit.ref} ...`);

        const rootContent = await this.getRootContent();
        dummyMap['..ts'] = rootContent.data.toString();

        let compiledBinary = new Uint8Array(0);
        const compileStdOut = new stream.Duplex();
        const compileStdErr = new stream.Duplex();

        // console.log(asc.main)
        return new Promise((resolve) => {
            asb.main([
                'build',
                '.',
                '--stats',
                '--exportRuntime',
                '--disable', 'bulk-memory'
            ], {
                // stdout: compileStdOut,
                // stderr: compileStdErr,
                reportDiagnostic: (diagnostic) => {
                    console.log(diagnostic);
                    console.log(diagnostic.message);
                },
                readFile: (filename) => {
                    return this.getContentSync(filename);
                    // const source = this.getContentSync(filename);
                    // console.log('Content for', filename, source, typeof source.data, `'${source?.data.toString()}'`);
                    // if (source.status !== 200)
                    //     return null;
                    // return source?.data.toString();
                },
                writeFile: (filename, contents) => {
                    console.log('Compiler providing output', filename);
                    if (filename.includes('.wasm'))
                        compiledBinary = contents;
                }
            }, () => {
                resolve({
                    stdout: compileStdOut,
                    stderr: compileStdErr,
                    binary: compiledBinary
                });
                return 0;
            });
        });
    }
}

export default BuildMiniVM;
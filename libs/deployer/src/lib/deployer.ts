import * as path from 'node:path';
import * as ts from 'typescript';
import type { Context } from 'probot';
import type { Stats } from 'assemblyscript/dist/asc';
import { sigstore } from 'sigstore';
import { ErrorObject, serializeError } from 'serialize-error';
import { Hook, Repo, Application, prisma, Deployment } from '@klave/db';
import { createCompiler } from '@klave/compiler';
import { scp } from '@klave/providers';
import { Utils } from '@secretarium/connector';
import { RepoFs } from './repoFs';
import GithubFs from './githubFs';
import { dummyMap } from './dummyVmFs';

type Octokit = Context['octokit'];

type DeployFromHookOptions = {
    octokit?: Octokit;
    hook: Hook
};

type DeployFromRepoOptions = {
    octokit?: Octokit;
    repo: Repo;
};

type DeployFromApplicationOptions = {
    application: Application;
};

export type DeployerOptions = (DeployFromHookOptions | DeployFromRepoOptions | DeployFromApplicationOptions)

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


class Deployer {

    octokit?: Octokit;
    repo?: Repo;
    commitRange?: {
        before?: string;
        after?: string;
    };
    // TODO: Add a way to get the config type
    operatingConfig?: any;
    applications: Application[] = [];
    fs?: RepoFs;

    async fromRepo(repo: Repo) {
        this.repo = repo;
        this.applications = await prisma.application.findMany({
            where: {
                repoId: repo.id
            }
        });
    }

    async fromApplication(application: Application) {
        this.applications = [application];
        this.repo = await prisma.repo.findUnique({
            where: {
                id: application.repoId
            }
        }) ?? undefined;
    }

    async fromHook(hook: Hook) {
        if (hook.source === 'github') {
            // TODO: Find a way to get hook's typings
            const { payload } = hook as any;
            this.repo = await prisma.repo.findUnique({
                where: {
                    source_owner_name: {
                        source: hook.source,
                        owner: payload.repository.owner.login as string,
                        name: payload.repository.name as string
                    }
                }
            }) ?? undefined;
            if (payload.check_suite) {
                // For a Check Suite Hook
                this.commitRange = {
                    before: payload.check_suits.before as string,
                    after: payload.check_suits.after as string
                };
            } else {
                // Otherwise
                this.commitRange = {
                    before: payload.before as string,
                    after: payload.after as string
                };
            }
        }
    }

    withOctokit(octokit: Octokit) {
        this.octokit = octokit;
    }

    async createFs() {
        if (this.repo?.source === 'github')
            return new GithubFs({
                octokit: this.octokit,
                repoInfo: {
                    owner: this.repo.owner,
                    name: this.repo.name,
                    commit: ''
                }
            });
        return undefined;
    }

    async deploy() {

        const { repo, applications } = this;
        if (!repo)
            return;
        if (!applications.length)
            return;

        const { before, after } = this.commitRange ?? {};
        if (!before || !after)
            return;

        const { octokit } = this;
        if (!octokit)
            return;

        // Import the configuration if is does not exist
        if (!this.operatingConfig) {
            try {
                const fs = await this.createFs();
                if (fs) {
                    const configFileContent = await fs.getFileContent('.klaverc.json');
                    if (configFileContent)
                        // TODO: Find a way to get the config's typings
                        this.operatingConfig = JSON.parse(configFileContent); // as KlaveRcConfiguration;
                }
            } catch (e) {
                //
            }
        }

        const { operatingConfig } = this;
        if (!operatingConfig)
            return;

        // Get the list of files that changed
        const files: Array<{ __filename: string } & unknown> = [];
        try {
            const { data: { files: filesManifest } } = await octokit.repos.compareCommits({
                owner: repo.owner,
                repo: repo.name,
                base: before,
                head: after
            });

            filesManifest?.forEach(fileInfo => {
                files.push({
                    __filename: fileInfo.filename,
                    ...fileInfo
                });
            });

        } catch (e) {
            console.error(e);
            return;
        }

        // If no files are in the app, we don't deploy
        if (files.filter(({ __filename }) => {
            const commitFileDir = path.normalize(path.join('/', __filename));
            const appPath = path.normalize(path.join('/', operatingConfig.rootDir ?? ''));
            return commitFileDir.startsWith(appPath) || __filename === '.klaverc.json';
        }).length === 0)
            return;

        // For each application, we create a deployment
        const deploymentsPromises = this.applications.map(async application => {

            // Create the deployment
            const deployment = await prisma.deployment.create({
                data: {
                    expiresOn: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
                    version: this.operatingConfig[application.name].version,
                    build: after.substring(0, 8),
                    locations: ['FR'],
                    status: 'deploying',
                    application: {
                        connect: { id: application.id }
                    }
                }
            });

            // Create a function to mark the deployment as errored
            const errorDeployment = async (pd: Partial<Deployment> = {}) => {
                await prisma.deployment.update({
                    where: {
                        id: deployment.id
                    },
                    data: {
                        status: 'errored',
                        ...pd
                    }
                });
            };

            // Set a timeout to mark the deployment as errored if it is not deployed after 30s
            setTimeout(async () => {
                const currentState = await prisma.deployment.findUnique({
                    where: {
                        id: deployment.id
                    }
                });
                if (currentState?.status !== 'deployed')
                    errorDeployment();
            }, 30000);

            const appFs = await this.createFs();
            if (!appFs)
                return Promise.reject();
            appFs.setBasePath(operatingConfig[application.name].basePath ?? '/');

            // Build the application
            const buildResult = await this.build(appFs);

            // Update the deployment with the build output
            const { stdout, stderr } = buildResult;
            await prisma.deployment.update({
                where: {
                    id: deployment.id
                },
                data: {
                    buildOutputStdOut: stdout,
                    buildOutputStdErr: stderr
                }
            });

            // If the build failed, we mark the deployment as errored
            // TODO - Populate reasons why deployment failed
            if (buildResult.success === false) {
                errorDeployment({
                    buildOutputErrorObj: buildResult.error as any
                });
                return Promise.reject();
            }

            const { result: { wasm, wat, dts } } = buildResult;

            // Filter the d.ts file
            let filteredDTS = '';
            const validMatches: string[] = [];
            if (dts) {
                const sourceFile = ts.createSourceFile(
                    `${application.id}.d.ts`,
                    dts,
                    ts.ScriptTarget.Latest,
                    true
                );
                ts.forEachChild(sourceFile, node => {
                    if (ts.isFunctionDeclaration(node)) {
                        if (node.name && ![
                            'register_routes',
                            '__new',
                            '__pin',
                            '__unpin',
                            '__collect'
                        ].includes(node.name?.text)) {
                            validMatches.push(node.name.text);
                            filteredDTS += `${node.getFullText().trim()}\n`;
                        }
                    }
                });
            }

            // Update the deployment with the build output
            await prisma.deployment.update({
                where: {
                    id: deployment.id
                },
                data: {
                    status: 'compiled',
                    buildOutputWASM: Utils.toBase64(wasm),
                    buildOutputWAT: wat,
                    buildOutputDTS: filteredDTS,
                    contractFunctions: validMatches
                }
            });

            // TODO - Populate reasons we fail on empty wasm
            if (wasm.length === 0)
                return;

            // Send the wasm to the secretarium node
            await scp.newTx('wasm-manager', 'register_smart_contract', `klave-deployment-${deployment.id}`, {
                contract: {
                    name: `${deployment.id.split('-').pop()}.sta.klave.network`,
                    wasm_bytes: [],
                    wasm_bytes_b64: Utils.toBase64(wasm)
                }
            }).onExecuted(async () => {
                await prisma.deployment.update({
                    where: {
                        id: deployment.id
                    },
                    data: {
                        status: 'deployed'
                    }
                });
            }).onError((error) => {
                // Timeout will eventually error this
                console.error('Secretarium failed', error);
            }).send();

            return;
        });

        await Promise.allSettled(deploymentsPromises).then((deploymentCreationPromises) => {
            return deploymentCreationPromises
                .filter((p): p is PromiseFulfilledResult<Awaited<typeof deploymentsPromises[number]>> => p.status === 'fulfilled')
                .map(p => p.value);
        });
    }

    async build(fs: RepoFs): Promise<BuildOutput> {

        dummyMap['..ts'] = await fs.getFileContent();

        let compiledBinary = new Uint8Array(0);
        let compiledWAT: string | undefined;
        let compiledDTS: string | undefined;

        const compiler = await createCompiler();

        try {
            return new Promise<BuildOutput>((resolve) => {
                compiler.on('message', (message) => {
                    if (message.type === 'start') {
                        //
                    } else if (message.type === 'read') {
                        fs.getFileContent(message.filename).then(contents => {
                            compiler.postMessage({
                                type: 'read',
                                id: message.id,
                                contents: contents
                            });
                        });
                    } else if (message.type === 'write') {
                        if ((message.filename as string).endsWith('.wasm'))
                            compiledBinary = message.contents;
                        if ((message.filename as string).endsWith('.wat'))
                            compiledWAT = message.contents;
                        if ((message.filename as string).endsWith('.d.ts'))
                            compiledDTS = message.contents;
                    } else if (message.type === 'diagnostic') {
                        //
                    } else if (message.type === 'errored') {
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
                                compiler.terminate().finally(() => {
                                    resolve(output);
                                });
                            });
                    }
                });
            });
        } catch (error) {
            return {
                success: false,
                error: serializeError(error),
                stdout: '',
                stderr: ''
            };
        }
    }
}

export async function createDeployer(options?: DeployerOptions): Promise<Deployer> {
    const deployer = new Deployer();

    if (!options)
        return deployer;

    const isFromHook = (opts: DeployerOptions): opts is DeployFromHookOptions => (options as DeployFromHookOptions).hook !== undefined;
    const isFromRepo = (opts: DeployerOptions): opts is DeployFromRepoOptions => (options as DeployFromRepoOptions).repo !== undefined;

    if (isFromHook(options)) {
        if (options.octokit)
            deployer.withOctokit(options.octokit);
        await deployer.fromHook(options.hook);
    } else if (isFromRepo(options)) {
        if (options.octokit)
            deployer.withOctokit(options.octokit);
        await deployer.fromRepo(options.repo);
    } else
        await deployer.fromApplication(options.application);

    return deployer;
}

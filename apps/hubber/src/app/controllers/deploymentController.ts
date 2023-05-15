import { DeploymentPushPayload, scp } from '@klave/api';
import { prisma } from '@klave/db';
import type { KlaveRcConfiguration } from '@klave/sdk';
import { Utils } from '@secretarium/connector';
import path from 'node:path';
import ts from 'typescript';
import BuildMiniVM, { DeploymentContext } from '../../utils/buildMiniVm';

export const deployToSubstrate = async (deploymentContext: DeploymentContext<DeploymentPushPayload>) => {

    const { octokit, ...context } = deploymentContext;
    let files: Awaited<ReturnType<typeof octokit.repos.compareCommits>>['data']['files'];

    try {
        const { data: { files: filesManifest } } = await octokit.repos.compareCommits({
            owner: context.repo.owner,
            repo: context.repo.name,
            base: context.commit.before,
            head: context.commit.after
        });

        files = filesManifest;

    } catch (e) {
        console.error(e);
        return;
    }

    if (!files?.length)
        return;

    const repo = await prisma.repo.findUnique({
        include: {
            applications: true
        },
        where: {
            source_owner_name: {
                source: 'github',
                name: context.repo.name,
                owner: context.repo.owner
            }
        }
    });

    if (!repo)
        return;

    const availableApplicationsConfig = (repo.config as unknown as KlaveRcConfiguration).applications.reduce((prev, current) => {
        prev[current.name] = current;
        return prev;
    }, {} as Record<string, KlaveRcConfiguration['applications'][number]>);

    repo.applications.forEach(async application => {

        // TODO There is typing error in this location
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (files.filter(({ filename }) => {
            const commitFileDir = path.normalize(path.join('/', filename));
            const appPath = path.normalize(path.join('/', availableApplicationsConfig[application.name]?.rootDir ?? ''));
            return commitFileDir.startsWith(appPath) || filename === '.klaverc.json';
        }).length === 0)
            return;

        await prisma.activityLog.create({
            data: {
                class: 'pushHook',
                application: {
                    connect: {
                        id: application.id
                    }
                },
                context: {
                    type: context.type,
                    payload: context
                }
            }
        });
        const launchDeploy = async () => {

            const deployment = await prisma.deployment.create({
                data: {
                    expiresOn: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
                    version: availableApplicationsConfig[application.name].version,
                    build: context.commit.after.substring(0, 8),
                    locations: ['FR'],
                    application: {
                        connect: { id: application.id }
                    }
                }
            });

            await prisma.activityLog.create({
                data: {
                    class: 'deployment',
                    application: {
                        connect: {
                            id: application.id
                        }
                    },
                    context: {
                        type: 'start',
                        payload: {
                            deploymentId: deployment.id
                        }
                    }
                }
            });

            (new Promise((resolve, reject) => {
                setTimeout(reject, 30000);
                return prisma.deployment.update({
                    where: {
                        id: deployment.id
                    },
                    data: {
                        status: 'deploying'
                    }
                });
            })).catch(async () => {
                const currentState = await prisma.deployment.findUnique({
                    where: {
                        id: deployment.id
                    }
                });
                if (currentState?.status !== 'deployed')
                    await prisma.deployment.update({
                        where: {
                            id: deployment.id
                        },
                        data: {
                            status: 'errored'
                        }
                    });
            });

            try {
                const buildVm = new BuildMiniVM({
                    type: 'github',
                    context: deploymentContext,
                    repo,
                    application: availableApplicationsConfig[application.name]
                });
                const buildResult = await buildVm.build();

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

                // TODO - Populate reasons why deployment failed
                if (buildResult.success === false) {
                    await prisma.deployment.update({
                        where: {
                            id: deployment.id
                        },
                        data: {
                            status: 'errored',
                            buildOutputErrorObj: buildResult.error as any
                        }
                    });
                    return;
                }

                const { result: { wasm, wat, dts } } = buildResult;

                let filteredDTS = '';
                if (dts) {
                    // parse the d.ts file
                    const sourceFile = ts.createSourceFile(
                        `${deployment.id}.d.ts`,
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
                                filteredDTS += `${node.getFullText().trim()}\n`;
                            }
                        }
                    });
                }

                await prisma.deployment.update({
                    where: {
                        id: deployment.id
                    },
                    data: {
                        status: 'compiled',
                        buildOutputWASM: Utils.toBase64(wasm),
                        buildOutputWAT: wat,
                        buildOutputDTS: filteredDTS
                    }
                });

                if (dts) {
                    const matches = Array.from(dts.matchAll(/^export declare function (.*)\(/gm));
                    const validMatches = matches.map(match => match[1]).filter(match => !['__new', '__pin', '__unpin', '__collect', 'register_routes'].includes(match));
                    await prisma.deployment.update({
                        where: {
                            id: deployment.id
                        },
                        data: {
                            contractFunctions: validMatches
                        }
                    });
                }

                // TODO - Populate reasons we fail on empty wasm
                if (wasm.length === 0)
                    return;

                await scp.client.newTx('wasm-manager', 'register_smart_contract', `klave-deployment-${deployment.id}`, {
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
                    console.error('Secretarium failed', error);
                    // Timeout will eventually error this
                }).send();

            } catch (error) {
                console.error(error);
                // Timeout will eventually error this
            }
        };

        if (context.class === 'push')
            launchDeploy().finally(() => { return; });
    });

    return;
};

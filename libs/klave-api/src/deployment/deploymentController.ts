import { DeploymentPushPayload } from '../types';
import { scp, logger } from '@klave/providers';
import { prisma } from '@klave/db';
// import type { KlaveRcConfiguration } from '@klave/sdk';
import { Utils } from '@secretarium/connector';
import * as path from 'node:path';
import BuildMiniVM, { DeploymentContext } from './buildMiniVm';

export const deployToSubstrate = async (deploymentContext: DeploymentContext<DeploymentPushPayload>) => {

    const { octokit, ...context } = deploymentContext;
    let files: Awaited<ReturnType<typeof octokit.repos.compareCommits>>['data']['files'] = [];

    if (context.commit.before) {
        try {
            const { data: { files: filesManifest } } = await octokit.repos.compareCommits({
                owner: context.repo.owner,
                repo: context.repo.name,
                base: context.commit.before,
                head: context.commit.after
            });

            if (filesManifest)
                files = filesManifest;
        } catch (e) {
            logger.debug('Error while comparing files from github', e);
        }
    }

    if (!files?.length) {
        try {
            const { data: { files: filesManifest } } = await octokit.repos.getCommit({
                owner: context.repo.owner,
                repo: context.repo.name,
                ref: context.commit.after
            });

            files = filesManifest;
        } catch (e) {
            logger.error('Error while fetching files from github', e);
        }
    }

    if (!files?.length && !context.commit.forced)
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

    // TODO Reenable the KlaveRcConfiguration type
    const config = repo.config as any;
    const availableApplicationsConfig = config.applications.reduce((prev: any, current: any) => {
        prev[current.name] = current;
        return prev;
    }, {} as Record<string, any['applications'][number]>);

    repo.applications.forEach(async application => {

        // TODO There is typing error in this location
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (files.filter(({ filename }) => {
            const commitFileDir = path.normalize(path.join('/', filename));
            const appPath = path.normalize(path.join('/', availableApplicationsConfig[application.name]?.rootDir ?? ''));
            return commitFileDir.startsWith(appPath) || filename === 'klave.json';
        }).length === 0 && !context.commit.forced)
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
                    branch: context.commit.ref,
                    locations: ['FR'],
                    application: {
                        connect: { id: application.id }
                    }
                    // TODO: Make sure we get the push event
                    // pushEvent
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

            (new Promise((__unusedResolve, reject) => {
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
                    }).catch((reason) => {
                        logger.error('Error while updating deployment status to error', reason);
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

                await prisma.deployment.update({
                    where: {
                        id: deployment.id
                    },
                    data: {
                        status: 'compiled',
                        buildOutputWASM: Utils.toBase64(wasm),
                        buildOutputWAT: wat,
                        buildOutputDTS: dts
                    }
                });

                if (dts) {
                    const matches = Array.from(dts.matchAll(/^export declare function (.*)\(/gm));
                    const validMatches = matches
                        .map(match => match[1])
                        .filter(Boolean)
                        .filter(match => !['__new', '__pin', '__unpin', '__collect', 'register_routes'].includes(match));
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

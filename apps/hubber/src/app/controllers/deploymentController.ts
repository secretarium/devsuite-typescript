import { DeploymentPushPayload, DeploymentPullRequestPayload } from '@secretarium/hubber-api';
import { prisma } from '@secretarium/hubber-db';
import type { KlaveRcConfiguration } from '@secretarium/trustless-app';
import { Utils } from '@secretarium/connector';
import path from 'node:path';
import secretariumClient from '../../utils/secretarium';
import BuildMiniVM, { DeploymentContext } from '../../utils/buildMiniVm';

export const deployToSubstrate = async (deploymentContext: DeploymentContext<DeploymentPushPayload>) => {

    const { octokit, ...context } = deploymentContext;
    const { data: { files } } = await octokit.repos.compareCommits({
        owner: context.repo.owner,
        repo: context.repo.name,
        base: context.commit.before,
        head: context.commit.after
    });

    if (!files)
        return;

    const repo = await prisma.repo.findUnique({
        include: {
            applications: true
        },
        where: {
            owner_name: {
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

        if (files.filter(({ filename }) => {
            const commitFileDir = path.normalize(path.join('/', filename));
            const appPath = path.normalize(path.join('/', availableApplicationsConfig[application.name].rootDir ?? ''));
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
                const { binary: compileBinary } = await buildVm.build();

                if (compileBinary.length === 0)
                    return;

                await secretariumClient.newTx('wasm-manager', 'register_smart_contract', `klave-deployment-${deployment.id}`, {
                    contract: {
                        name: `${deployment.id.split('-').pop()}.sta.klave.network`,
                        wasm_bytes: [],
                        wasm_bytes_b64: Utils.toBase64(compileBinary)
                    }
                }).onExecuted(async () => {
                    console.log('Updating deployment status...');
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

export const updatePullRequestFromSubstrate = async ({ octokit, ...context }: DeploymentContext<DeploymentPullRequestPayload>) => {

    const { data: { files } } = await octokit.repos.compareCommits({
        owner: context.repo.owner,
        repo: context.repo.name,
        base: context.commit.before,
        head: context.commit.after
    });

    if (!files?.length)
        return;

    const repo = await prisma.repo.findUnique({
        include: {
            applications: true
        },
        where: {
            owner_name: {
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

        // console.log(application, files, repo);

        if (files.filter(({ filename }) => {
            const commitFileDir = path.normalize(path.join('/', filename));
            const appPath = path.normalize(path.join('/', availableApplicationsConfig[application.name].rootDir ?? ''));
            return commitFileDir.startsWith(appPath) || filename === '.klaverc.json';
        }).length === 0)
            return;

        await prisma.activityLog.create({
            data: {
                class: 'pullRequestHook',
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
    });

    return;
};
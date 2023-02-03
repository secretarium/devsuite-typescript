import { DeploymentPushPayload, DeploymentPullRequestPayload } from '@secretarium/hubber-api';
import { prisma } from '@secretarium/hubber-db';
import type { KlaveRcConfiguration } from '@secretarium/trustless-app';
import path from 'path';
import type { Context } from 'probot';

type DeploymentContext<Type> = {
    octokit: Context['octokit']
} & Type;

export const deployToSubstrate = async ({ octokit, ...context }: DeploymentContext<DeploymentPushPayload>) => {

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
                setTimeout(reject, 180000);
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

        console.log(application, files, repo);

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
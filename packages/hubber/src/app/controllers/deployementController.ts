import { DeployementPayload } from '@secretarium/hubber-api';
import { prisma } from '@secretarium/hubber-db';
import type { Context } from 'probot';

type DeployementContext = {
    octokit: Context['octokit']
} & DeployementPayload

export const deployToSubstrate = async ({ octokit, ...context }: DeployementContext) => {
    const matchingRepos = await prisma.repo.findMany({
        include: {
            applications: true
        },
        where: {
            name: context.repo.name,
            owner: context.repo.owner
        }
    });
    matchingRepos.forEach(async repo => {
        // console.log('Deployment on repo', repo.name);
        // console.log('Applications', repo.applications);
        // console.log((await octokit.repos.get({
        //     owner: repo.owner,
        //     repo: repo.name
        // })).data.private);
        repo.applications.forEach(async application => {
            // console.log('Application', application.name);
            await prisma.activityLog.create({
                data: {
                    class: context.class === 'pull_request' ? 'pullRequestHook' : 'pushHook',
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
                const deployment = await prisma.deployement.create({
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
                    setTimeout(reject, 30000);
                    return prisma.deployement.update({
                        where: {
                            id: deployment.id
                        },
                        data: {
                            status: 'deploying'
                        }
                    });
                })).catch(() => {
                    return prisma.deployement.update({
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
    });

    return;
};
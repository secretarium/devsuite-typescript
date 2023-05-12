import { createTRPCRouter, publicProcedure } from '../trpc';
import type { Application } from '@prisma/client';
import { z } from 'zod';

export const applicationRouter = createTRPCRouter({
    getAll: publicProcedure
        .query(async ({ ctx: { prisma, webId } }) => {
            const manifest = await prisma.application.findMany({
                where: {
                    webId
                }
            });
            return manifest;
        }),
    getById: publicProcedure
        .input(z.object({
            appId: z.string().uuid()
        }))
        .query(async ({ ctx: { prisma }, input: { appId } }) => {
            return await prisma.application.findUnique({
                where: {
                    id: appId
                },
                select: {
                    catogories: true,
                    color: true,
                    homepage: true,
                    description: true,
                    license: true,
                    webhook: true,
                    name: true,
                    tags: true
                }
            });
        }),
    register: publicProcedure
        .input(z.object({
            repoId: z.string().uuid(),
            applications: z.array(z.string()),
            emphemeralKlaveTag: z.string().optional()
        }))
        .mutation(async ({ ctx: { prisma, session, sessionStore, sessionID, user, webId }, input: { repoId, applications, emphemeralKlaveTag } }) => {

            const deployableRepoData = await prisma.deployableRepo.findFirst({
                where: {
                    id: repoId
                }
            });

            if (!deployableRepoData)
                throw (new Error('There is no such repo'));

            const newConfig = deployableRepoData.config;
            if (newConfig === null)
                throw (new Error('There is no configuration repo'));

            applications.forEach(async appName => {
                // await prisma.$transaction(async (tx) => {
                // const repo = await tx.repo.upsert({
                const repo = await prisma.repo.upsert({
                    where: {
                        owner_name: {
                            owner: deployableRepoData.owner,
                            name: deployableRepoData.name
                        }
                    },
                    update: {
                        config: JSON.parse(newConfig)
                    },
                    create: {
                        owner: deployableRepoData.owner,
                        name: deployableRepoData.name,
                        config: JSON.parse(newConfig)
                    }
                });
                // /* const application = */ await tx.application.create({
                /* const application = */
                await prisma.application.create({
                    data: {
                        web: {
                            connect: {
                                id: webId
                            }
                        },
                        name: appName,
                        repo: {
                            connect: {
                                id: repo.id
                            }
                        },
                        catogories: [],
                        tags: [],
                        author: webId ?? emphemeralKlaveTag ?? sessionID
                    }
                });
                // const deployment = await tx.deployment.create({
                //     data: {
                //         expiresOn: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
                //         locations: ['FR'],
                //         application: {
                //             connect: { id: application.id }
                //         }
                //     }
                // });
                // await tx.activityLog.create({
                //     data: {
                //         class: 'deployment',
                //         application: {
                //             connect: {
                //                 id: application.id
                //             }
                //         },
                //         context: {
                //             type: 'start',
                //             payload: {
                //                 deploymentId: deployment.id
                //             }
                //         }
                //     }
                // });
                // });
                // try {
                //     const lastEventsHandle = await fetch(`https://api.github.com/users/${deployableRepoData.owner}/events/public`);
                //     const lastEvents = await lastEventsHandle.json();

                //     if (lastEvents.length > 0) {
                //         deployToSubstrate({
                //             octokit: context.octokit,
                //             class: context.name,
                //             type: context.name,
                //             repo: {
                //                 url: context.payload.repository.html_url,
                //                 owner: context.payload.repository.owner.login,
                //                 name: context.payload.repository.name
                //             },
                //             commit: {
                //                 url: context.payload.repository.commits_url,
                //                 ref: context.payload.ref,
                //                 before: context.payload.before,
                //                 after: context.payload.after,
                //                 forced: context.payload.forced
                //             },
                //             pusher: {
                //                 login: context.payload.sender.login,
                //                 avatarUrl: context.payload.sender.avatar_url,
                //                 htmlUrl: context.payload.sender.html_url
                //             }
                //         });
                //     }
                // } catch (e) {
                //     console.error(e);
                // }

                if (user === undefined)
                    await new Promise<void>((resolve, reject) => {
                        sessionStore.set(sessionID, {
                            ...session
                        }, (err) => {
                            if (err)
                                return reject(err);
                            return resolve();
                        });
                    });
            });

            return true;
        }),
    update: publicProcedure
        .input(z.object({
            appId: z.string().uuid(),
            data: z.custom<Partial<Application>>()
        }))
        .mutation(async ({ ctx: { prisma }, input: { appId, data } }) => {
            await prisma.application.update({
                where: {
                    id: appId
                },
                data
            });
            await prisma.activityLog.create({
                data: {
                    class: 'environment',
                    application: {
                        connect: {
                            id: appId
                        }
                    },
                    context: {
                        type: 'update',
                        payload: {}
                    }
                }
            });
            return true;
        }),
    delete: publicProcedure
        .input(z.object({
            applicationId: z.string().uuid()
        }))
        .mutation(async ({ ctx: { prisma }, input: { applicationId } }) => {

            await prisma.application.delete({
                where: {
                    id: applicationId
                }
            });
            return;

        })
});

export default applicationRouter;
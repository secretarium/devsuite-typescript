import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const deploymentRouter = createTRPCRouter({
    getByApplication: publicProcedure
        .input(z.object({
            appId: z.string().uuid()
        }))
        .query(async ({ ctx: { prisma }, input: { appId } }) => {

            if (!appId)
                return [];

            return await prisma.deployment.findMany({
                where: {
                    applicationId: appId
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 20
            });

        }),
    getAll: publicProcedure
        .query(async ({ ctx: { prisma, webId } }) => {

            const domainList = await prisma.deployment.findMany({
                where: {
                    application: {
                        webId
                    }
                }
            });

            return domainList;
        }),
    delete: publicProcedure
        .input(z.object({
            deploymentId: z.string()
        }))
        .mutation(async ({ ctx: { prisma }, input: { deploymentId } }) => {

            await prisma.deployment.delete({
                where: {
                    id: deploymentId
                }
            });
            return;

        }),
    release: publicProcedure
        .input(z.object({
            deploymentId: z.string()
        }))
        .mutation(async ({ ctx: { prisma }, input: { deploymentId } }) => {

            await prisma.deployment.update({
                where: {
                    id: deploymentId
                },
                data: {
                    released: true,
                    life: 'long'
                }
            });
            return;

        })
});

export default deploymentRouter;
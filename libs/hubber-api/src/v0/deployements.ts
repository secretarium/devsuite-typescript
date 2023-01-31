import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const domainRouter = createTRPCRouter({
    getByApplication: publicProcedure
        .input(z.object({
            appId: z.string()
        }))
        .query(async ({ ctx: { prisma }, input: { appId } }) => {

            if (!appId)
                return [];

            return await prisma.deployement.findMany({
                where: {
                    applicationId: appId
                }
            });

        }),
    getAll: publicProcedure
        .query(async ({ ctx: { prisma, webId } }) => {

            const domainList = await prisma.deployement.findMany({
                where: {
                    application: {
                        webId
                    }
                }
            });

            return domainList;
        })
});

export default domainRouter;
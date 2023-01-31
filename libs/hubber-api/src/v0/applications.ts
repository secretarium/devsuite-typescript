import { createTRPCRouter, publicProcedure } from '../trpc';
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
    deployApplications: publicProcedure
        .input(z.object({
            repoId: z.string(),
            applications: z.array(z.string()),
            emphemeralSessionTag: z.string().optional()
        }))
        .mutation(async ({ ctx: { prisma, session, sessionStore, sessionID, user, webId }, input: { repoId, applications, emphemeralSessionTag } }) => {

            const repoData = await prisma.deployableRepo.findFirst({
                where: {
                    id: repoId
                }
            });

            if (!repoData)
                throw (new Error('There is no such repo'));

            applications.forEach(async appName => {
                await prisma.application.create({
                    data: {
                        webId,
                        name: appName,
                        repoId,
                        catogories: [],
                        tags: [],
                        bundleId: '',
                        version: '',
                        author: emphemeralSessionTag ?? sessionID
                    }
                });
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
        })
});

export default applicationRouter;
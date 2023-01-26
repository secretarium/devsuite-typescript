import { createTRPCRouter, publicProcedure } from '../trpc';
// import { z } from 'zod';

export const userRouter = createTRPCRouter({
    getAll: publicProcedure
        .query(async ({ ctx: { session, prisma } }) => {

            if (!session.githubToken)
                return null;

            // const { accessToken: lookup_accessToken } = session.githubToken;
            const manifest = await prisma.application.findMany();

            return manifest;
        })
});

export default userRouter;
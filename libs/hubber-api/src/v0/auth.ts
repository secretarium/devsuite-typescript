import { protectedProcedure, publicProcedure, createTRPCRouter } from '../trpc';

export const authRouter = createTRPCRouter({
    getSession: publicProcedure.query(async ({ ctx }) => {
        return {
            // session: ctx.session,
            // sessionID: ctx.sessionID,
            me: ctx.user,
            webId: ctx.webId,
            hasUnclaimedApplications: ctx.web.userId === null && (await ctx.prisma.application.count({
                where: {
                    webId: ctx.webId
                }
            })).valueOf() > 0
            // web: ctx.web
        };
    }),
    getSecretMessage: protectedProcedure.query(() => {
        // testing type validation of overridden next-auth Session in @acme/auth package
        return 'you can see this secret message!';
    })
});

export default authRouter;
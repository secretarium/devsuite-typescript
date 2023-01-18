import { protectedProcedure, publicProcedure, createTRPCRouter } from '../trpc';

export const authRouter = createTRPCRouter({
    getSession: publicProcedure.query(({ ctx }) => {
        return {
            session: ctx.session,
            sessionID: ctx.sessionID,
            user: ctx.user
        };
    }),
    getSecretMessage: protectedProcedure.query(() => {
        // testing type validation of overridden next-auth Session in @acme/auth package
        return 'you can see this secret message!';
    })
});

export default authRouter;
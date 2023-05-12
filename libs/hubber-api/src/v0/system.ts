import { AppLedgerSource } from '../secretarium';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const systemRouter = createTRPCRouter({
    isSystemReady: publicProcedure
        .query(async ({ ctx: { prisma, sessionID } }) => {
            const isDBAlive = await prisma.session.findUnique({ where: { id: sessionID } });
            const isSecretariumAlive = AppLedgerSource.isConnected();
            return isSecretariumAlive && !!isDBAlive;
        }),
    getSecretariumNode: publicProcedure
        .query(async () => {
            return process.env['NX_SECRETARIUM_NODE'];
        })
});

export default systemRouter;
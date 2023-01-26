import { z } from 'zod';
import * as dns from 'dns/promises';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const domainRouter = createTRPCRouter({
    getAll: publicProcedure
        .query(async ({ ctx: { prisma, webId } }) => {

            const domainList = await prisma.domain.findMany({
                where: {
                    application: {
                        webId
                    }
                }
            });

            return domainList;
        }),
    validateDomain: publicProcedure
        .input(z.object({ domainId: z.string() }))
        .query(async ({ ctx: { prisma }, input: { domainId } }) => {

            const domain = await prisma.domain.findUnique({
                where: {
                    id: domainId
                }
            });

            if (!domain)
                return null;

            const txtRecords = await dns.resolveTxt(domain?.fqdn);
            await prisma.domain.update({
                where: { id: domain.id },
                data: { verified: txtRecords.filter(([record]) => record === domain.token).length > 0 }
            });

            return txtRecords;
        })
});

export default domainRouter;
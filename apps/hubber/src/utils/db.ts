import { PrismaClient } from '@prisma/client';
// import i18n from '../i18n';
import { logger } from '@klave/providers';

export * from '@prisma/client';

export const client = new PrismaClient();
let reconnectAttempt = 0;
let reconnectionTimeout: NodeJS.Timeout | undefined;

const planReconnection = async () => {
    return new Promise((resolve) => {
        if (!reconnectionTimeout) {
            reconnectionTimeout = setTimeout(() => {
                clearTimeout(reconnectionTimeout);
                reconnectionTimeout = undefined;
                dbOps.initialize().then(resolve).catch(() => { return; });
            }, 3000);
        }
    });
};

export const dbOps = {
    initialize: async () => {
        try {
            await client.$connect();
            logger.info(`Connected to Mongo via Prisma ${process.env['NX_MONGODB_URL']}`);
            return;
        } catch (e: any) {
            logger.error(`Connection ${++reconnectAttempt} to Mongo failed: ${e.message}`);
            await planReconnection();
        }
    },
    stop: async () => {
        try {
            await client.$disconnect();
            return;
        } catch (e) {
            //
        }
    }
};

export default client;
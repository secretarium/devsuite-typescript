import { PrismaClient } from '@prisma/client';
import i18n from '../i18n';
import logger from './logger';

export * from '@prisma/client';

export const client = new PrismaClient();

export const AppDataSource = {
    initialize: async () => {
        try {
            await client.$connect();
            return;
        } catch (e) {
            logger.error(i18n.t('errors:DB_CONNECT_ERROR'));
            return null;
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
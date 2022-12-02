
import 'reflect-metadata';
import { MikroORM, EntityRepository } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import { MongoClient } from 'mongodb';
import * as Entities from '../app/entities';
import logger from './logger';
import i18n from '../i18n';

const { NX_MONGODB_URL, NX_MONGODB_DBNAME } = process.env;

if (!NX_MONGODB_URL)
    process.exit(2);

const client = new MongoClient(NX_MONGODB_URL, {
    appName: 'Secretarium Hubber'
});
let orm: MikroORM<MongoDriver>;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const collections: {
    [Entity in keyof typeof Entities & string as `${Entity}Collection`]: EntityRepository<InstanceType<typeof Entities[Entity]>>
} & Record<string, unknown> = {};

export const AppDataSource = {
    initialize: async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            orm = await MikroORM.init<MongoDriver>({
                // This will likely require some checking
                // Newer versions do not have Global Context by default
                // It is unclear why
                allowGlobalContext: true,
                ensureIndexes: true,
                driverOptions: client,
                entities: Object.values(Entities),
                dbName: NX_MONGODB_DBNAME,
                clientUrl: NX_MONGODB_URL,
                type: 'mongo'
            });
            await orm.connect();
            Object.entries(Entities).forEach(([key, value]) => {
                collections[`${key}Collection`] = orm.em.getRepository(value);
            });
            return orm;
        } catch (e) {
            logger.error(i18n.t('errors:DB_CONNECT_ERROR'));
            return null;
        }
    },
    stop: async () => {
        try {
            await orm.close();
            return;
        } catch (e) {
            //
        }
    }
};

export const getDriverSubstrate = () => client;

export default collections;

import 'reflect-metadata';
import { MikroORM, EntityRepository } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import { MongoClient } from 'mongodb';
import * as Entities from '../app/entities';

const { NX_MONGODB_URL } = process.env;

if (!NX_MONGODB_URL)
    process.exit(2);

const client = new MongoClient(NX_MONGODB_URL, {
    appName: 'Secretarium Hubber'
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const collections: {
    [Entity in keyof typeof Entities & string as `${Entity}Collection`]: EntityRepository<InstanceType<typeof Entities[Entity]>>
} & Record<string, unknown> = {};

export const AppDataSource = {
    initialize: async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const orm = await MikroORM.init<MongoDriver>({
            // This will likely require some checking
            // Newer versions do not have Global Context by default
            // It is unclear why
            allowGlobalContext: true,
            ensureIndexes: true,
            driverOptions: client,
            entities: Object.values(Entities),
            dbName: 'secretarium_hubber',
            clientUrl: NX_MONGODB_URL,
            type: 'mongo'

        });
        Object.entries(Entities).forEach(([key, value]) => {
            collections[`${key}Collection`] = orm.em.getRepository(value);
        });
        await orm.connect();
        return orm;
    }
};

export const getDriverSubstrate = () => client;

export default collections;
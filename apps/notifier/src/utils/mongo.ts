import { MongoClient, Collection } from 'mongodb';
import { z } from 'zod';
import type { ExpoPushTicket, ExpoPushReceipt } from 'expo-server-sdk';
import type { PushRequest } from './expo';

const KreditConsumptionSchema = z.object({
    cluster_key_b64: z.string(),
    app_id: z.string(),
    fqdn: z.string(),
    is_transaction: z.boolean(),
    timestamp: z.number(),
    cpu_consumption: z.number(),
    native_calls_consumption: z.number()
});

export const KreditConsumptionReportSchema = z.object({
    version: z.number(),
    consumption: KreditConsumptionSchema,
    signature_b64: z.string()
});

export type ConsumptionReport = z.infer<typeof KreditConsumptionReportSchema>;

type MinimumData = {
    createdAt: string;
    updatedAt?: string;
};

type NotificationPush = MinimumData & {
    request?: PushRequest['data']
    hasValidSignature: boolean;
};

type NotificationTicket = MinimumData & {
    ticket: ExpoPushTicket
    wasFollowedUp: boolean
};

type NotificationReceipt = MinimumData & {
    receipt: ExpoPushReceipt
};

let client: MongoClient;
export let pushCollection: Collection<NotificationPush>;
export let ticketCollection: Collection<NotificationTicket>;
export let receiptCollection: Collection<NotificationReceipt>;
export const mongoOps = {
    initialize: async () => {
        try {
            console.info('Initializing MongoDB connection');
            const uri = process.env['PDA_NOTIFIER_MONGODB_URL'];
            if (!uri)
                throw new Error('MongoDB URI is not provided');
            client = new MongoClient(uri);
            await client.connect();
            pushCollection = client.db(client.options.dbName).collection<NotificationPush>('NotificationPush');
            ticketCollection = client.db(client.options.dbName).collection<NotificationTicket>('NotificationTicket');
            receiptCollection = client.db(client.options.dbName).collection<NotificationReceipt>('NotificationReceipt');
        } catch (e) {
            console.error(`Could not initialize Sentry: ${e}`);
        }
    }
};

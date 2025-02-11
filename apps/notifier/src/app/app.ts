import { FastifyInstance } from 'fastify';
// import type { WebSocket } from 'ws';
// import { v4 as uuid } from 'uuid';
import { pushCollection, ticketCollection } from '../utils/mongo';
import { expo, PushRequestSchema } from '../utils/expo';

const definitions = process.env.PDA_NOTIFIER_ENDPOINTS?.split(',') ?? [];
const endpoints = definitions.map(def => def.split('#') as [string, string]).filter(def => def.length === 2);
// const connectionPool = new Map<string, WebSocket>();

/* eslint-disable-next-line */
export interface AppOptions { }

export async function app(fastify: FastifyInstance) {

    const __hostname = process.env['HOSTNAME'] ?? 'unknown';

    fastify.log.info(endpoints, 'Preparing for enpoints');
    // const secrets = process.env.PDA_NOTIFIER_SECRETS?.split(',') ?? [];

    fastify.all('/push', async (req, res) => {

        res.headers({ 'X-Klave-API-Node': __hostname });

        if (!pushCollection)
            return await res.status(202).send({ ok: true });

        // We assume that the request is not too long
        // We assume that it is not a multipart request either
        const rawContent = Uint8Array.from(req.raw.read() ?? []);

        try {
            const content = new TextDecoder('utf-8').decode(rawContent);
            if (typeof content !== 'string')
                return await res.status(400).send({ ok: false });

            const { data } = PushRequestSchema.parse(content);

            const pushInsert = await pushCollection.insertOne({
                request: data,
                createdAt: new Date().toISOString(),
                hasValidSignature: false
            });

            // Perform signature verification here
            await pushCollection.updateOne({
                _id: pushInsert.insertedId
            }, {
                $set: {
                    hasValidSignature: true,
                    updatedAt: new Date().toISOString()
                }
            });

            const messages = [];
            for (const clientLoad of data) {
                for (const message of clientLoad.messages) {
                    messages.push({
                        to: clientLoad.pushToken,
                        sound: 'default',
                        body: message.body,
                        data: message.data
                    });
                }
            }

            const chunks = expo.chunkPushNotifications(messages);
            for (const chunk of chunks) {
                try {
                    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    for (const ticket of ticketChunk) {
                        ticketCollection.insertOne({
                            ticket,
                            createdAt: new Date().toISOString(),
                            wasFollowedUp: false
                        });
                    }
                } catch (error) {
                    console.error(error);
                }
            }

        } catch (__unusedError) {
            return await res.status(400).send({ ok: false });
        }

        return await res.status(201).send({ ok: true });
    });

    fastify.all('/version', async (__unusedReq, res) => {

        res.headers({ 'X-Klave-API-Node': __hostname });
        await res.status(202).send({
            version: {
                name: process.env.NX_TASK_TARGET_PROJECT,
                commit: process.env.GIT_REPO_COMMIT?.substring(0, 8),
                branch: process.env.GIT_REPO_BRANCH,
                version: process.env.GIT_REPO_VERSION
            },
            node: __hostname
        });
    });
}

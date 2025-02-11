import { Expo, ExpoPushToken, ExpoPushMessage } from 'expo-server-sdk';
import { z } from 'zod';
import { receiptCollection, ticketCollection } from './mongo';

export const PushRequestSchema = z.object({
    data: z.array(z.object({
        pushToken: z.custom<ExpoPushToken>((value) => typeof value === 'string' && value.length > 0),
        messages: z.array(z.custom<ExpoPushMessage>())
    })),
    signature_b64: z.string().optional()
});

export type PushRequest = z.infer<typeof PushRequestSchema>;
export let expo: Expo;
export const expoOps = {
    initialize: async () => {
        try {
            console.info('Initializing Expo');
            expo = new Expo({
                accessToken: process.env.EXPO_ACCESS_TOKEN
            });
        } catch (e) {
            console.error(`Could not initialize Expo: ${e}`);
        }
    },
    processTickets: async () => {
        try {
            const tickets = await ticketCollection.find({ wasFollowedUp: false }).toArray();
            const receiptsIds = [];
            for (const ticket of tickets) {
                if (ticket.ticket.status === 'error') {
                    await ticketCollection.updateOne({
                        _id: ticket._id
                    }, {
                        $set: {
                            wasFollowedUp: true,
                            updatedAt: new Date().toISOString()
                        }
                    }).catch(() => {
                        // Silently ignore
                    });
                } else {
                    receiptsIds.push(ticket.ticket.id);
                }
            }

            const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptsIds);
            for (const chunk of receiptIdChunks) {
                try {
                    const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

                    // The receipts specify whether Apple or Google successfully received the
                    // notification and information about an error, if one occurred.
                    for (const receiptId in receipts) {
                        const receipt = receipts[receiptId];
                        if (!receipt)
                            continue;

                        await receiptCollection.insertOne({
                            receipt,
                            createdAt: new Date().toISOString()
                        });

                        await ticketCollection.updateOne({
                            ticket: {
                                status: 'ok',
                                id: receiptId
                            }
                        }, {
                            $set: {
                                wasFollowedUp: true,
                                updatedAt: new Date().toISOString()
                            }
                        });

                        if (receipt.status === 'ok') {
                            continue;
                        } else {
                            const { message, details } = receipt;
                            console.error(`Receipt ${receiptId} has an error: ${message}`);
                            if (details && details.error) {
                                // The error codes are listed in the Expo documentation:
                                // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                                // You must handle the errors appropriately.
                                console.error(`The error code is ${details.error}`);
                            }
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        } catch (e) {
            console.error(`Could not process tickets: ${e}`);
        }
    }
};

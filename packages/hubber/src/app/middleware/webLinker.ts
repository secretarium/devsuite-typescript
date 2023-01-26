import { RequestHandler } from 'express-serve-static-core';
import { prisma } from '@secretarium/hubber-db';
import { v4 as uuid } from 'uuid';

export const webLinkerMiddlware: RequestHandler = async (req, res, next) => {

    const { headers, session, sessionID } = req;
    const ephemeralTag = headers['x-trustless-store-ephemeral-tag']?.toString();
    const { localId } = session as any as Record<string, string>;

    const web = await prisma.web.findFirst({
        include: {
            sessions: true
        },
        where: {
            OR: [{
                sessions: {
                    some: {
                        id: sessionID
                    }
                }
            }, {
                ephemerals: ephemeralTag ? {
                    has: ephemeralTag
                } : undefined
            }, {
                devices: {
                    some: {
                        localId
                    }
                }
            }]
        }
    });

    const setOfSessionId = Array.from(new Set((web?.sessions.map(s => s.sid) ?? []).concat([sessionID]))).map(sid => ({ sid }));
    const setOfEphemeralId = Array.from(new Set((web?.ephemerals ?? []).concat(ephemeralTag ? [ephemeralTag] : [])));
    const nextWeb = await prisma.web.upsert({
        where: {
            id: web?.id ?? uuid()
        },
        create: {
            sessions: {
                connect: setOfSessionId
            },
            ephemerals: setOfEphemeralId
        },
        update: {
            sessions: { set: setOfSessionId },
            ephemerals: setOfEphemeralId
        }
    });

    req.web = nextWeb;
    req.webId = nextWeb.id;
    next();
};
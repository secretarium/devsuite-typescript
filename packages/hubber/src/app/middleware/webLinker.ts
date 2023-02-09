import { RequestHandler } from 'express-serve-static-core';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
// import deepmerge from 'deepmerge';
import { prisma } from '@secretarium/hubber-db';
import { v4 as uuid } from 'uuid';

export const webLinkerMiddlware: RequestHandler = async (req, res, next) => {

    const { headers, session, sessionID } = req;
    const ephemeralTag = headers['x-trustless-klave-ephemeral-tag']?.toString();
    const { localId } = session as any as Record<string, string>;

    // const webs = await prisma.web.findMany({
    //     include: {
    //         sessions: true,
    //         devices: true,
    //         deployableRepos: true,
    //         applications: true
    //     },
    //     where: {
    //         OR: [{
    //             sessions: {
    //                 some: {
    //                     id: sessionID
    //                 }
    //             }
    //         }, {
    //             ephemerals: ephemeralTag ? {
    //                 has: ephemeralTag
    //             } : undefined
    //         }, {
    //             devices: {
    //                 some: {
    //                     localId
    //                 }
    //             }
    //         }]
    //     }
    // });

    // const web = await (async () => {
    //     if (webs.length === 1)
    //         return webs[0];
    //     const { sessions, ...collatedWeb } = deepmerge.all<typeof webs[number]>(webs);
    //     if (webs.length > 1) {
    //         return await prisma.web.create({
    //             include: {
    //                 sessions: true,
    //                 devices: true,
    //                 deployableRepos: true,
    //                 applications: true
    //             },
    //             data: {
    //                 id: uuid(),
    //                 name: uniqueNamesGenerator({
    //                     dictionaries: [adjectives, colors, animals],
    //                     separator: '-'
    //                 }),
    //                 ancestors: collatedWeb.ancestors.concat(webs.map(w => w.id)),
    //                 ephemerals: collatedWeb.ephemerals,
    //                 githubToken: webs.filter(w => !!w.githubToken).sort((a, b) => a.githubToken && b.githubToken ? a.githubToken.createdAt.getTime() - b.githubToken.createdAt.getTime() : 0).pop()?.githubToken,
    //                 applications: {
    //                     connect: collatedWeb.applications
    //                 },
    //                 deployableRepos: {
    //                     connect: collatedWeb.deployableRepos
    //                 },
    //                 devices: {
    //                     connect: collatedWeb.devices
    //                 },
    //                 sessions: {
    //                     connect: sessions
    //                 }
    //             }
    //         });
    //     }
    //     return null;
    // })();

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

    await new Promise(resolve => session.save(resolve));

    try {
        const setOfSessionId = Array.from(new Set((web?.sessions.map(s => s.sid) ?? []).concat([sessionID]))).map(sid => ({ sid }));
        const setOfEphemeralId = Array.from(new Set((web?.ephemerals ?? []).concat(ephemeralTag ? [ephemeralTag] : [])));
        const nextWeb = await prisma.web.upsert({
            where: {
                id: web?.id || ''
            },
            create: {
                id: uuid(),
                name: uniqueNamesGenerator({
                    dictionaries: [adjectives, colors, animals],
                    separator: '-'
                }),
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
    } catch (e) {
        console.error(e);
    }

    next();
};
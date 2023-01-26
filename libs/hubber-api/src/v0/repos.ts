import fetch from 'node-fetch';
import { Octokit } from '@octokit/rest';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import { objectToCamel } from 'ts-case-convert';
import { isTruthy } from './utils/isTruthy';
import { DeployableRepo } from '@prisma/client';
import { repoConfigSchema } from './utils/repoConfigChecker';

export const userRouter = createTRPCRouter({
    deployables: publicProcedure
        .input(z.boolean().default(false))
        .query(async ({ ctx: { session, sessionStore, sessionID, prisma }, input: refreshing }) => {

            let manifest: DeployableRepo[] = await prisma.deployableRepo.findMany({ where: { sessionId: sessionID } });

            if (manifest.length && !refreshing)
                return manifest.filter(repo => repo.config);

            if (!session.githubToken)
                return null;

            const { accessToken: lookupAccessToken } = session.githubToken;
            manifest = await prisma.deployableRepo.findMany({ where: { creatorAuthToken: lookupAccessToken } });

            if (manifest.length && !refreshing)
                return manifest.filter(repo => repo.config);

            const { refreshToken, expiresIn, createdAt } = session.githubToken;
            if (createdAt.valueOf() + expiresIn * 1000 < new Date().valueOf()) {
                try {
                    console.log('Refreshing GitHub token ...');
                    const result = await fetch('https://github.com/login/oauth/access_token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            client_id: process.env['NX_GITHUB_CLIENTID'],
                            client_secret: process.env['NX_GITHUB_CLIENTSECRET'],
                            grant_type: 'refreshToken',
                            refreshToken
                        })
                    });
                    const data: any = {
                        ...objectToCamel(await result.json()),
                        createdAt: Date.now()
                    };
                    if (!data.error)
                        await new Promise<void>((resolve, reject) => {
                            session.githubToken = data;
                            sessionStore.set(sessionID, {
                                ...session,
                                githubToken: data
                            }, (err) => {
                                if (err)
                                    return reject(err);
                                return resolve();
                            });
                        });
                } catch (e) {
                    console.error(e);
                }
            }

            const { accessToken } = session.githubToken;
            const octokit = new Octokit({ auth: accessToken });
            const reposData = await octokit.paginate(
                octokit.repos.listForAuthenticatedUser,
                {
                    per_page: 100
                },
                (response) => response.data.filter((r) => !r.archived)
            );
            // return [{
            //     owner: `${Math.random()}`,
            //     name: `${Math.random()}`,
            //     token: accessToken
            // }];
            const repos = reposData.map(repo => ({
                sessionId: sessionID,
                creatorAuthToken: accessToken,
                owner: repo.owner.login,
                name: repo.name
            })).filter(Boolean);

            const [, , reposWithId] = await prisma.$transaction([
                prisma.deployableRepo.deleteMany({ where: { creatorAuthToken: accessToken } }),
                prisma.deployableRepo.createMany({
                    data: repos
                }),
                prisma.deployableRepo.findMany({ where: { creatorAuthToken: accessToken } })
            ]);

            // return reposWithId;

            const validRepos = await Promise.all(reposWithId.map(async repo => {
                try {
                    const handle = await octokit.repos.getContent({
                        owner: repo.owner,
                        repo: repo.name,
                        path: '.secretariumrc.json',
                        mediaType: {
                            format: 'raw+json'
                        }
                    });

                    repo.config = handle.data.toString();
                    await prisma.deployableRepo.update({ where: { id: repo.id }, data: { config: repo.config } });
                } catch (e) {
                    // return [];
                    return;
                }

                return repo;
            }));

            return validRepos.filter(repo => repo?.config).filter(isTruthy);
            // return mapping.filter(repoContent => repoContent.length);
            // console.log('PLOP >>>', mapping.filter(repoContent => repoContent.length));
            // return mapping.filter(repoContent => repoContent.length).reduce((prev, [repo, content]) => {
            //     if (content.trim() !== '')
            //         prev[repo] = content;
            //     return prev;
            // }, {} as Record<string, string>);
        }),
    getRepo: publicProcedure
        .input(z.object({ owner: z.string(), name: z.string() }))
        .query(async ({ ctx: { sessionID, prisma }, input: repoInfo }) => {

            const data = await prisma.deployableRepo.findFirst({
                where: {
                    sessionId: sessionID,
                    ...repoInfo
                }
            });

            if (!data)
                return null;

            const parsedConfig = typeof data?.config === 'string' ? repoConfigSchema.safeParse(JSON.parse(data?.config)) : null;

            return {
                id: data.id,
                owner: data.owner,
                name: data.name,
                config: parsedConfig?.success ? parsedConfig.data : null,
                configError: !parsedConfig?.success ? parsedConfig?.error.flatten() : null
            };
        }),
    deployApplications: publicProcedure
        .input(z.object({
            repoId: z.string(),
            applications: z.array(z.string())
        }))
        .mutation(async ({ ctx: { prisma, session, sessionStore, sessionID, user }, input: { repoId, applications } }) => {

            const repoData = await prisma.deployableRepo.findFirst({
                where: {
                    id: repoId
                }
            });

            if (!repoData)
                throw (new Error('There is no such repo'));

            applications.forEach(async appName => {
                await prisma.application.create({
                    data: {
                        name: appName,
                        repoId,
                        catogories: [],
                        tags: [],
                        bundleId: '',
                        version: '',
                        author: sessionID
                    }
                });
                if (user === undefined)
                    await new Promise<void>((resolve, reject) => {
                        sessionStore.set(sessionID, {
                            ...session,
                            unclaimedApplications: (session.unclaimedApplications ?? []).concat([appName])
                        }, (err) => {
                            if (err)
                                return reject(err);
                            return resolve();
                        });
                    });
            });

            return true;
        })
});

export default userRouter;
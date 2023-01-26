import fetch from 'node-fetch';
import { Octokit } from '@octokit/rest';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import { objectToCamel } from 'ts-case-convert';
import { isTruthy } from './utils/isTruthy';
import type { DeployableRepo, GitHubToken } from '@prisma/client';
import { repoConfigSchema } from './utils/repoConfigChecker';

export const reposRouter = createTRPCRouter({
    deployables: publicProcedure
        .input(z.object({
            refreshing: z.boolean().default(false)
        }))
        .query(async ({ ctx: { session, sessionStore, sessionID, prisma, web }, input: { refreshing } }) => {

            let manifest: DeployableRepo[] = await prisma.deployableRepo.findMany({
                where: {
                    webId: web.id
                }
            });

            if (manifest.length && !refreshing)
                return manifest.filter(repo => repo.config);

            if (!web.githubToken)
                return null;

            const { accessToken: lookupAccessToken } = web.githubToken;
            manifest = await prisma.deployableRepo.findMany({ where: { creatorAuthToken: lookupAccessToken } });

            if (manifest.length && !refreshing)
                return manifest.filter(repo => repo.config);

            const { refreshToken, expiresIn, createdAt } = web.githubToken;
            if (createdAt.valueOf() + expiresIn * 1000 < new Date().valueOf()) {
                try {

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
                        ...objectToCamel(await result.json() as any),
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

            const { accessToken } = web.githubToken;
            const octokit = new Octokit({ auth: accessToken });
            const reposData = await octokit.paginate(
                octokit.repos.listForAuthenticatedUser,
                {
                    per_page: 100
                },
                (response) => response.data.filter((r) => !r.archived)
            );

            const repos = reposData.map(repo => ({
                webId: web.id,
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
        }),
    getRepo: publicProcedure
        .input(z.object({
            owner: z.string(),
            name: z.string()
        }))
        .query(async ({ ctx: { webId, prisma }, input: repoInfo }) => {

            const data = await prisma.deployableRepo.findFirst({
                where: {
                    webId,
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
    registerGitHubCredentials: publicProcedure
        .input(z.object({
            code: z.string()
        }))
        .query(async ({ ctx: { session, sessionStore, sessionID, prisma, webId }, input: { code } }) => {

            const result = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    client_id: process.env['NX_GITHUB_CLIENTID'],
                    client_secret: process.env['NX_GITHUB_CLIENTSECRET'],
                    code
                })
            });

            const data = {
                ...objectToCamel<GitHubToken & { error?: string; errorDescription?: string; }>(await result.json() as any),
                createdAt: new Date()
            };

            if (!data.error) {
                await prisma.web.update({
                    where: { id: webId },
                    data: { githubToken: data }
                });
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
            }
            return data;
        })
});

export default reposRouter;
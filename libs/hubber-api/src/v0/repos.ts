import fetch from 'node-fetch';
import { Octokit } from '@octokit/rest';
import { GitHubToken } from '@secretarium/hubber-db';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';

declare module 'express-session' {
    interface SessionData {
        github_token: GitHubToken
    }
}

export const userRouter = createTRPCRouter({
    deployables: publicProcedure
        .input(z.boolean().default(false))
        .query(async ({ ctx: { session, sessionStore, sessionID, prisma }, input: refreshing }) => {

            if (!session.github_token)
                return null;

            const { access_token: lookup_access_token } = session.github_token;
            const manifest = await prisma.deployableRepos.findMany({ where: { token: lookup_access_token } });

            if (manifest.length && !refreshing)
                return manifest.filter(repo => repo.config);

            const { refresh_token, expires_in, created_at } = session.github_token;
            if (created_at.valueOf() + expires_in * 1000 < new Date().valueOf()) {
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
                            grant_type: 'refresh_token',
                            refresh_token
                        })
                    });
                    const data = {
                        ...await result.json(),
                        created_at: Date.now()
                    };
                    if (!data.error)
                        await new Promise<void>((resolve, reject) => {
                            session.github_token = data;
                            sessionStore.set(sessionID, {
                                ...session,
                                github_token: data
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

            const { access_token } = session.github_token;
            const octokit = new Octokit({ auth: access_token });
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
            //     token: access_token
            // }];
            const repos = reposData.map(repo => ({
                token: access_token,
                owner: repo.owner.login,
                name: repo.name
            })).filter(Boolean);

            const [, , reposWithId] = await prisma.$transaction([
                prisma.deployableRepos.deleteMany({ where: { token: access_token } }),
                prisma.deployableRepos.createMany({
                    data: repos
                }),
                prisma.deployableRepos.findMany({ where: { token: access_token } })
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
                    console.log('check', repo);
                    await prisma.deployableRepos.update({ where: { id: repo.id }, data: { config: repo.config } });
                    // // console.log('result  >>>', repo.full_name, handle.status);
                    // // return [repo.full_name, handle.data.toString()];
                    // return {
                    //     ...repo,
                    //     config: handle.data.toString()
                    // };
                } catch (e) {
                    // return [];
                    // return;
                }

                return repo;
            }));

            return validRepos.filter(repo => repo.config);
            // return mapping.filter(repoContent => repoContent.length);
            // console.log('PLOP >>>', mapping.filter(repoContent => repoContent.length));
            // return mapping.filter(repoContent => repoContent.length).reduce((prev, [repo, content]) => {
            //     if (content.trim() !== '')
            //         prev[repo] = content;
            //     return prev;
            // }, {} as Record<string, string>);
        })
});

export default userRouter;
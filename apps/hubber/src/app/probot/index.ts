import { prisma } from '@klave/db';
import type { Probot } from 'probot';
import { logger } from '@klave/providers';
import { deployToSubstrate } from '../controllers/deploymentController';

const probotApp = (app: Probot) => {
    app.on([
        'ping',
        'push',
        'pull_request',
        'repository',
        'check_run',
        'check_suite',
        'installation',
        'installation_repositories'
    ], async (context) => {

        // TODO Revisit this to use tRCP router with express context
        const hook = await prisma.hook.create({
            data: {
                source: 'github',
                event: context.name,
                remoteId: context.id,
                payload: context.payload as any
            }
        });
        logger.info(`New record of hook '${context.name}' ${hook.id}`);

        if (context.name === 'installation') {
            const { payload } = context;
            if (payload.action === 'created') {
                // TODO: Move this to the TRPC router
                logger.info(`Registering new GithubApp installation ${payload.installation.id}`);
                await prisma.installation.create({
                    data: {
                        source: 'github',
                        remoteId: `${payload.installation.id}`,
                        account: payload.installation.account.login,
                        accountType: payload.installation.account.type.toLowerCase() as any,
                        hookPayload: payload as any
                    }
                });

                if (payload.repositories && payload.repositories.length > 0)
                    for (const repo of payload.repositories) {
                        await prisma.repository.create({
                            data: {
                                source: 'github',
                                remoteId: `${repo.id}`,
                                installationRemoteId: `${payload.installation.id}`,
                                name: repo.name,
                                owner: payload.installation.account.login,
                                fullName: repo.full_name,
                                private: repo.private,
                                installationPayload: repo as any
                            }
                        });
                    }
            }
        }

        if (context.name === 'installation_repositories') {
            const { payload } = context;
            if (payload.action === 'added') {
                // TODO: Move this to the TRPC router
                if (payload.repositories_added && payload.repositories_added.length > 0)
                    for (const repo of payload.repositories_added) {
                        await prisma.repository.create({
                            data: {
                                source: 'github',
                                remoteId: `${repo.id}`,
                                installationRemoteId: `${payload.installation.id}`,
                                name: repo.name,
                                owner: payload.installation.account.login,
                                fullName: repo.full_name,
                                private: repo.private,
                                installationPayload: repo as any
                            }
                        });
                    }
            }
        }

        if (context.name === 'push')
            deployToSubstrate({
                octokit: context.octokit,
                class: context.name,
                type: context.name,
                repo: {
                    url: context.payload.repository.html_url,
                    owner: context.payload.repository.owner.login,
                    name: context.payload.repository.name
                },
                commit: {
                    url: context.payload.repository.commits_url,
                    ref: context.payload.ref,
                    before: context.payload.before,
                    after: context.payload.after,
                    forced: context.payload.forced
                },
                pusher: {
                    login: context.payload.sender.login,
                    avatarUrl: context.payload.sender.avatar_url,
                    htmlUrl: context.payload.sender.html_url
                }
            });
    });
};

export default probotApp;
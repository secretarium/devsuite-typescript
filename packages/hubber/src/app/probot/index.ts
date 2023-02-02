import { prisma } from '@secretarium/hubber-db';
import type { Probot } from 'probot';
import logger from '../../utils/logger';
import { deployToSubstrate } from '../controllers/deployementController';

const probotApp = (app: Probot) => {

    app.on([
        'ping',
        'pull_request.opened',
        'pull_request.synchronize',
        'check_run.rerequested',
        'push'
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
        logger.info(`New record of hook ${hook.id}`);

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
                    sha: context.payload.after
                },
                pusher: {
                    login: context.payload.sender.login,
                    avatarUrl: context.payload.sender.avatar_url,
                    htmlUrl: context.payload.sender.html_url
                }
            });

        if (context.name === 'pull_request')
            deployToSubstrate({
                octokit: context.octokit,
                class: context.name,
                type: context.payload.action,
                repo: {
                    url: context.payload.repository.html_url,
                    owner: context.payload.repository.owner.login,
                    name: context.payload.repository.name
                },
                commit: {
                    url: context.payload.pull_request.commits_url,
                    ref: context.payload.pull_request.head.ref,
                    sha: context.payload.pull_request.head.sha
                },
                pusher: {
                    login: context.payload.sender.login,
                    avatarUrl: context.payload.sender.avatar_url,
                    htmlUrl: context.payload.sender.html_url
                },
                pullRequest: {
                    url: context.payload.pull_request.html_url,
                    number: context.payload.pull_request.number
                }
            });
    });
};

export default probotApp;
import { prisma } from '@secretarium/hubber-db';
import type { Probot } from 'probot';
import logger from '../../utils/logger';
import { deployToSubstrate, updatePullRequestFromSubstrate } from '../controllers/deploymentController';

const processedEvents: Record<string, boolean> = {};
const probotApp = (app: Probot) => {
    app.on([
        'ping',
        'pull_request.opened',
        'pull_request.synchronize',
        'check_run.rerequested',
        'push'
    ], async (context) => {

        if (processedEvents[context.id])
            return;
        processedEvents[context.id] = true;

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

        if (context.name === 'pull_request')
            updatePullRequestFromSubstrate({
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
                    before: context.payload.action === 'synchronize' ? context.payload.before : context.payload.pull_request.base.sha,
                    after: context.payload.action === 'synchronize' ? context.payload.after : context.payload.pull_request.head.sha
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
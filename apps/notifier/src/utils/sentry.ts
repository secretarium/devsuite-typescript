import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export const sentryOps = {
    initialize: async () => {
        try {
            console.info('Initializing Sentry');
            Sentry.init({
                dsn: process.env['PDA_NOTIFIER_SENTRY_DSN'],
                release: `notifier@${process.env['GIT_REPO_VERSION']}`,
                environment: process.env['PDA_NOTIFIER_SENTRY_ENV'] ?? process.env['NODE_ENV'] ?? 'development',
                integrations: [
                    // enable HTTP calls tracing
                    Sentry.httpIntegration({ breadcrumbs: true }),
                    Sentry.mongoIntegration()
                ].concat(process.env['NODE_ENV'] === 'development' ? [nodeProfilingIntegration()] : []),
                // Set tracesSampleRate to 1.0 to capture 100%
                // of transactions for performance monitoring.
                // We recommend adjusting this value in production
                tracesSampleRate: 1.0,
                tracePropagationTargets: ['^localhost'],
                profilesSampleRate: 1.0
            });

        } catch (e) {
            console.error(`Could not initialize Sentry: ${e}`);
        }
    }
};

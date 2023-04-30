import * as Sentry from '@sentry/node';
// import { client } from '../../utils/db';

Sentry.init({
    dsn: process.env.NX_SENTRY_DSN,
    release: 'klave@0.0.0',
    environment: 'development',
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Sentry.Integrations.Express(),
        new Sentry.Integrations.Prisma(),
        // ({
        //     client:
        // }),
        new Sentry.Integrations.Mongo()
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0
});

const fork = <Handler>(func: () => Handler) => {
    if (process.env.NODE_ENV === 'test')
        return () => {
            //
        };
    return func();
};

export const sentryRequestMiddleware = fork(Sentry.Handlers.requestHandler);
export const sentryTracingMiddleware = fork(Sentry.Handlers.tracingHandler);
export const sentryErrorMiddleware = fork(Sentry.Handlers.errorHandler);
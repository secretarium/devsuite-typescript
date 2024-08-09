import * as Sentry from '@sentry/react';
import * as SecretariumInstruments from '@secretarium/instrumentation';
import { scpClient as scpClient } from './secretarium';

Sentry.init({

    dsn: import.meta.env['VITE_KLAVE_SENTRY_DSN'],
    release: `klave@${import.meta.env['VITE_REPO_VERSION']}`,
    environment: ['localhost', '::', '127.0.0.1'].includes(window.location.hostname) ? 'development' : window.location.hostname,
    integrations: [
        Sentry.browserTracingIntegration({
            enableHTTPTimings: true,
            enableLongTask: true
        }),
        new SecretariumInstruments.Sentry.ConnectorTracing({
            connector: scpClient,
            domains: ['.klave.network']
        }),
        Sentry.replayIntegration()
    ],

    // We recommend adjusting this value in production, or using tracesSampler for finer control
    tracesSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 1.0
});

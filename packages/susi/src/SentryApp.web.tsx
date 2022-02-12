import { Shell as BaseApp } from './Shell';
import * as Sentry from 'sentry-expo';
import * as SentryReact from '@sentry/react';
import { Integrations } from '@sentry/tracing';

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enableInExpoDevelopment: __DEV__,
    debug: __DEV__,
    tracesSampleRate: __DEV__ ? 1 : undefined,
    integrations: [
        new Integrations.BrowserTracing()
    ]
});

export const App = SentryReact.withProfiler(BaseApp);
export default App;
import { App as BaseApp } from './App';
import * as Sentry from 'sentry-expo';
import * as SentryReact from '@sentry/react';
import { Integrations } from '@sentry/tracing';

Sentry.init({
    dsn: 'https://a47a0917cc2d4cea8f2cc88cd87879ab@sentry.secretarium.org/3',
    enableInExpoDevelopment: __DEV__,
    debug: __DEV__,
    tracesSampleRate: __DEV__ ? 1 : undefined,
    integrations: [
        new Integrations.BrowserTracing()
    ]
});

export const App = SentryReact.withProfiler(BaseApp);
export default App;
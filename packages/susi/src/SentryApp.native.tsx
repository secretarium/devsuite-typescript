import { App as BaseApp } from './App';
import * as Sentry from 'sentry-expo';

Sentry.init({
    dsn: 'https://a47a0917cc2d4cea8f2cc88cd87879ab@sentry.secretarium.org/3',
    enableInExpoDevelopment: __DEV__,
    debug: __DEV__,
    tracesSampleRate: __DEV__ ? 1 : undefined,
    integrations: [
        new Sentry.Native.ReactNativeTracing({
            tracingOrigins: ['localhost', 'secretarium.io', 'secretarium.com', 'secretarium.org', /^\//]
        })
    ]
});

export const App = Sentry.Native.wrap(BaseApp);
export default App;
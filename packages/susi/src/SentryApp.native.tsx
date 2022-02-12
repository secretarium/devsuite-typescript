import { Shell as BaseApp } from './Shell';
import * as Sentry from 'sentry-expo';

console.log('BOOOOOOOOYAAAAAAAA ##########', process.env.SENTRY_DSN);
console.log('BOOOOOOOOYAAAAAAAA ##########', process.env);

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enableInExpoDevelopment: __DEV__,
    debug: __DEV__,
    tracesSampleRate: __DEV__ ? 1 : undefined,
    integrations: [
        new Sentry.Native.ReactNativeTracing({
            enableAppStartTracking: false,
            tracingOrigins: ['localhost', 'secretarium.io', 'secretarium.com', 'secretarium.org', /^\//]
        })
    ]
});

export const App = Sentry.Native.wrap(BaseApp);
export default App;
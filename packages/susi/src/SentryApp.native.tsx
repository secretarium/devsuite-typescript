import { Shell as BaseApp } from './Shell';
import * as Sentry from 'sentry-expo';

Sentry.init({
    dsn: process.env.NX_SENTRY_DSN,
    enableInExpoDevelopment: __DEV__,
    //enableNative: false,
    enableNative: process.env.JEST ? false : true,
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
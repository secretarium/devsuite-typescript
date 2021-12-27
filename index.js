import 'expo-dev-client';
import 'expo-dev-launcher';
import 'expo/build/Expo.fx';
import { activateKeepAwake } from 'expo-keep-awake';
import { connectToDevTools } from 'react-devtools-core';
import { registerRootComponent } from 'expo';
import * as Sentry from 'sentry-expo';

import { App } from './App';

Sentry.init({
    dsn: "https://a47a0917cc2d4cea8f2cc88cd87879ab@sentry.secretarium.org/3",
    enableInExpoDevelopment: __DEV__,
    debug: __DEV__,
    integrations: [
        new Sentry.Native.ReactNativeTracing({
            tracingOrigins: ['localhost', /^\//]
        })
    ]
});

if (__DEV__) {
    activateKeepAwake();
    connectToDevTools({
        host: "localhost",
        port: 8097,
    });
}

registerRootComponent(App);

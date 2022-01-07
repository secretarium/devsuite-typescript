import 'expo-dev-client';
import 'expo-dev-launcher';
import 'expo/build/Expo.fx';
import { activateKeepAwake } from 'expo-keep-awake';
import { connectToDevTools } from 'react-devtools-core';
import { registerRootComponent } from 'expo';

import { App } from './SentryApp';

if (__DEV__) {
    activateKeepAwake();
    connectToDevTools({
        host: "localhost",
        port: 8097,
    });
}

registerRootComponent(App);

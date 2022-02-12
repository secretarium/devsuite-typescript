import 'expo-dev-client';
import 'expo-dev-launcher';
import 'expo/build/Expo.fx';
import { LogBox } from 'react-native';
import { activateKeepAwake } from 'expo-keep-awake';
import { connectToDevTools } from 'react-devtools-core';
import { registerRootComponent } from 'expo';

import { App } from './src/SentryApp';

if (__DEV__) {
    LogBox.ignoreLogs([
        'Overwriting fontFamily style attribute preprocessor',
        /findNodeHandle/,
        /findHostInstance_DEPRECATED/
    ]);
    activateKeepAwake();
    connectToDevTools({
        host: '192.168.1.101',
        port: 8097
    });
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

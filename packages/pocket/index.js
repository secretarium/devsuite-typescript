import './wdyr';
// Temporary utility package for using Metro on web with lazy loading and Fast Refresh.
import '@bacons/expo-metro-runtime';
// ----
import 'expo-dev-client';
// import 'expo-dev-launcher';
// import 'expo/build/Expo.fx';
// import { createRoot } from 'react-dom/client';
import { LogBox } from 'react-native';
import { activateKeepAwake } from 'expo-keep-awake';
import { connectToDevTools } from 'react-devtools-core';
import { Platform } from 'react-native';
// Temporarily diable `registerRootComponent` for Expo SDK 46 because of React 18 incompatility
import { registerRootComponent } from 'expo';
// ----
// import { withDevTools } from 'expo/build/launch/withDevTools';

import { App } from './src/App';
// import { App } from './src/SentryApp';

// window.ReactDOM = unstable_batchedUpdates;
// console.log('TUTU >>>', unstable_batchedUpdates);

if (__DEV__) {
    LogBox.ignoreLogs([
        'Overwriting fontFamily style attribute preprocessor',
        /findNodeHandle/,
        /findHostInstance_DEPRECATED/
    ]);
    activateKeepAwake();
    if (Platform.OS !== 'web')
        connectToDevTools();
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
// ----
// Temporarily diable `registerRootComponent` for Expo SDK 46 because of React 18 incompatility
registerRootComponent(App);
//
// Doing this manually instead
// AppRegistry.registerComponent('main', () => withDevTools(App));
// if ('web' === Platform.OS) {
//     const rootTag = createRoot(document.getElementById('root') ?? document.getElementById('main'));
//     const RootComponent = withDevTools(App);
//     rootTag.render(<RootComponent />);
// }
// ----
import { registerRootComponent } from 'expo';
import { LogBox, Platform } from 'react-native';
import { activateKeepAwake } from 'expo-keep-awake';
import { connectToDevTools } from 'react-devtools-core';
// import { ExpoRoot } from 'expo-router';

import App from './src/app/Router';
// Must be exported or Fast Refresh won't update the context
// export function App() {
//     const ctx = require.context('./src/app');
//     return <ExpoRoot context={ctx} />;
// }

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
registerRootComponent(App);

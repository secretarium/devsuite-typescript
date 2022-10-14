export default {
    displayName: 'pocket',
    resolver: '@nrwl/jest/plugins/resolver',
    preset: 'jest-expo',
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-router-native)'
    ],
    moduleFileExtensions: ['ts', 'js', 'html', 'tsx', 'jsx'],
    setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
    moduleNameMapper: {
        '.svg': '@nrwl/expo/plugins/jest/svg-mock'
    },
    transform: {
        '\\.(js|ts|tsx)$': require.resolve('react-native/jest/preprocessor.js'),
        '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp|ttf)$': require.resolve(
            'react-native/jest/assetFileTransformer.js'
        )
    },
    coverageDirectory: '../../coverage/packages/pocket'
};

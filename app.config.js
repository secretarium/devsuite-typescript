const { version } = require('./package.json');
const STAGE = process.env.STAGE;
const BUILD_NUMBER = parseInt(process.env.GITHUB_RUN_ID || process.env.CI_JOB_ID || process.env.BUILD_NUMBER || 1);

const envConfig = {
    development: {
        name: 'Cryptx Dev',
        scheme: 'com.secretarium.cryptx.development',
        icon: './assets/icon.development.png',
        adaptiveIcon: './assets/adaptive-icon.development.png',
        adaptiveIconBackgroundColor: '#FF0000'
    },
    staging: {
        name: 'Cryptx Staging',
        scheme: 'com.secretarium.austin.staging',
        icon: './assets/icon.staging.png',
        adaptiveIcon: './assets/adaptive-icon.staging.png',
        adaptiveIconBackgroundColor: '#00FFFF'
    },
    production: {
        name: 'Secretarium Cryptx',
        scheme: 'com.secretarium.austin',
        icon: './assets/icon.png',
        adaptiveIcon: './assets/adaptive-icon.png',
        adaptiveIconBackgroundColor: '#FFFFFF'
    }
};

const config = envConfig[STAGE || 'development'];

export default {
    name: config.name,
    description: 'Secretarium CryptX Wallet',
    slug: 'cryptx',
    scheme: 'cryptx',
    owner: 'secretarium',
    icon: config.icon,
    version: version,
    splash: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#FFFFFF'
    },
    assetBundlePatterns: ['**/*'],
    orientation: 'portrait',
    updates: {
        fallbackToCacheTimeout: 0
    },
    ios: {
        bundleIdentifier: config.scheme,
        supportsTablet: true,
        buildNumber: `${BUILD_NUMBER}`,
        infoPlist: {
            CFBundleAllowMixedLocalizations: true,
            NSBluetoothPeripheralUsageDescription: true,
            NSBluetoothAlwaysUsageDescription: true
        },
        jsEngine: 'hermes'
    },
    android: {
        package: config.scheme,
        versionCode: BUILD_NUMBER,
        adaptiveIcon: {
            foregroundImage: config.adaptiveIcon,
            backgroundColor: config.adaptiveIconBackgroundColor
        },
        permissions: ['CAMERA', 'USE_FINGERPRINT', 'USE_BIOMETRIC', 'BLUETOOTH', 'BLUETOOTH_ADMIN'],
        jsEngine: 'hermes'
    },
    androidNavigationBar: {
        barStyle: 'dark-content',
        backgroundColor: '#0C0D3D'
    },
    web: {
        favicon: './assets/favicon.png'
    },
    // locales: {
    //     en: './ios/infoPlist/en.json',
    //     fr: './ios/infoPlist/fr.json'
    // },
    extra: {
        STAGE: process.env.STAGE
    },
    hooks: {
        "postPublish": [
            {
                "file": "sentry-expo/upload-sourcemaps",
                "config": {
                    "setCommits": true,
                    "organization": "secretarium",
                    "project": "cryptx",
                    "authToken": "af3941e8c4a9454ead4aed02fc6081e6b7b719218d28454a91a067e1e3ab5ee9",
                    "url": "https://sentry.secretarium.org/"
                }
            }
        ]
    },
    plugins: [
        'expo-community-flipper',
        'sentry-expo'
    ]
};

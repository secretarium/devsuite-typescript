const fs = require('fs');
const path = require('path');
const { version } = require('./package.json');
const STAGE = process.env.STAGE || 'development';
const NX_EXPO_PROJECT_ID = process.env.NX_EXPO_PROJECT_ID;
const BUILD_NUMBER = parseInt(process.env.GITHUB_RUN_ID || process.env.CI_JOB_ID || process.env.BUILD_NUMBER || 1);

const envConfig = {
    development: {
        name: 'Cryptx Dev',
        bundle: 'com.secretarium.cryptx.development',
        splash: './assets/splash.development.png',
        icon: './assets/icon.development.png',
        favicon: './assets/favicon.development.png',
        adaptiveIcon: './assets/adaptive-icon.development.png',
        notificationIcon: './assets/notification-icon.development.png',
        adaptiveIconBackgroundColor: '#FFFFFF'
    },
    staging: {
        name: 'Cryptx Staging',
        bundle: 'com.secretarium.cryptx.staging',
        splash: './assets/splash.staging.png',
        icon: './assets/icon.staging.png',
        favicon: './assets/favicon.staging.png',
        adaptiveIcon: './assets/adaptive-icon.staging.png',
        notificationIcon: './assets/notification-icon.staging.png',
        adaptiveIconBackgroundColor: '#FFFFFF'
    },
    production: {
        name: 'Secretarium Cryptx',
        bundle: 'com.secretarium.cryptx',
        splash: './assets/splash.png',
        icon: './assets/icon.png',
        favicon: './assets/favicon.png',
        adaptiveIcon: './assets/adaptive-icon.png',
        notificationIcon: './assets/notification-icon.png',
        adaptiveIconBackgroundColor: '#B21D36'
    }
};

const config = envConfig[STAGE];

let googleServicesFile = path.join(__dirname, 'google-services.json');
const googleEnvProvenance = `GOOGLE_FCM_CONFIG_${STAGE}`.toUpperCase();

if (process.env.CI && process.env[googleEnvProvenance]) {

    const googleServicesEnv = process.env[googleEnvProvenance].split(',').reduce((prev, current) => {
        const entry = current.split('=');
        return {
            ...prev,
            [`<${entry[0]}>`]: entry[1]
        };
    }, {
        '<package_name>': config.bundle
    });

    const googleServicesFileContent = fs.readFileSync(path.join(__dirname, 'google-services.base.json'), 'utf-8');
    const googleServicesFileTransform = googleServicesFileContent.replace(/(<.*?>)/g, match => {
        return googleServicesEnv[match];
    });

    fs.writeFileSync(googleServicesFile, googleServicesFileTransform, { encoding: 'utf-8' });

} else if (fs.existsSync(path.join(__dirname, 'google-services.local.json'))) {

    const googleServicesFileContent = fs.readFileSync(path.join(__dirname, 'google-services.local.json'), 'utf-8');

    fs.writeFileSync(googleServicesFile, googleServicesFileContent, { encoding: 'utf-8' });

} else
    googleServicesFile = undefined;

export default {
    name: config.name,
    description: 'Secretarium CryptX Wallet',
    slug: 'cryptx',
    scheme: 'cryptx',
    owner: 'secretarium',
    icon: config.icon,
    version: version,
    privacy: STAGE === 'production' ? 'public' : 'hidden',
    splash: {
        image: config.splash,
        resizeMode: 'contain',
        backgroundColor: config.adaptiveIconBackgroundColor
    },
    assetBundlePatterns: ['**/*'],
    orientation: 'portrait',
    updates: {
        fallbackToCacheTimeout: 0
    },
    ios: {
        bundleIdentifier: config.bundle,
        supportsTablet: true,
        buildNumber: `${BUILD_NUMBER}`,
        infoPlist: {
            CFBundleAllowMixedLocalizations: true,
            NSBluetoothPeripheralUsageDescription: true,
            NSBluetoothAlwaysUsageDescription: true
        }
    },
    android: {
        package: config.bundle,
        versionCode: BUILD_NUMBER,
        adaptiveIcon: {
            foregroundImage: config.adaptiveIcon,
            backgroundColor: config.adaptiveIconBackgroundColor
        },
        googleServicesFile,
        permissions: ['CAMERA', 'USE_FINGERPRINT', 'USE_BIOMETRIC', 'BLUETOOTH', 'BLUETOOTH_ADMIN']
    },
    androidNavigationBar: {
        barStyle: 'dark-content',
        backgroundColor: '#0C0D3D'
    },
    web: {
        favicon: config.favicon,
        bundler: 'metro'
    },
    locales: {
        en: './ios/infoPlist/en.json',
        fr: './ios/infoPlist/fr.json'
    },
    jsEngine: 'hermes',
    experiments: {
        turboModules: true
    },
    extra: {
        STAGE,
        BUILD_NUMBER,
        eas: {
            projectId: NX_EXPO_PROJECT_ID
        }
    },
    hooks: {
        // postPublish: [
        //     {
        //         file: 'sentry-expo/upload-sourcemaps',
        //         config: {
        //             setCommits: true,
        //             organization: 'secretarium',
        //             project: 'cryptx',
        //             url: 'https://sentry.secretarium.org/'
        //             // "authToken": via SENTRY_AUTH_TOKEN
        //         }
        //     }
        // ]
    },
    plugins: [
        [
            'expo-notifications',
            {
                color: '#ffffff',
                icon: config.notificationIcon
                // "sounds": [
                //     "./assets/notification-sound.wav",
                //     "./assets/notification-sound-other.wav"
                // ]
            }
        ]
        // 'sentry-expo'
    ]//.concat(STAGE === 'production' ? [] : ['expo-community-flipper'])
};

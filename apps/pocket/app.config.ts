import { ExpoConfig, ConfigContext } from 'expo/config';
import fs from 'fs';
import path from 'path';
import { version } from './package.json';

const STAGE = process.env['STAGE'] || 'development';
const EXPO_PROJECT_ID = process.env['NX_EXPO_PROJECT_ID'] ?? process.env['EXPO_PUBLIC_PROJECT_ID'];
const BUILD_NUMBER = parseInt(process.env['GITHUB_RUN_ID'] || process.env['CI_JOB_ID'] || process.env['BUILD_NUMBER'] || '1');
const SENTRY_DSN_URL = process.env['NX_SENTRY_DSN'] ?? process.env['NX_SENTRY_URL'] ?? process.env['EXPO_PUBLIC_SENTRY_DSN'] ?? process.env['EXPO_PUBLIC_SENTRY_URL'] ?? process.env['SENTRY_DSN'] ?? process.env['SENTRY_URL'];
const sentryUrl = SENTRY_DSN_URL ? new URL(SENTRY_DSN_URL) : undefined;

const envConfig = {
    development: {
        name: 'Cryptx Dev',
        bundle: 'com.secretarium.cryptx.development',
        splash: './assets/splash.development.png',
        icon: './assets/icon.development.png',
        favicon: './assets/favicon.development.png',
        adaptiveIcon: './assets/adaptive-icon.development.png',
        notificationIcon: './assets/notification-icon.development.png',
        adaptiveIconBackgroundColor: '#FFFFFF',
        androidNavigationBar: {
            barStyle: 'dark-content',
            backgroundColor: '#0C0D3D'
        }
    },
    staging: {
        name: 'Cryptx Staging',
        bundle: 'com.secretarium.cryptx.staging',
        splash: './assets/splash.staging.png',
        icon: './assets/icon.staging.png',
        favicon: './assets/favicon.staging.png',
        adaptiveIcon: './assets/adaptive-icon.staging.png',
        notificationIcon: './assets/notification-icon.staging.png',
        adaptiveIconBackgroundColor: '#FFFFFF',
        androidNavigationBar: {
            barStyle: 'dark-content',
            backgroundColor: '#0C0D3D'
        }
    },
    production: {
        name: 'Secretarium Cryptx',
        bundle: 'com.secretarium.cryptx',
        splash: './assets/splash.png',
        icon: './assets/icon.png',
        favicon: './assets/favicon.png',
        adaptiveIcon: './assets/adaptive-icon.png',
        notificationIcon: './assets/notification-icon.png',
        adaptiveIconBackgroundColor: '#B21D36',
        androidNavigationBar: {
            barStyle: 'dark-content',
            backgroundColor: '#0C0D3D'
        }
    }
};

const config = envConfig[STAGE as keyof typeof envConfig];

let googleServicesFile: string | undefined = path.join(__dirname, 'google-services.json');
const googleEnvProvenance = `GOOGLE_FCM_CONFIG_${STAGE}`.toUpperCase();

if (process.env['CI'] && process.env[googleEnvProvenance]) {

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
        return googleServicesEnv[match as keyof typeof googleServicesEnv];
    });

    fs.writeFileSync(googleServicesFile, googleServicesFileTransform, { encoding: 'utf-8' });

} else if (fs.existsSync(path.join(__dirname, 'google-services.local.json'))) {

    const googleServicesFileContent = fs.readFileSync(path.join(__dirname, 'google-services.local.json'), 'utf-8');

    fs.writeFileSync(googleServicesFile, googleServicesFileContent, { encoding: 'utf-8' });

} else
    googleServicesFile = undefined;

export default (context: ConfigContext): ExpoConfig => {

    const { config: defaultConfig } = context;
    const finalConfig: ExpoConfig = {
        ...defaultConfig,
        name: config.name,
        description: 'Secretarium CryptX Wallet',
        slug: 'cryptx',
        scheme: 'cryptx',
        owner: 'secretarium',
        icon: config.icon,
        version: version,
        splash: {
            image: config.splash,
            resizeMode: 'contain',
            backgroundColor: config.adaptiveIconBackgroundColor
        },
        assetBundlePatterns: [
            '**/*'
        ],
        userInterfaceStyle: 'light',
        orientation: 'portrait',
        updates: {
            fallbackToCacheTimeout: 0
        },
        jsEngine: 'hermes',
        ios: {
            bundleIdentifier: config.bundle,
            supportsTablet: true,
            buildNumber: `${BUILD_NUMBER}`,
            infoPlist: {
                CFBundleAllowMixedLocalizations: true
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
            permissions: ['CAMERA', 'USE_FINGERPRINT', 'USE_BIOMETRIC']
        },
        androidNavigationBar: config.androidNavigationBar as ExpoConfig['androidStatusBar'],
        web: {
            favicon: config.favicon,
            bundler: 'metro'
        },
        locales: {
            en: './ios/infoPlist/en.json',
            fr: './ios/infoPlist/fr.json'
        },
        extra: {
            STAGE,
            BUILD_NUMBER,
            eas: {
                projectId: EXPO_PROJECT_ID
            }
        },
        plugins: [
            [
                'expo-build-properties',
                {
                    android: {
                        enableProguardInReleaseBuilds: true,
                        newArchEnabled: true
                    },
                    ios: {
                        newArchEnabled: true
                    }
                }
            ],
            [
                '@config-plugins/detox',
                {
                    skipProguard: false,
                    subdomains: ['10.0.2.2', 'localhost']
                }
            ],
            'expo-router',
            'expo-localization',
            [
                '@sentry/react-native/expo',
                {
                    url: sentryUrl?.origin,
                    project: 'secretarium-id',
                    organization: 'secretarium'
                }
            ]
        ]
    };

    return finalConfig;
};
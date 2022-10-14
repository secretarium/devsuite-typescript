import { atom } from 'recoil';
import { StatusBarStyle } from 'expo-status-bar';

export type themeType = {
    primaryColor: string,
    secondaryColor: string,
    tertiaryColor: string,
    statusBarColor: StatusBarStyle,
    appName: string
};

export const themeState = atom<themeType>({
    key: 'themeState',
    default: {
        primaryColor: '#E6224F',
        secondaryColor: '#FFFFFF',
        tertiaryColor: '#000000',
        statusBarColor: 'light',
        appName: 'Secretarium'
    }
});
import { atom } from 'recoil';

export const themeState = atom({
    key: 'themeState',
    default: {
        backgroundColor: '#007fff'
    }
});
import { atom } from 'recoil';

export const themeState = atom({
    key: 'themeState',
    default: {
        backgroundColor: '#E6224F'
    }
});
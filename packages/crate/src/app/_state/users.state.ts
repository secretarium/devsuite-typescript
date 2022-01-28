import { atom } from 'recoil';

const usersAtom = atom<Array<any> | null>({
    key: 'users',
    default: null
});

const userAtom = atom<{
    id: string;
} | null>({
    key: 'user',
    default: null
});

export {
    usersAtom,
    userAtom
};
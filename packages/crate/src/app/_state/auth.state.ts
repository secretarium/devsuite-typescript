import { atom } from 'recoil';

type AuthAtom = {
    token: string;
    id: string;
    firstName: string;
}

const authAtom = atom<AuthAtom | null>({
    key: 'auth',
    default: localStorage ? JSON.parse(localStorage?.getItem('crate') ?? '{}') ?? null : null
});

export { authAtom };
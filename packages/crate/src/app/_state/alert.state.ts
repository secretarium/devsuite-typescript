import { atom } from 'recoil';

const alertAtom = atom<{ message: string, type: string } | null>({
    key: 'alert',
    default: null
});

export { alertAtom };
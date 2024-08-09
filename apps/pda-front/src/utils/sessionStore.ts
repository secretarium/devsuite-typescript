import { observable } from '@legendapp/state';
// import { persistObservable } from '@legendapp/state/persist';
import { configureObservableSync, syncObservable } from '@legendapp/state/sync';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import { enableReactComponents } from '@legendapp/state/config/enableReactComponents';
import { Utils } from '@secretarium/crypto';

// Enable the Reactive components, only need to do this once
enableReactComponents();

// Setup global sync and persist configuration. These can be overriden
// per observable.
configureObservableSync({
    syncMode: 'auto',
    persist: {
        plugin: ObservablePersistLocalStorage,
        retrySync: true // Persist pending changes and retry
    },
    retry: {
        infinite: true // Retry changes with exponential backoff
    }
});

export type LoginStep = 'login' | 'ecode' | 'totp' | 'done';

export type Account = {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
};

export type AuthenticationResponse = {
    token: string;
}

export type VerificationResponse = {
    token: string;
    seedTotp: string;
}

export const tokenParser = (token: string) => {
    const binToken = Utils.fromBase64(token);
    return {
        text: token,
        nounce: Array.from(binToken.slice(0, 8)),
        authLevel: Array.from(binToken.slice(8, 16)),
        time: Array.from(binToken.slice(16, 24)),
        userVendorId: Array.from(binToken.slice(24, 56)),
        data: Array.from(binToken.slice(56, binToken.length - 32)),
        sig: Array.from(binToken.slice(binToken.length - 32))
    };
};

export type Token = ReturnType<typeof tokenParser>;

export const initialState = {
    token: null as Token | null,
    accounts: [] as Account[],
    selectedAccount: null as Account['id'] | null,
    currentTotpSeed: null as string | null
};

export const sessionState = observable(initialState);

// Persist the observable to the named key of the global persist plugin
syncObservable(sessionState, {
    persist: {
        name: 'pda_v0'
    }
});
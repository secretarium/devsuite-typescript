import { createContext } from 'react';
import type { SecretariumContextValue } from './types';

const contextKey = typeof Symbol === 'function' && typeof Symbol.for === 'function'
    ? Symbol.for('__SECRETARIUM_CONTEXT__')
    : '__SECRETARIUM_CONTEXT__';

export function getSecretariumContext(): React.Context<SecretariumContextValue> {
    let context = (createContext as any)[contextKey] as React.Context<SecretariumContextValue>;
    if (!context) {
        Object.defineProperty(createContext, contextKey, {
            value: context = createContext<SecretariumContextValue>({}),
            enumerable: false,
            writable: false,
            configurable: true
        });
        context.displayName = 'SecretariumContext';
    }
    return context;
}

export const SecretariumContext = getSecretariumContext();

export default SecretariumContext;
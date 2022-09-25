import { useMemo } from 'react';
import type { FC } from 'react';
import { SecretariumConnector } from '@secretarium/connector';
import { SecretariumContext } from './SecretariumContext';
import type { SecretariumContextValue, SecretariumProviderProps } from './types';
import './devtools';

export const SecretariumProvider: FC<SecretariumProviderProps> = ({
    children,
    connector,
    options
}) => {

    const defaults = useMemo<SecretariumContextValue>(
        () => ({
            connector: connector ?? new SecretariumConnector(options ?? {})
        }),
        [connector, options]
    );

    return (
        <SecretariumContext.Provider value={defaults}>
            {children}
        </SecretariumContext.Provider>
    );
};

export default SecretariumProvider;

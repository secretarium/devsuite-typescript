import { useMemo } from 'react';
import type { FC } from 'react';
import { SecretariumConnector } from '@secretarium/connector';
import { SecretariumContext } from './SecretariumContext';
import type { SecretariumContextValue, SecretariumProviderProps } from './types';
import './devtools';

export const SecretariumProvider: FC<SecretariumProviderProps> = ({
    children,
    connector,
    ...rest
}) => {

    const defaults = useMemo<SecretariumContextValue>(
        () => ({
            connector: connector ?? new SecretariumConnector({
                ...rest
            })
        }),
        [connector, rest]
    );

    return (
        <SecretariumContext.Provider value={defaults}>
            {children}
        </SecretariumContext.Provider>
    );
};

export default SecretariumProvider;

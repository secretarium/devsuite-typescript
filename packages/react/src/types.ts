import type { ReactNode } from 'react';
import type { Connector, ConnectorOptions } from '@secretarium/connector';

export type QueryOptions<TBase> = TBase & {
    timeout?: number;
    cacheLife?: number;
    persist?: boolean;
    suspense?: boolean;
}

export type Query = {
    app: string;
    route: string;
    args?: Record<string, any>
}

export type SecretariumContextValue = {
    connector?: Connector;
    options?: ConnectorOptions;
}

export type SecretariumOptions = {
    transformers?: {
        inbound?: () => void;
        outbound?: () => void;
    }
};

export type SecretariumProviderProps = {
    children: ReactNode;
} & ({
    // link?: LinkImplementation;
    // connections?: Server | Array<Server>;
    // options?: SecretariumOptions;
    connector?: Connector;
    options?: never;
} | {
    connector?: never;
    options?: ConnectorOptions;
})

export interface DoFetchArgs {
    url: string
    options: RequestInit
    response: {
        isCached: boolean
        id: string
        cached?: Response
    }
}

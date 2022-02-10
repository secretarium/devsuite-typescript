import type { Transaction } from './secretarium.connector';

interface Nameable {
    displayName?: string;
}

export interface LinkConstructor extends Nameable {
    new(server: Server): ConnectorLink;
}

export interface ConnectorLink {
    _: unknown
}

export interface ConnectorTransformer {
    _: unknown
}

export type ConnectorTransformerStack = Record<string, ConnectorTransformer>;

export type ConnectionString = string;

export type ServerObject = {
    url: string;
    trustKey: string;
    name?: string;
    cluster?: string;
}

export type Server = ConnectionString | ServerObject;

export type ConnectorTransport = 'https' | 'wss';

export type ConnectorOptions = {
    transport?: ConnectorTransport
    connections?: Server | Array<Server>;
    transformers?: ConnectorTransformerStack;
    connectToDevTools?: boolean;
}

export interface Connector {
    version: string;
    isConnected: boolean;
    request(command: {
        application: string,
        route: string
        explicit?: string
    }, args?: Record<string, any>, subscribe?: boolean): Promise<Transaction>;
}

export interface ConnectorConstructor extends Nameable {
    new(options: ConnectorOptions): Connector;
}
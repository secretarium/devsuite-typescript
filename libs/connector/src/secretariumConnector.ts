// import { WebSocketLink, HTTPSLink } from './links';
import { SCP, Transaction } from './secretarium.connector';
import { Key } from './secretarium.key';
import { Utils } from '@secretarium/crypto';
import type {
    ConnectorConstructor,
    Connector,
    ConnectorLink,
    ConnectorOptions,
    // ConnectorTransport,
    Server,
    ServerObject
} from './types';

export const SecretariumConnector: ConnectorConstructor = class SecretariumConnector implements Connector {

    public readonly version = '1.0.0-alpha';
    private _isConnected = false;
    private _isConnecting = false;
    private devToolsSymbol = Symbol('__SECRETARIUM_CONNECTOR__');
    // private transport: ConnectorTransport;
    private connections: Array<ServerObject>;
    private scp: SCP;
    private currentServer = -1;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private link?: ConnectorLink;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private devToolsHookCallback: () => void;

    constructor(options: ConnectorOptions) {

        const {
            // transport = 'wss',
            connections,
            connection,
            connectToDevTools = typeof globalThis === 'object' && !(globalThis as any).__SECRETARIUM_DEVTOOLS_CONNECTOR__
        } = options;

        // this.transport = transport;
        this.connections = SecretariumConnector.expandServers(connection ?? connections ?? []);
        this.scp = new SCP({
            logger: console
        });

        if (connectToDevTools && typeof globalThis === 'object') {
            if ((globalThis as any).__SECRETARIUM_DEVTOOLS_CONNECTOR__ === undefined)
                (globalThis as any).__SECRETARIUM_DEVTOOLS_CONNECTOR__ = {};
            (globalThis as any).__SECRETARIUM_DEVTOOLS_CONNECTOR__[this.devToolsSymbol] = this;
        }
    }

    public get isConnected() {
        return this._isConnected;
    }

    public setConnections(connections: Server | Array<Server>) {
        this.connections = SecretariumConnector.expandServers(connections);
    }

    public async connect() {
        if (this._isConnecting)
            // If we are currently connecting lets hold on to know the outcome
            return new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (!this._isConnecting) {
                        clearInterval(interval);
                        resolve(this._isConnected);
                    }
                }, 100);
            });

        this._isConnected = false;
        this._isConnecting = true;
        this.rotateServer();
        // this.link = new (this.transport === 'wss' ? WebSocketLink : HTTPSLink)(this.connections[this.currentServer]);
        // return this.link.connect()
        const server = this.connections[this.currentServer];

        if (server === undefined)
            throw new Error('No server to connect to');

        const key = await Key.createKey();
        return await this.scp
            .reset()
            .connect(server.url, key, Utils.fromBase64(server.trustKey))
            .then(() => {
                this._isConnected = true;
                this._isConnecting = false;
            });
    }

    public async request(command: {
        application: string,
        route: string
        explicit: string
    }, args: Record<string, any> = {}, subscribe?: boolean): Promise<Transaction> {

        if (!this.isConnected)
            await this.connect();

        const requestId = command.explicit ?? `${command.application}-${command.route}-${subscribe ? Object
            .values(args)
            .filter(arg => typeof arg === 'number' || typeof arg === 'string')
            .map(arg => `${arg}`.replace(/[^\w]/g, ''))
            .reduce((previous, current, index) => {
                return `${previous}${index}${current}`;
            }, 'sub') : (new Date().getTime() * Math.random()).toString(16).slice(0, 8)}`;


        return this.scp.newTx(command.application, command.route, requestId, args);
    }

    public reset() {
        this.scp
            .reset();
    }

    public __actionHookForDevTools(callback: () => any) {
        this.devToolsHookCallback = callback;
    }

    private static expandServers(connections: Server | Array<Server>): ServerObject[] {
        return (connections instanceof Array ? connections : [connections]).map<ServerObject | undefined>(connection => {
            if (typeof connection !== 'string')
                return connection;
            const [cluster, name, url, trustKey] = connection.split('#');
            if (url === undefined || trustKey === undefined)
                return undefined;
            return {
                cluster,
                name,
                url,
                trustKey
            };
        }).filter(Boolean) as ServerObject[];
    }

    private rotateServer() {
        let nextServer = this.currentServer;
        do {
            nextServer = Math.floor(Math.random() * this.connections.length);
        } while ((nextServer === this.currentServer && this.connections?.length > 1) || nextServer < 0 || nextServer >= this.connections.length);
        this.currentServer = nextServer;
    }
};

SecretariumConnector.displayName = 'SecretariumConnector';

export default SecretariumConnector;
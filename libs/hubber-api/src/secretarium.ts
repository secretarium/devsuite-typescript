import { SCP, Key, Constants } from '@secretarium/connector';

export const client = new SCP();

let connectionKey: Key | undefined;
let reconnectAttempt = 0;
let reconnectionTimeout: NodeJS.Timeout | undefined;
let lastSCPState = Constants.ConnectionState.closed;

const planReconnection = () => {
    if (!reconnectionTimeout) {
        reconnectionTimeout = setTimeout(() => {
            clearTimeout(reconnectionTimeout);
            reconnectionTimeout = undefined;
            AppLedgerSource.initialize().catch(() => { return; });
        }, 3000);
    }
};

client.onStateChange((state) => {
    lastSCPState = state;
    if (lastSCPState !== Constants.ConnectionState.secure && lastSCPState !== Constants.ConnectionState.connecting)
        planReconnection();
});

export const AppLedgerSource = {
    initialize: async () => {
        try {
            if (!connectionKey)
                connectionKey = await Key.createKey();
            const [node, trustKey] = process.env['NX_SECRETARIUM_NODE']?.split('|') ?? [];
            await client.connect(node, connectionKey, trustKey);
            reconnectAttempt = 0;
            return;
        } catch (e) {
            console.error(`SCP:${++reconnectAttempt}:`, e);
            lastSCPState = Constants.ConnectionState.closed;
        }
    },
    isConnected: () => {
        return lastSCPState === Constants.ConnectionState.secure;
    },
    stop: async () => {
        try {
            await client.close();
            return;
        } catch (e) {
            //
        }
    }
};

export default client;
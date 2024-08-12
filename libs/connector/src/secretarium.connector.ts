/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as NNG from './nng.websocket.js';
import { Key } from './secretarium.key.js';
import { ErrorCodes, Secrets, ConnectionState, ErrorMessage } from './secretarium.constant.js';
import crypto, { Utils } from '@secretarium/crypto';

class SCPSession {
    iv: Uint8Array;
    cryptoKey: CryptoKey;

    constructor(iv: Uint8Array, cryptoKey: CryptoKey) {
        this.iv = iv;
        this.cryptoKey = cryptoKey;
    }
}

type SCPOptions = {
    logger?: {
        log?: (...message: any[]) => void;
        info?: (...message: any[]) => void;
        debug?: (...message: any[]) => void;
        warn?: (...message: any[]) => void;
        error?: (...message: any[]) => void;
    };
};

type SCPEndpoint = {
    url: string;
    knownTrustedKey?: string;
} | undefined;

type ErrorHandler<TData = any> = (error: TData, requestId: string) => void;
type ResultHandler<TData = any> = (result: TData, requestId: string) => void;
type NaiveHandler = (requestId: string) => void;

interface QueryHandlers<ResultType = any, ErrorType = any> {
    onError: (handler: ErrorHandler<ErrorType>) => this;
    onResult: (handler: ResultHandler<ResultType>) => this;
}

interface TransactionHandlers<ResultType = any, ErrorType = any> extends QueryHandlers<ResultType, ErrorType> {
    onAcknowledged: (handler: NaiveHandler) => this;
    /**
     * @deprecated onPropose handlers were retired in Secretarium Core 1.0.0
     */
    onProposed: (handler: NaiveHandler) => this;
    onCommitted: (handler: NaiveHandler) => this;
    onExecuted: (handler: NaiveHandler) => this;
}

interface NotificationHandlers<ResultType = any, ErrorType = any> {
    failed?: boolean;
    promise: {
        resolve: (o: ResultType) => void;
        reject: (o: ErrorType) => void;
    };
}

type QueryNotificationHandlers<ResultType = any, ErrorType = any> = NotificationHandlers<ResultType, ErrorType> & {
    onError: ErrorHandler<ErrorType>[];
    onResult: ResultHandler<ResultType>[];
};

type TransactionNotificationHandlers<ResultType = any, ErrorType = any> = QueryNotificationHandlers<ResultType, ErrorType> & {
    onAcknowledged: NaiveHandler[];
    /**
     * @deprecated onPropose handlers were retired in Secretarium Core 1.0.0
     */
    onProposed: NaiveHandler[];
    onCommitted: NaiveHandler[];
    onExecuted: NaiveHandler[];
};

export type Query<ResultType = any, ErrorType = any> = QueryHandlers<ResultType, ErrorType> & {
    send: () => Promise<ResultType>;
};

export type Transaction<ResultType = any, ErrorType = any> = TransactionHandlers<ResultType, ErrorType> & {
    send: () => Promise<ResultType>;
};

export class SCP {
    private _socket: NNG.WS | null = null;
    private _connectionState = ConnectionState.closed;
    private _onStateChange: ((state: ConnectionState) => void) | null = null;
    private _onError?: ((err: string) => void) | null = null;
    private _requests: { [key: string]: QueryNotificationHandlers | TransactionNotificationHandlers } = {};
    private _session: SCPSession | null = null;
    private _options: SCPOptions;
    private _endpoint: SCPEndpoint;

    constructor(options?: SCPOptions) {
        this._options = options || {};
        this.reset();
    }

    reset(options?: SCPOptions): SCP {
        if (this._socket && this._socket.state > ConnectionState.closing) this._socket.close();

        this._options = options || this._options || {};
        this._session = null;
        this._onStateChange = null;
        this._onError = null;
        this._requests = {};
        this._updateState(ConnectionState.closed);
        return this;
    }

    private _updateState(state: ConnectionState): void {
        this._connectionState = state;
        if (this._onStateChange !== null) this._onStateChange(state);
    }

    private async _encrypt(data: Uint8Array): Promise<Uint8Array> {
        if (!this._session)
            throw new Error(ErrorMessage[ErrorCodes.ESCPNOTRE]);
        const ivOffset = Utils.getRandomBytes(16);
        const iv = Utils.incrementBy(this._session.iv, ivOffset).subarray(0, 12);
        const encrypted = new Uint8Array(await crypto.subtle!.encrypt({ name: 'AES-GCM', iv: iv, tagLength: 128 }, this._session.cryptoKey, data));
        return Utils.concatBytes(ivOffset, encrypted);
    }

    private async _decrypt(data: Uint8Array): Promise<Uint8Array> {
        if (!this._session)
            throw new Error(ErrorMessage[ErrorCodes.ESCPNOTRD]);
        const iv = Utils.incrementBy(this._session.iv, data.subarray(0, 16)).subarray(0, 12);
        return new Uint8Array(await crypto.subtle!.decrypt({ name: 'AES-GCM', iv: iv, tagLength: 128 }, this._session.cryptoKey, data.subarray(16)));
    }

    private _notify(json: string): void {
        try {
            const o = JSON.parse(json) as any;
            this._options.logger?.debug?.('Secretarium received:', o);
            if (!!o && o.requestId) {
                const x = this._requests[o.requestId];
                if (!x) {
                    this._options.logger?.warn?.('Unexpected notification: ' + json);
                    return;
                }
                if (o.error) {
                    x.onError?.forEach((cb) => cb(o.error, o.requestId));
                    x.failed = true;
                    x.promise.reject(o.error);
                } else if (o.result) {
                    x.onResult?.forEach((cb) => cb(o.result, o.requestId));
                    x.promise.resolve(o.result);
                } else if (o.state) {
                    if (x.failed === true) return;
                    const z = x as TransactionNotificationHandlers;
                    switch (o.state.toLowerCase()) {
                        case 'acknowledged':
                            z.onAcknowledged?.forEach((cb) => cb(o.requestId));
                            break;
                        case 'proposed':
                            z.onProposed?.forEach((cb) => cb(o.requestId));
                            break;
                        case 'committed':
                            z.onCommitted?.forEach((cb) => cb(o.requestId));
                            break;
                        case 'executed':
                            z.onExecuted?.forEach((cb) => cb(o.requestId));
                            z.promise.resolve(o.result);
                            break;
                        case 'failed':
                            z.onError?.forEach((cb) => cb(ErrorMessage[ErrorCodes.ETRANSFIL], o.requestId));
                            z.failed = true;
                            z.promise.reject(o.error);
                            break;
                        default:
                            break;
                    }
                }
            }
        } catch (e: any) {
            const m = `Error '${e.message}' when received '${JSON.stringify(json)}'`;
            if (this._onError) this._onError(m);
            else this._options.logger?.error?.(m);
        }
    }

    private _computeProofOfWork(nonce: Uint8Array): Uint8Array {
        return nonce; // proof-of-work verification is currently deactivated
    }

    get state(): ConnectionState {
        return this._connectionState;
    }

    get bufferedAmount(): number {
        return this._socket?.bufferedAmount || 0;
    }

    async connect(url: string, userKey: Key, knownTrustedKey: Uint8Array | string | undefined = undefined, protocol: NNG.Protocol = NNG.Protocol.pair1): Promise<void> {
        // if (this._socket && this._socket.state < ConnectionState.closing) this._socket.close();

        this._endpoint = {
            url,
            knownTrustedKey: knownTrustedKey ? typeof knownTrustedKey === 'string' ? knownTrustedKey : Utils.toBase64(knownTrustedKey) : undefined
        };

        this._updateState(ConnectionState.connecting);
        const trustedKey = Uint8Array.from(Utils.fromBase64(this._endpoint.knownTrustedKey ?? Utils.toBase64(Utils.getRandomBytes(64))));
        const socket = (this._socket = new NNG.WS());
        let ecdh: CryptoKeyPair;
        let ecdhPubKeyRaw: Uint8Array;
        let serverEcdsaPubKey: CryptoKey;

        return new Promise((resolve, reject) => {
            new Promise((resolve, reject) => {
                const tId = setTimeout(() => {
                    reject(ErrorMessage[ErrorCodes.ETIMOCHEL]);
                }, 3000);
                socket
                    .onopen((x) => {
                        clearTimeout(tId);
                        resolve(x);
                    })
                    // This sometimes swallows `onclose` events containing the error code
                    .onerror(reject)
                    // This sometimes gets swallowed by `onerror`
                    .onclose(reject)
                    .connect(url, protocol);
            })
                .then(async (): Promise<Uint8Array> => {
                    socket
                        .onerror(() => {
                            this._updateState(ConnectionState.closed);
                        })
                        .onclose(() => {
                            this._updateState(ConnectionState.closed);
                        });

                    ecdh = await crypto.subtle!.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
                    if (!ecdh.publicKey) return Promise.reject(ErrorMessage[ErrorCodes.EECDHGENF]);
                    ecdhPubKeyRaw = new Uint8Array(await crypto.subtle!.exportKey('raw', ecdh.publicKey)).subarray(1);
                    return new Promise((resolve, reject) => {
                        const tId = setTimeout(() => {
                            reject(ErrorMessage[ErrorCodes.ETIMOCHEL]);
                        }, 3000);
                        socket
                            .onmessage((x) => {
                                clearTimeout(tId);
                                resolve(x);
                            })
                            .send(ecdhPubKeyRaw);
                    });
                })
                .then(async (serverHello: Uint8Array): Promise<Uint8Array> => {
                    const pow = this._computeProofOfWork(serverHello.subarray(0, 32));
                    const clientProofOfWork = Utils.concatBytesArrays([pow, trustedKey]);
                    return new Promise((resolve, reject) => {
                        const tId = setTimeout(() => {
                            reject(ErrorMessage[ErrorCodes.ETIMOCPOW]);
                        }, 3000);
                        socket
                            .onmessage((x) => {
                                clearTimeout(tId);
                                resolve(x);
                            })
                            .send(clientProofOfWork);
                    });
                })
                .then(async (serverIdentity: Uint8Array): Promise<Uint8Array> => {
                    const preMasterSecret = serverIdentity.subarray(0, 32);
                    const serverEcdhPubKey = await crypto.subtle!.importKey(
                        'raw',
                        Utils.concatBytes(/*uncompressed*/ Uint8Array.from([4]), serverIdentity.subarray(32, 96)),
                        { name: 'ECDH', namedCurve: 'P-256' },
                        false,
                        []
                    );
                    serverEcdsaPubKey = await crypto.subtle!.importKey(
                        'raw',
                        Utils.concatBytes(/*uncompressed*/ Uint8Array.from([4]), serverIdentity.subarray(serverIdentity.length - 64)),
                        { name: 'ECDSA', namedCurve: 'P-256' },
                        false,
                        ['verify']
                    );

                    // Check inheritance from Secretarium knownTrustedKey
                    const knownTrustedKeyPath = serverIdentity.subarray(96);
                    if (!this._endpoint?.knownTrustedKey)
                        this._options.logger?.info?.('No knownTrustedKey provided, server identity will not be verified');
                    else if (knownTrustedKeyPath.length === 64) {
                        if (!Utils.sequenceEqual(trustedKey, knownTrustedKeyPath)) throw new Error(ErrorMessage[ErrorCodes.ETINSRVID]);
                    } else {
                        for (let i = 0; i < knownTrustedKeyPath.length - 64; i = i + 128) {
                            const key = knownTrustedKeyPath.subarray(i, 64);
                            const proof = knownTrustedKeyPath.subarray(i + 64, 64);
                            const keyChild = knownTrustedKeyPath.subarray(i + 128, 64);
                            const ecdsaKey = await crypto.subtle!.importKey('raw', Utils.concatBytes(/*uncompressed*/ Uint8Array.from([4]), key), { name: 'ECDSA', namedCurve: 'P-256' }, false, [
                                'verify'
                            ]);
                            if (!(await crypto.subtle!.verify({ name: 'ECDSA', hash: { name: 'SHA-256' } }, ecdsaKey, proof, keyChild))) throw new Error(`${ErrorMessage[ErrorCodes.ETINSRVIC]}${i}`);
                        }
                    }

                    if (!ecdh.privateKey) return Promise.reject(ErrorMessage[ErrorCodes.EECDHGENF]);

                    const commonSecret = await crypto.subtle!.deriveBits({ name: 'ECDH', namedCurve: 'P-256', public: serverEcdhPubKey } as any, ecdh.privateKey, 256);
                    const sha256Common = new Uint8Array(await crypto.subtle!.digest({ name: 'SHA-256' }, commonSecret));
                    const symmetricKey = Utils.xor(preMasterSecret, sha256Common);
                    const iv = symmetricKey.subarray(16);
                    const key = symmetricKey.subarray(0, 16);
                    const cryptoKey = await crypto.subtle!.importKey('raw', key, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
                    this._session = new SCPSession(iv, cryptoKey);

                    const cryptoKeyPair = userKey.getCryptoKeyPair();
                    const publicKeyRaw = await userKey.getRawPublicKey();
                    if (!userKey || !cryptoKeyPair?.privateKey || !publicKeyRaw) throw new Error(ErrorMessage[ErrorCodes.ETINUSRKY]);

                    const nonce = Utils.getRandomBytes(32);
                    const signedNonce = new Uint8Array(await crypto.subtle!.sign({ name: 'ECDSA', hash: { name: 'SHA-256' } }, cryptoKeyPair.privateKey, nonce));
                    const clientProofOfIdentity = Utils.concatBytesArrays([nonce, ecdhPubKeyRaw, publicKeyRaw, signedNonce]);

                    const encryptedClientProofOfIdentity = await this._encrypt(clientProofOfIdentity);
                    return new Promise((resolve, reject) => {
                        const tId = setTimeout(() => {
                            reject(ErrorMessage[ErrorCodes.ETIMOCPOI]);
                        }, 3000);
                        socket
                            .onmessage((x) => {
                                clearTimeout(tId);
                                resolve(x);
                            })
                            .send(encryptedClientProofOfIdentity);
                    });
                })
                .then(async (serverProofOfIdentityEncrypted: Uint8Array): Promise<void> => {
                    const serverProofOfIdentity = await this._decrypt(serverProofOfIdentityEncrypted);
                    const welcome = Utils.encode(Secrets.SRTWELCOME);
                    const toVerify = Utils.concatBytes(serverProofOfIdentity.subarray(0, 32), welcome);
                    const serverSignedHash = serverProofOfIdentity.subarray(32, 96);
                    const check = await crypto.subtle!.verify({ name: 'ECDSA', hash: { name: 'SHA-256' } }, serverEcdsaPubKey, serverSignedHash, toVerify);
                    if (!check) throw new Error(ErrorMessage[ErrorCodes.ETINSRVPI]);

                    socket.onmessage(async (encrypted) => {
                        try {
                            const data = await this._decrypt(encrypted);
                            if (!data)
                                return;
                            const json = Utils.decode(data);
                            this._notify(json);
                        } catch (e: any) {
                            console.error(e.name, e);
                        }
                    });

                    this._updateState(ConnectionState.secure);
                    resolve();
                })
                .catch((e: Error) => {
                    this._updateState(ConnectionState.closing);
                    socket.close();
                    this._updateState(ConnectionState.closed);
                    const error: string = e.message ?? (e as any).type ?? e.toString();
                    reject(`${ErrorMessage[ErrorCodes.EUNABLCON]}${error}`);
                });
        });
    }

    onError(handler: (err: string) => void): SCP {
        this._onError = handler;
        return this;
    }

    onStateChange(handler: (state: ConnectionState) => void): SCP {
        this._onStateChange = handler;
        return this;
    }

    isConnected(): boolean {
        return this._connectionState === ConnectionState.secure;
    }

    getEndpoint(): SCPEndpoint {
        return this._endpoint;
    }

    getCryptoContext(): { type: string; version?: string } {
        return (crypto as any).context;
    }

    newQuery<ResultType = any, ErrorType = any>(app: string, command: string, requestId?: string, args?: Record<string, unknown> | string): Query<ResultType, ErrorType> {
        const rid = requestId ?? `rid-${app}-${command}-${Date.now()}-${Math.floor(Math.random() * 1000000)}}`;
        let cbs: Partial<QueryNotificationHandlers<ResultType, ErrorType>> = {};
        const pm = new Promise<ResultType>((resolve, reject) => {
            this._requests[rid] = cbs = {
                onError: [],
                onResult: [],
                promise: {
                    resolve,
                    reject
                }
            };
        });
        const query: Query<ResultType, ErrorType> = {
            onError: (x) => {
                (cbs.onError = cbs.onError || []).push(x);
                return query;
            },
            onResult: (x) => {
                (cbs.onResult = cbs.onResult || []).push(x);
                return query;
            },
            send: async () => {
                this.send(app, command, rid, args);
                return pm;
            }
        };
        return query;
    }

    newTx<ResultType = any, ErrorType = any>(app: string, command: string, requestId?: string, args?: Record<string, unknown> | string): Transaction<ResultType, ErrorType> {
        const rid = requestId ?? `rid-${app}-${command}-${Date.now()}-${Math.floor(Math.random() * 1000000)}}`;
        let cbs: Partial<TransactionNotificationHandlers<ResultType, ErrorType>> = {};
        const pm = new Promise<ResultType>((resolve, reject) => {
            this._requests[rid] = (cbs) = {
                onError: [],
                onResult: [],
                onAcknowledged: [],
                onCommitted: [],
                onExecuted: [],
                onProposed: [],
                promise: {
                    resolve,
                    reject
                }
            };
        });
        const tx: Transaction<ResultType, ErrorType> = {
            onError: (x) => {
                (cbs.onError = cbs.onError || []).push(x);
                return tx;
            },
            onAcknowledged: (x) => {
                (cbs.onAcknowledged = cbs.onAcknowledged || []).push(x);
                return tx;
            },
            /**
         * @deprecated onPropose handlers were retired in Secretarium Core 1.0.0
         */
            onProposed: (x) => {
                (cbs.onProposed = cbs.onProposed || []).push(x);
                return tx;
            },
            onCommitted: (x) => {
                (cbs.onCommitted = cbs.onCommitted || []).push(x);
                return tx;
            },
            onExecuted: (x) => {
                (cbs.onExecuted = cbs.onExecuted || []).push(x);
                return tx;
            },
            onResult: (x) => {
                (cbs.onResult = cbs.onResult || []).push(x);
                return tx;
            }, // for chained tx + query
            send: async () => {
                this.send(app, command, rid, args);
                return pm;
            }
        };
        return tx;
    }

    private async _prepare(app: string, command: string, requestId: string, args?: Record<string, unknown> | string): Promise<Uint8Array> {

        const query = {
            dcapp: app,
            function: command,
            requestId: requestId,
            args: args ?? null
        };

        this._options.logger?.debug?.('Secretarium sending:', query);

        const data = Utils.encode(JSON.stringify(query));
        const encrypted = await this._encrypt(data);

        return encrypted;
    }

    async send(app: string, command: string, requestId: string, args?: Record<string, unknown> | string): Promise<void> {
        if (!this._socket || !this._session || this._socket.state !== ConnectionState.secure) {
            const z = this._requests[requestId]?.onError;
            if (z) {
                z.forEach((cb) => cb(ErrorMessage[ErrorCodes.ENOTCONNT], requestId));
                return;
            } else throw new Error(ErrorMessage[ErrorCodes.ENOTCONNT]);
        }

        const encrypted = await this._prepare(app, command, requestId, args);

        if (app !== '__local__')
            this._socket.send(encrypted);

    }

    close(): SCP {
        if (this._socket) this._socket.close();
        return this;
    }
}

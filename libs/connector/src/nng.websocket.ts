import { ConnectionState } from './secretarium.constant.js';
import BackingSocket from './secretarium.socket.js';
import { Utils } from '@secretarium/crypto';

export enum Protocol {
    pair1 = 'pair1.sp.nanomsg.org'
}

type EventHandler<T = Event> = (event: T) => void;

interface SocketHandlers {
    onclose?: EventHandler<CloseEvent>;
    onerror?: EventHandler;
    onmessage?: EventHandler<MessageEvent>;
    onopen?: EventHandler;
    onwrap?: (data: Uint8Array) => Uint8Array;
    onunwrap?: (data: Uint8Array) => Uint8Array;
}

export class WS {
    private _requiresHop: boolean;
    private _socket?: any;
    private readonly _handlers: SocketHandlers;

    constructor() {
        this._requiresHop = false;
        this._handlers = {};
    }

    get state(): ConnectionState {
        return this._socket?.readyState ?? ConnectionState.closed;
    }

    get bufferedAmount(): number {
        return this._socket?.bufferedAmount ?? 0;
    }

    private _addHop(data: Uint8Array) {
        const c = new Uint8Array(4 + data.length);
        c.set([0, 0, 0, 1], 0);
        c.set(data, 4);
        return c;
    }

    connect(url: string, protocol: Protocol = Protocol.pair1): this {
        try {
            const s = new BackingSocket(url, [protocol]);
            s.binaryType = 'arraybuffer';
            s.onopen = this._socket?.onopen ?? this._handlers.onopen ?? null;
            s.onclose = this._socket?.onclose ?? this._handlers.onclose ?? null;
            s.onmessage = this._socket?.onmessage ?? this._handlers.onmessage ?? null;
            s.onerror = this._socket?.onerror ?? this._handlers.onerror ?? null;
            this._requiresHop = protocol === Protocol.pair1;
            this._socket = s;
        } catch (e: any) {
            onerror = this._socket?.onerror ?? this._handlers.onerror ?? null;
            onerror?.(e);
        }
        return this;
    }

    onopen(handler: EventHandler): this {
        this._handlers.onopen = handler;
        if (this._socket) this._socket.onopen = handler;
        return this;
    }

    onclose(handler: EventHandler<CloseEvent>): this {
        this._handlers.onclose = handler;
        if (this._socket) this._socket.onclose = handler;
        return this;
    }

    onerror(handler: EventHandler): this {
        this._handlers.onerror = handler;
        if (this._socket) this._socket.onerror = handler;
        return this;
    }

    onUnwrap(handler: (data: Uint8Array) => Uint8Array): this {
        this._handlers.onunwrap = handler;
        return this;
    }

    unwrap(data: Uint8Array) {
        if (!this._handlers.onunwrap)
            return data;
        return this._handlers.onunwrap(data);
    }

    onmessage(handler: EventHandler<Uint8Array>): this {
        this._handlers.onmessage = (e: MessageEvent) => {
            const raw = e.data;
            let data = new Uint8Array(raw);
            if (typeof raw === 'string') {
                data = Utils.encode(raw);
            }
            if (this._requiresHop) data = data.subarray(4);
            data = this.unwrap(data);
            return handler && handler(data);
        };
        if (this._socket)
            this._socket.onmessage = this._handlers.onmessage;
        return this;
    }

    onWrap(handler: (data: Uint8Array) => Uint8Array): this {
        this._handlers.onwrap = handler;
        return this;
    }

    wrap(data: Uint8Array) {
        if (!this._handlers.onwrap)
            return data;
        return this._handlers.onwrap(data);
    }

    send(data: Uint8Array, chunkSize = 524288): this {

        let wrappedData = this.wrap(data);
        const length = wrappedData.length;
        if (length > chunkSize) {

            const chunksCount = Math.floor((length - 1) / chunkSize + 1);
            const offset = this._requiresHop ? 4 : 0;
            const frameSize = chunkSize + 20 + offset;
            const partialData = new Uint8Array(frameSize);

            if (this._requiresHop) partialData.set([0, 0, 0, 1], 0);

            // Magic header `chunk${chunkNumber}/${chunksCount}`
            partialData.set([99, 104, 117, 110, 107, 0, 47, chunksCount], offset);

            // Add total length of the data frame
            const totalLength = new Uint8Array(4);
            for (let i = 0; i < 4; i++)     totalLength[3 - i] = (length >> (i * 8)) & 0xff;
            partialData.set(totalLength, offset + 8);

            // Add a random id to differentiate messages (probably not necessary)
            partialData.set(Utils.getRandomBytes(8), offset + 12);

            // Sending the data
            for (let chunkNumber = 0; chunkNumber < chunksCount; chunkNumber++) {
                // Tagging the chunk number
                partialData[offset + 5] = chunkNumber;
                partialData.set(wrappedData.slice(chunkSize * chunkNumber, chunkSize * (chunkNumber + 1)), offset + 20);
                this._socket?.send(partialData);
            }
        } else {
            if (this._requiresHop)
                wrappedData = this._addHop(wrappedData);
            this._socket?.send(wrappedData);
        }
        return this;
    }

    close(): this {
        this._socket?.close();
        return this;
    }
}

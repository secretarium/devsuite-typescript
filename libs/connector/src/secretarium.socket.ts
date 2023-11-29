import * as NodeWebSocket from 'ws';

declare global {
    // eslint-disable-next-line no-var
    var MozWebSocket: WebSocket;
}

const selectSocket = () => {

    let ws = undefined;

    if (typeof WebSocket !== 'undefined') {
        ws = WebSocket;
    } else if (typeof MozWebSocket !== 'undefined') {
        ws = MozWebSocket;
    } else if (typeof global !== 'undefined') {
        ws = global.WebSocket || global.MozWebSocket;
    } else if (typeof window !== 'undefined') {
        ws = window.WebSocket || window.MozWebSocket;
    } else if (typeof self !== 'undefined') {
        ws = self.WebSocket || self.MozWebSocket;
    }

    return typeof ws !== 'undefined' ? WebSocket : NodeWebSocket.WebSocket;
};

export default selectSocket();

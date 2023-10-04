// import IsometricWS from '@d-fischer/isomorphic-ws';
import * as NodeWebSocket from 'ws';

const selectSocket = () => {
    return typeof window !== 'undefined' ? window.WebSocket : NodeWebSocket;
};

export default selectSocket();

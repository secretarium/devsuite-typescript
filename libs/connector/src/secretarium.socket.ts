// import IsometricWS from '@d-fischer/isomorphic-ws';
import NodeWebSocket from 'ws';

const selectSocket = () => {
    return typeof window !== 'undefined' ? window.WebSocket : NodeWebSocket;
};

export default selectSocket();

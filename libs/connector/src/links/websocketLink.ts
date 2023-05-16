import type { ConnectorLink, LinkConstructor, Server } from '../types';

export const WebSocketLink: LinkConstructor = class WebSocketLink implements ConnectorLink {
    public _;
    constructor(server: Server) {
        this._ = server;
    }
};

WebSocketLink.displayName = 'SecretariumConnectorWebSocketLink';

export default WebSocketLink;
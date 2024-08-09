import type { ConnectorLink, LinkConstructor, Server } from '../types.js';

export const HTTPSLink: LinkConstructor = class HTTPSLink implements ConnectorLink {
    public _;
    constructor(server: Server) {
        this._ = server;
    }
};

HTTPSLink.displayName = 'SecretariumConnectorHTTPSLink';

export default HTTPSLink;
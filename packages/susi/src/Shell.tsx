import { StrictMode } from 'react';
import { SecretariumConnector } from '@secretarium/connector';
import { SecretariumProvider } from '@secretarium/react';
import App from './App';

const connector = new SecretariumConnector({
    connections: {
        url: 'wss://swisscom-ch-zhh-2288-8.node.secretarium.org:443',
        trustKey: 'rliD_CISqPEeYKbWYdwa-L-8oytAPvdGmbLC0KdvsH-OVMraarm1eo-q4fte0cWJ7-kmsq8wekFIJK0a83_yCg=='
    }
});

export const Shell = () => {

    return <StrictMode>
        <SecretariumProvider connector={connector}>
            <App />
        </SecretariumProvider>
    </StrictMode>;
};

export default Shell;

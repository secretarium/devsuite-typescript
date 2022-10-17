import { StrictMode } from 'react';
// import { RecoilRoot } from 'recoil';
import { StatusBar } from 'expo-status-bar';
import { SecretariumConnector } from '@secretarium/connector';
import { SecretariumProvider } from '@secretarium/react';
import { Router } from './router/Router';
import { App } from './App';

const connector = new SecretariumConnector({
    connection: {
        kem: 'rsa',
        url: 'wss://swisscom-ch-zhh-2288-8.node.secretarium.org:443',
        trustKey: 'rliD_CISqPEeYKbWYdwa-L-8oytAPvdGmbLC0KdvsH-OVMraarm1eo-q4fte0cWJ7-kmsq8wekFIJK0a83_yCg=='
    }
});

export const Shell = () => {

    return <StrictMode>
        {/* <RecoilRoot> */}
        <StatusBar style="auto" />
        <SecretariumProvider connector={connector}>
            <Router>
                <App />
                Hello World
            </Router>
        </SecretariumProvider>
        {/* </RecoilRoot> */}
    </StrictMode>;
};

export default Shell;

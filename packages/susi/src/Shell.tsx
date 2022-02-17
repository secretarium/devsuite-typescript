import { StrictMode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SecretariumConnector } from '@secretarium/connector';
import { SecretariumProvider } from '@secretarium/react';
import App from './App';

const connector = new SecretariumConnector({
    connections: process.env.NX_SECRETARIUM_GATEWAYS
});

export const Shell = () => {

    return <StrictMode>
        <StatusBar style="auto" />
        <SecretariumProvider connector={connector}>
            <App />
        </SecretariumProvider>
    </StrictMode>;
};

export default Shell;
